import { createClient } from '@supabase/supabase-js';
import supabase from '../config/supabaseClient.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required'
    });
  }

  // Extract the raw token
  const token = authHeader.split(' ')[1];
  console.log("TOKEN:", token);

  try {
    // Validate token directly with Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token'
      });
    }

    const authUser = authData;

    // Fetch user profile from public.users table using a multi-strategy production-safe lookup
    let dbUser = null;
    let dbError = null;

    const authUserId = authUser.user.id;
    const authEmail = authUser.user.email;

    console.log(`[authMiddleware] Attempting user profile lookup. Auth User ID: ${authUserId}, Email: ${authEmail}`);

    // Create a request-specific Supabase client using the user's active token to guarantee RLS compatibility
    const userSupabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Strategy 1: Look up using global client (service-role bypassed RLS) via auth_user_id
    let authUserLookup = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (authUserLookup.data) {
      dbUser = authUserLookup.data;
      console.log(`[authMiddleware] Strategy 1 Succeeded (Global Admin): Found profile by auth_user_id.`);
    } else {
      // Fallback Strategy 1.2: Look up using user-authenticated client (RLS compatible) via auth_user_id
      const userAuthLookup = await userSupabaseClient
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (userAuthLookup.data) {
        dbUser = userAuthLookup.data;
        console.log(`[authMiddleware] Strategy 1.2 Succeeded (User Auth Context): Found profile by auth_user_id.`);
      } else if (userAuthLookup.error) {
        dbError = userAuthLookup.error;
        console.error(`[authMiddleware] Strategy 1.2 Error:`, userAuthLookup.error.message);
      }
    }

    // Strategy 2: Look up by 'id' column (primary key column fallback)
    if (!dbUser) {
      // Global admin
      const idLookup = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (idLookup.data) {
        dbUser = idLookup.data;
        console.log(`[authMiddleware] Strategy 2 Succeeded (Global Admin): Found profile by id.`);
      } else {
        // User Auth Context
        const userIdLookup = await userSupabaseClient
          .from('users')
          .select('*')
          .eq('id', authUserId)
          .maybeSingle();

        if (userIdLookup.data) {
          dbUser = userIdLookup.data;
          console.log(`[authMiddleware] Strategy 2.2 Succeeded (User Auth Context): Found profile by id.`);
        } else if (userIdLookup.error) {
          dbError = userIdLookup.error;
          console.error(`[authMiddleware] Strategy 2.2 Error:`, userIdLookup.error.message);
        }
      }
    }

    // Strategy 3: Look up by email (fallback, case-insensitive)
    if (!dbUser && authEmail) {
      // Global admin
      const emailLookup = await supabase
        .from('users')
        .select('*')
        .eq('email', authEmail.trim().toLowerCase())
        .maybeSingle();

      if (emailLookup.data) {
        dbUser = emailLookup.data;
        console.log(`[authMiddleware] Strategy 3 Succeeded (Global Admin): Found profile by email.`);
      } else {
        // User Auth Context
        const userEmailLookup = await userSupabaseClient
          .from('users')
          .select('*')
          .eq('email', authEmail.trim().toLowerCase())
          .maybeSingle();

        if (userEmailLookup.data) {
          dbUser = userEmailLookup.data;
          console.log(`[authMiddleware] Strategy 3.2 Succeeded (User Auth Context): Found profile by email.`);
        } else if (userEmailLookup.error) {
          dbError = userEmailLookup.error;
          console.error(`[authMiddleware] Strategy 3.2 Error:`, userEmailLookup.error.message);
        }
      }
    }

    // Detailed production-safe logging
    console.log("=== USER PROFILE RETRIEVAL SUMMARY ===");
    console.log("- Auth User ID:", authUserId);
    console.log("- Auth Email:", authEmail);
    console.log("- Fetched Profile:", dbUser ? JSON.stringify(dbUser) : "NULL");
    console.log("- Shop ID:", dbUser?.shop_id || "MISSING");
    console.log("- DB Error:", dbError ? dbError.message : "NONE");
    console.log("======================================");

    if (dbError || !dbUser) {
      console.warn(`[authMiddleware] User profile lookup failed for ID ${authUserId} / email ${authEmail}:`, dbError?.message || 'Profile not found');
    }

    // Attach decoded details to request user property
    if (!dbUser) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: User profile not found'
      });
    }

    req.user = dbUser;

    // Ensure req.user.shop_id exists
    if (!req.user.shop_id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Shop association missing'
      });
    }

    // Enforce role validation: support owner strictly
    const allowedRoles = ['owner'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Invalid role assignment'
      });
    }

    // Extract shop_id from all possible request inputs
    const queryShopId = req.query?.shop_id;
    const bodyShopId = req.body?.shop_id;
    const paramShopId = req.params?.shop_id;
    const headerShopId = req.headers['x-shop-id'] || req.headers['x-shop-id'.toLowerCase()];

    console.log("=== SHOP AUTHORIZATION AUDIT ===");
    console.log("- Authenticated User:", req.user.email);
    console.log("- User Profile Shop ID:", req.user.shop_id);
    console.log("- Request Query Shop ID:", queryShopId || "NONE");
    console.log("- Request Body Shop ID:", bodyShopId || "NONE");
    console.log("- Request Param Shop ID:", paramShopId || "NONE");
    console.log("- Request Header x-shop-id:", headerShopId || "NONE");
    console.log("================================");

    // Validate Query Shop ID
    if (queryShopId && String(queryShopId) !== String(req.user.shop_id)) {
      console.warn(`[authMiddleware] Rejection: Query shop_id mismatch. Request: ${queryShopId}, Profile: ${req.user.shop_id}`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Shop isolation mismatch (Query)'
      });
    }

    // Validate Params Shop ID
    if (paramShopId && String(paramShopId) !== String(req.user.shop_id)) {
      console.warn(`[authMiddleware] Rejection: Params shop_id mismatch. Request: ${paramShopId}, Profile: ${req.user.shop_id}`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Shop isolation mismatch (Params)'
      });
    }

    // Validate Header Shop ID
    if (headerShopId && String(headerShopId) !== String(req.user.shop_id)) {
      console.warn(`[authMiddleware] Rejection: Header x-shop-id mismatch. Request: ${headerShopId}, Profile: ${req.user.shop_id}`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Shop isolation mismatch (Header)'
      });
    }

    console.log({
      authUserId: req.user.id,
      role: req.user.role,
      shopId: req.user.shop_id,
      endpoint: req.originalUrl
    });

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

export const isAdmin = (req) => {
  return req.user && req.user.role === 'owner';
};

export const hasRole = (req, roles = []) => {
  if (!req.user || !req.user.role) return false;
  return roles.includes(req.user.role) || req.user.role === 'owner';
};
