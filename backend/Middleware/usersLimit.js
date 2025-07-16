// // middleware/usersLimit.js
// const User = require('../Models/UserSchema');

// const checkUserLimit = async (req, res, next) => {
//   try {
//     const adminUser = await User.findById(req.user._id);
    
//     if (!adminUser || adminUser.access_level !== 5 || !adminUser.max_permitted_user_amount) {
//       return next();
//     }

//     const currentUserCount = await User.countDocuments({
//       organization: adminUser.organization,
//       isActive: true
//     });

//     if (currentUserCount >= adminUser.max_permitted_user_amount) {
//       return res.status(403).json({
//         success: false,
//         error: {
//           code: 'USER_LIMIT_REACHED',
//           message: 'Maximum user limit reached',
//           details: {
//             currentCount: currentUserCount,
//             maxAllowed: adminUser.max_permitted_user_amount,
//             resourceType: 'user',
//             limitType: 'organization',
//             upgradeAvailable: adminUser.subscription_type === 'free'
//           },
//           actions: [
//             {
//               label: 'Upgrade subscription',
//               url: '/subscription/upgrade',
//               method: 'GET'
//             }
//           ]
//         }
//       });
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Make sure to export the middleware
// module.exports = checkUserLimit;
// middleware/usersLimit.js

const mongoose = require('mongoose');

const checkUserLimit = async (req, res, next) => {
  try {
    const isGlobalAdmin = req.user?.isGlobalAdmin;
console.log("req.user",req.user)
    // Use appropriate User model
    const UserModel = req.mainModels?.Superadmin
      

    if (!UserModel) {
      return res.status(500).json({ success: false, message: 'User model not available' });
    }

    // Load user from DB
    const adminUser = await UserModel.findById(req.user._id);
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Skip limit check for non-admins or if no limit is set
    if (
      adminUser.access_level !== 5 || 
      !adminUser.max_permitted_user_amount || 
      isGlobalAdmin
    ) {
      return next();
    }

    // Get tenant User model for counting users
    const TenantUserModel = req.tenantModels?.User || (req.tenantDB && req.tenantDB.model('User'));

    if (!TenantUserModel) {
      return res.status(500).json({ success: false, message: 'Tenant User model not available' });
    }

    // Count active users in the tenant DB
    const activeUserCount = await TenantUserModel.countDocuments({
      organization: adminUser.organization || adminUser.org_id,
      isActive: true
    });
    if (activeUserCount >= adminUser.max_permitted_user_amount) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'USER_LIMIT_REACHED',
          message: 'Maximum user limit reached',
          details: {
            currentCount: activeUserCount,
            maxAllowed: adminUser.max_permitted_user_amount,
            resourceType: 'user',
            limitType: 'organization',
            upgradeAvailable: adminUser.subscription_type === 'free'
          },
          actions: [
            {
              label: 'Upgrade subscription',
              url: '/subscription/upgrade',
              method: 'GET'
            }
          ]
        }
      });
    }

    next();
  } catch (error) {
    console.error('User limit middleware error:', error);
    next(error);
  }
};

module.exports = checkUserLimit;
