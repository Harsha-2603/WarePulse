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

    // Fetch user profile from public.users table using the authenticated user's email
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.user.email)
      .maybeSingle();

    console.log("AUTH USER EMAIL:", authUser.user.email);
    console.log("DB USER:", dbUser);

    if (dbError || !dbUser) {
      console.warn(`User profile lookup failed for email ${authUser.user.email}:`, dbError?.message || 'Profile not found');
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

    console.log("=== TENANT DEBUG START ===");
    console.log("REQ QUERY SHOP ID:", req.query.shop_id);
    console.log("AUTH HEADER:", req.headers.authorization);
    console.log("AUTH USER:", authUser);
    console.log("DB USER:", dbUser);
    console.log("DB USER SHOP ID:", dbUser?.shop_id);
    console.log("=== TENANT DEBUG END ===");

    // Enforce shop isolation: if req specifies shop_id in query, must match user's shop_id safely using strings
    if (req.query.shop_id) {
      if (String(req.query.shop_id) !== String(req.user.shop_id)) {
        return res.status(403).json({
          error: "Access forbidden: Shop isolation mismatch"
        });
      }
    }

    // Additional fallback validation for body/params if present
    const reqShopId = req.body?.shop_id || req.params?.shop_id;
    if (reqShopId) {
      if (!req.user.shop_id || String(reqShopId) !== String(req.user.shop_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: Shop isolation mismatch'
        });
      }
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
