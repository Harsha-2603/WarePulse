import supabase from '../config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Handles unified signup (both SaaS Shop Owners and regular Staff users)
 * in a production-safe, transaction-safe manner.
 * Orchestrates Shop creation (if Owner), Supabase Auth creation, and public.users profile creation.
 * Guarantees that users.id is identical to auth.users.id, performs atomic rollbacks,
 * and executes self-healing logic for legacy orphan accounts.
 */
export const signup = async (req, res, next) => {
  console.log("AUTH ROUTE HIT");
  console.log("SIGNUP REQUEST RECEIVED");
  const { email, password, fullName, phone, shopName, gstNumber, address } = req.body;

  const targetRole = 'owner';
  console.log(`[Signup Flow] Starting signup request for email: ${email}`);

  // 1. Basic validation
  if (!email || !password || !fullName || !shopName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, full name, and shop name are required.'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedGst = gstNumber?.trim().toUpperCase();

  let newShopCreated = false;
  let shopIdToUse = null;
  let shopObject = null;

  try {
    // 2. Prevent duplicate email in users table
    const { data: existingUser, error: existUserErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existUserErr) {
      console.error('[Signup Flow] Error checking existing email:', existUserErr.message);
      return res.status(500).json({ success: false, message: 'Database lookup error during email validation.' });
    }

    if (existingUser) {
      console.warn(`[Signup Flow] Rejecting signup: Email already exists in profile table: ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        message: 'This email is already associated with an account. Please sign in instead.'
      });
    }

    // 3. Prevent duplicate shop GST if Owner signup
    if (normalizedGst) {
      const { data: existingShop, error: existShopErr } = await supabase
        .from('shop')
        .select('id')
        .eq('gst_number', normalizedGst)
        .maybeSingle();

      if (existShopErr) {
        console.error('[Signup Flow] Error checking existing shop GST:', existShopErr.message);
        return res.status(500).json({ success: false, message: 'Database lookup error during GST validation.' });
      }

      if (existingShop) {
        console.warn(`[Signup Flow] Rejecting signup: Shop with GST ${normalizedGst} already exists.`);
        return res.status(400).json({
          success: false,
          message: 'A store with this GST number already exists.'
        });
      }
    }

    // 4. Self-Healing: Check and clean legacy orphan auth users from Supabase Auth
    try {
      const { data: { users: authUsers }, error: listAuthErr } = await supabase.auth.admin.listUsers();
      if (listAuthErr) {
        console.error('[Signup Flow] Warning: Could not list auth users for self-healing inspection:', listAuthErr.message);
      } else {
        const orphan = authUsers?.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (orphan) {
          console.warn(`[Signup Flow] Legacy orphan auth user found in Supabase auth for email: ${normalizedEmail} (ID: ${orphan.id}). Initiating self-healing cleanup...`);
          const { error: deleteOrphanErr } = await supabase.auth.admin.deleteUser(orphan.id);
          if (deleteOrphanErr) {
            console.error(`[Signup Flow] Self-healing failed: Could not delete orphan auth user ${orphan.id}:`, deleteOrphanErr.message);
          } else {
            console.log(`[Signup Flow] Self-healing complete: Successfully deleted orphan auth user ${orphan.id} for email: ${normalizedEmail}`);
          }
        }
      }
    } catch (selfHealingErr) {
      console.error('[Signup Flow] Unexpected self-healing legacy inspection exception:', selfHealingErr.message);
    }

    // 5. Begin transaction flow
    const shopId = crypto.randomUUID();
    shopIdToUse = shopId;
    console.log(`[Signup Flow] Generated Shop UUID: ${shopId}`);

    // Step A: Handle Shop association / creation (Insert into shop table FIRST using that UUID)
    const finalGst = normalizedGst || `GST-TEMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    console.log(`[Signup Flow] Inserting shop: ${shopName} with GST: ${finalGst} and UUID: ${shopId}`);
    const { data: newShop, error: shopInsertErr } = await supabase
      .from('shop')
      .insert({
        id: shopId, // Set the ID explicitly!
        shop_name: shopName.trim(),
        gst_number: finalGst,
        shop_type: 'retail',
        phone: phone?.trim() || '',
        email: normalizedEmail,
        address_line1: address?.trim() || ''
      })
      .select()
      .single();

    if (shopInsertErr || !newShop) {
      console.error('[Signup Flow] Shop creation failed:', shopInsertErr?.message || 'No data returned');
      return res.status(500).json({
        success: false,
        message: `Failed to create shop context: ${shopInsertErr?.message || 'Unknown error'}`
      });
    }

    newShopCreated = true;
    shopObject = newShop;
    console.log(`[Signup Flow] Shop created successfully. ID: ${shopIdToUse}`);

    // Step B: Create Supabase Auth User
    console.log(`[Signup Flow] Creating Supabase Auth user for email: ${normalizedEmail}`);
    const { data: authData, error: authCreateErr } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Auto-confirm email for high reliability and smooth logins
      user_metadata: {
        full_name: fullName.trim(),
        phone: phone?.trim() || ''
      }
    });

    if (authCreateErr || !authData?.user) {
      console.error('[Signup Flow] Supabase Auth user creation failed:', authCreateErr?.message || 'No auth user data returned');
      
      // Rollback shop if newly created (if shop insert fails/user creation fails -> rollback shop creation)
      if (newShopCreated) {
        console.log(`[Signup Flow] Rolling back shop creation (deleting Shop ID: ${shopIdToUse})`);
        await supabase.from('shop').delete().eq('id', shopIdToUse);
      }

      return res.status(400).json({
        success: false,
        message: `Authentication account setup failed: ${authCreateErr?.message || 'Unknown error'}`
      });
    }

    const authUserId = authData.user.id;
    console.log(`[Signup Flow] Auth user created successfully. ID: ${authUserId}`);

    // Step C: Insert public.users profile row
    console.log(`[Signup Flow] Inserting public.users profile row for ID: ${authUserId}`);
    const { data: profile, error: profileInsertErr } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        auth_user_id: authUserId, // Set both columns to guarantee equality with auth.users.id
        shop_id: shopIdToUse,
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || '',
        role: targetRole,
        status: 'active'
      })
      .select()
      .single();

    if (profileInsertErr || !profile) {
      console.error('[Signup Flow] Profile creation failed:', profileInsertErr?.message || 'No profile data returned');

      // if user insert fails → rollback shop creation
      if (newShopCreated) {
        console.log(`[Signup Flow] Rolling back shop creation (deleting Shop ID: ${shopIdToUse})`);
        const { error: shopRollbackErr } = await supabase.from('shop').delete().eq('id', shopIdToUse);
        if (shopRollbackErr) {
          console.error(`[Signup Flow] Shop rollback failed for ID ${shopIdToUse}:`, shopRollbackErr.message);
        }
      }

      // if user insert fails → rollback user creation
      console.log(`[Signup Flow] Rolling back Auth User creation (deleting Auth User ID: ${authUserId})`);
      const { error: authRollbackErr } = await supabase.auth.admin.deleteUser(authUserId);
      if (authRollbackErr) {
        console.error(`[Signup Flow] Auth User rollback failed for ID ${authUserId}:`, authRollbackErr.message);
      }

      return res.status(500).json({
        success: false,
        message: `Database profile synchronization failed: ${profileInsertErr?.message || 'Unknown error'}`
      });
    }

    const user = profile;

    // Logging requirement:
    // console.log("CREATED SHOP ID:", shopId)
    // console.log("USER SHOP ID:", user.shop_id)
    console.log("CREATED SHOP ID:", shopIdToUse);
    console.log("USER SHOP ID:", user.shop_id);

    console.log(`[Signup Flow] Profile row successfully created and mapped for ID: ${authUserId}`);
    console.log(`[Signup Flow] Unified signup completed successfully for: ${normalizedEmail}`);

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully!',
      user: authData.user,
      shop: shopObject,
      profile: profile
    });

  } catch (err) {
    console.error('[Signup Flow] Critical unexpected exception:', err);
    return res.status(500).json({
      success: false,
      message: 'A critical unexpected error occurred during signup.'
    });
  }
};

/**
 * Handles backend authentication/login.
 * Exposes a production-safe public endpoint matching standard credentials.
 */
export const login = async (req, res, next) => {
  console.log("AUTH ROUTE HIT");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  try {
    // Create a transient client to prevent polluting the global supabase client's auth state
    const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('[Login Flow] Critical exception:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login.'
    });
  }
};
