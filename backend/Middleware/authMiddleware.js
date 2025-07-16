
const jwt = require('jsonwebtoken');

const { getOrganizationDB } = require('../config/dbManager');

const ROLES = {
  RANDOM_USER: 1,
  SERVICE_PERSONAL: 2,
  MANAGER: 3,
  FREE: 4,
  ADMIN: 5,
};
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing or malformed" });
  }

  const token = authHeader.split(" ")[1].trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    
    let user;
    if (decoded.isGlobalAdmin) {
      // 🔒 Super admin in MAIN DB
      const Superadmin = req.mainModels?.Superadmin;
      if (!Superadmin) {
        return res.status(500).json({ error: "Superadmin model not available" });
      }      user = await Superadmin.findById(decoded._id);
      if (!user) return res.status(404).json({ error: "Super admin not found" });

      req.user = user.toObject();
      req.isGlobalAdmin = true;
      return next();
    }

    // 🔐 Regular tenant user
    const tenantDB = await getOrganizationDB(decoded.tenantId || decoded.org_id);
    const User = tenantDB.models.get('User');
    user = await User.findById(decoded._id);
    if (!user) return res.status(404).json({ error: "Tenant user not found" });

    req.user = user.toObject();
    req.tenantDB = tenantDB;
    req.tenantId = decoded.tenantId || decoded.org_id;
    req.isGlobalAdmin = false;

    next();

  } catch (error) {
    console.log("error",error)
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware for random user (level 1)
const isRandomUser = (req, res, next) => {
  if (req.user.access_level >= ROLES.RANDOM_USER) {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Random user privileges required." });
};

// Middleware for service personnel (level 2)
const isServicePersonal = (req, res, next) => {
  if (req.user.access_level >= ROLES.SERVICE_PERSONAL) {
    return next();
  }
  console.log("access",req.user.access_level)
  return res.status(403).json({ error: "Access denied. Service personnel privileges required." });
};

// Middleware for manager (level 3)
const isManager = (req, res, next) => {
  if (req.user.access_level >= ROLES.MANAGER) {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Manager privileges required." });
};

// Middleware for free access (level 4)
const isFreeAccess = (req, res, next) => {
  // Check if the user has the free access level and the required roles
  if (req.user.access_level >= ROLES.FREE) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied. Collaborator or Project Manager role required for Free access.",
  });
};

// Middleware for admin (level 5)
const isAdmin = (req, res, next) => {
  if (req.user.access_level === ROLES.ADMIN) {
    return next();
  }
  console.log("req user",req.user.access_level);
  return res.status(403).json({ error: "Access denied. Admin privileges required." });
};
// Role-based authorization
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.access_level)) {
      return res.status(403).json({
        success: false,
        message: `User with access level ${req.user.access_level} is not authorized to access this route`
      });
    }
    next();
  };
};

const protect = async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1].trim();
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);

    let user;

    if (decoded.isGlobalAdmin) {
      // Handle global Superadmin
      const Superadmin = req.mainModels?.Superadmin;
      if (!Superadmin) {
        return res.status(500).json({ error: 'Superadmin model not available' });
      }

      user = await Superadmin.findById(decoded._id);
      if (!user) {
        return res.status(404).json({ error: 'Super admin not found' });
      }

      req.user = user.toObject();
      req.isGlobalAdmin = true;
      return next();
    }

    // Handle tenant user
    const tenantDB = await getOrganizationDB(decoded.tenantId || decoded.org_id);
    const User = tenantDB.models.get('User');

    user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ error: 'No user found with this id' });
    }

    req.user = user.toObject();
    req.tenantDB = tenantDB;
    req.tenantId = decoded.tenantId || decoded.org_id;
    req.isGlobalAdmin = false;

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

module.exports = {
  authenticateUser,
  isRandomUser,
  isServicePersonal,
  isManager,
  isFreeAccess,
  isAdmin,
  authorize,
  protect,
};