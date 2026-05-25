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

    // Strategy 1: Look up by 'auth_user_id' column (designed column to match auth.users.id)
    const authUserLookup = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (authUserLookup.data) {
      dbUser = authUserLookup.data;
      console.log(`[authMiddleware] Strategy 1 Succeeded: Found profile by auth_user_id.`);
    } else if (authUserLookup.error) {
      dbError = authUserLookup.error;
      console.error(`[authMiddleware] Strategy 1 Error (auth_user_id lookup):`, authUserLookup.error.message);
    }

    // Strategy 2: Look up by 'id' column (primary key column fallback)
    if (!dbUser) {
      const idLookup = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (idLookup.data) {
        dbUser = idLookup.data;
        console.log(`[authMiddleware] Strategy 2 Succeeded: Found profile by primary key id.`);
      } else if (idLookup.error) {
        dbError = idLookup.error;
        console.error(`[authMiddleware] Strategy 2 Error (id lookup):`, idLookup.error.message);
      }
    }

    // Strategy 3: Look up by email (fallback in case only email matches, case-insensitive)
    if (!dbUser && authEmail) {
      const emailLookup = await supabase
        .from('users')
        .select('*')
        .eq('email', authEmail.trim().toLowerCase())
        .maybeSingle();

      if (emailLookup.data) {
        dbUser = emailLookup.data;
        console.log(`[authMiddleware] Strategy 3 Succeeded: Found profile by email.`);
      } else if (emailLookup.error) {
        dbError = emailLookup.error;
        console.error(`[authMiddleware] Strategy 3 Error (email lookup):`, emailLookup.error.message);
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

    // Normalize 'user' role to 'staff' for application compatibility
    if (req.user.role === 'user') {
      req.user.role = 'staff';
    }

    // Enforce role validation: support owner, admin, manager, staff
    const allowedRoles = ['owner', 'admin', 'manager', 'staff'];
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

    // Validate Body Shop ID
    if (bodyShopId && String(bodyShopId) !== String(req.user.shop_id)) {
      console.warn(`[authMiddleware] Rejection: Body shop_id mismatch. Request: ${bodyShopId}, Profile: ${req.user.shop_id}`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Shop isolation mismatch (Body)'
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
  return req.user && ['owner', 'admin'].includes(req.user.role);
};

export const hasRole = (req, roles = []) => {
  if (!req.user || !req.user.role) return false;
  return roles.includes(req.user.role);
};
