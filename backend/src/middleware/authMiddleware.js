export const authMiddleware = (req, res, next) => {
  // Extract placeholder user info from headers for now.
  // This will later be replaced by proper Supabase JWT verification.
  const userId = req.headers['x-user-id'];
  const shopId = req.headers['x-shop-id'];
  const userRole = req.headers['x-user-role'] || 'user';

  // If required placeholder values are missing, reject the request.
  if (!userId || !shopId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Attach user information to the request object.
  req.user = {
    id: userId,
    shop_id: shopId,
    role: userRole
  };

  next();
};

export const isAdmin = (req) => {
  return req.user && req.user.role === 'admin';
};

export const hasRole = (req, roles = []) => {
  if (!req.user || !req.user.role) return false;
  return roles.includes(req.user.role);
};
