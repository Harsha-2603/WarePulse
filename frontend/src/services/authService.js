import { supabase } from '../lib/supabase';
import { BASE_URL } from '../utils/config';

/**
 * Supabase Authentication Service
 *
 * Handles signup, login, logout and session retrieval.
 * On signup the auth user is created first, then a row is inserted
 * into the public.users table so the rest of the app can look up
 * profile data (full_name, role, shop_id, etc.).
 */

/**


/**
 * Sign up a new SaaS customer (owner user + new shop).
 *
 * @param {Object}  params
 * @param {string}  params.email
 * @param {string}  params.password
 * @param {string}  params.fullName
 * @param {string}  params.phone
 * @param {string}  params.shopName
 * @param {string}  [params.gstNumber]
 * @param {string}  [params.address]
 * @returns {Promise<{user: object, shop: object, profile: object}>}
 */
/**
 * Helper function to create a new shop for a user.
 * Ensures duplicate prevention based on GST number.
 *
 * @param {Object}  params
 * @param {string}  params.shopName
 * @param {string}  [params.gstNumber]
 * @param {string}  [params.phone]
 * @param {string}  params.email
 * @param {string}  [params.address]
 * @returns {Promise<object>} The created or retrieved shop object
 */
export async function createShopForUser({ shopName, gstNumber, phone, email, address }) {
  const finalGst = gstNumber?.trim() || `GST-TEMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const finalShopName = shopName?.trim() || `Shop for ${email}`;

  // Check if a shop with this GST number already exists to avoid unique constraint violations
  const { data: existingShop, error: getShopError } = await supabase
    .from('shop')
    .select('id, shop_name, gst_number')
    .eq('gst_number', finalGst)
    .maybeSingle();

  if (existingShop) {
    console.log("Found existing shop with GST:", finalGst);
    return existingShop;
  }

  const { data: shop, error: shopError } = await supabase
    .from('shop')
    .insert({
      shop_name: finalShopName,
      gst_number: finalGst,
      shop_type: 'retail', // Default
      phone: phone || '',
      email: email || '',
      address_line1: address || '',
    })
    .select()
    .single();

  if (shopError) {
    console.error('createShopForUser failed:', shopError.message);
    throw new Error(`Failed to create shop: ${shopError.message}`);
  }

  return shop;
}

/**
 * Helper function to create a user profile in the public.users table.
 * Ensures duplicate prevention.
 *
 * @param {Object}  params
 * @param {string}  params.id        The auth.users.id
 * @param {string}  params.shopId    The shop.id
 * @param {string}  params.fullName
 * @param {string}  params.email
 * @param {string}  [params.phone]
 * @param {string}  [params.role='owner']
 * @param {string}  [params.status='active']
 * @returns {Promise<object>} The created or retrieved profile object
 */
export async function createUserProfile({ id, shopId, fullName, email, phone, role = 'owner', status = 'active' }) {
  // Check if profile already exists to prevent duplicate insertion error
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id, shop_id, role, full_name, email')
    .eq('id', id)
    .maybeSingle();

  if (existingProfile) {
    console.log("Found existing profile for user:", id);
    return existingProfile;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert({
      id,
      shop_id: shopId,
      full_name: fullName || email.split('@')[0],
      email: email,
      phone: phone || '',
      role: role,
      status: status,
    })
    .select()
    .single();

  if (profileError) {
    console.error('createUserProfile failed:', profileError.message);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  return profile;
}

/**
 * Sign up a new SaaS customer (owner user + new shop).
 *
 * @param {Object}  params
 * @param {string}  params.email
 * @param {string}  params.password
 * @param {string}  params.fullName
 * @param {string}  params.phone
 * @param {string}  params.shopName
 * @param {string}  [params.gstNumber]
 * @param {string}  [params.address]
 * @returns {Promise<{user: object, shop: object, profile: object}>}
 */
export async function signupOwner({ email, password, fullName, phone, shopName, gstNumber, address }) {
  // 1. Trigger the transaction-safe backend signup endpoint
  const url = `${BASE_URL}/auth/signup`;
  console.log('[Auth Service] Directing signupOwner request to backend:', url);

  const apiUrl = url;
  console.log("API URL:", apiUrl);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      phone,
      shopName,
      gstNumber,
      address
    })
  });

  const resData = await response.json();

  if (!response.ok || !resData.success) {
    console.error('[Auth Service] Backend signup failed:', resData.message || 'Unknown backend failure');
    throw new Error(resData.message || 'An error occurred during store registration.');
  }

  // 2. Automatically log the user in to establish active Supabase Auth session instantly!
  console.log('[Auth Service] Backend registration succeeded. Logging in user automatically...');
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (sessionError) {
    console.error('[Auth Service] Post-registration auto-login failed:', sessionError.message);
    throw new Error('Registration was successful, but auto-login failed. Please sign in manually.');
  }

  return {
    user: resData.user,
    shop: resData.shop,
    profile: resData.profile,
    session: sessionData.session,
    emailVerificationPending: false
  };
}

/**
 * Sign in with email + password.
 *
 * @param {Object}  params
 * @param {string}  params.email
 * @param {string}  params.password
 * @returns {Promise<{user: object, session: object}>}
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user, session: data.session };
}

/**
 * Sign out the current user and clear the session.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Retrieve the currently authenticated user (from the existing session).
 *
 * @returns {Promise<object|null>}  The Supabase user object or null.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    // Session expired / invalid — treat as "no user"
    return null;
  }
  return user;
}

/**
 * Fetch the public.users profile for a given auth user id.
 *
 * @param {string} userId  UUID matching auth.users.id and public.users.id
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, shop_id, status')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch user profile:', error.message);
    return null;
  }

  return data;
}

/**
 * Subscribe to auth state changes (login, logout, token refresh).
 * Returns the unsubscribe function.
 *
 * @param {function} callback  Called with (event, session)
 * @returns {function} unsubscribe
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * Retrieve the current active session.
 *
 * @returns {Promise<object|null>} The Supabase session object or null.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to get session:', error.message);
    return null;
  }
  return session;
}

const authService = { signupOwner, login, logout, getCurrentUser, getUserProfile, onAuthStateChange, getSession, createShopForUser, createUserProfile };
export default authService;

