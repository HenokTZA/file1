
const userService = require('../Services/userService');
const { 
  getFromCache, 
  setToCache, 
  deleteFromCache, 
  clearPattern,
  generateCacheKey
} = require('../redisUtils');

// Cache TTL configuration
const CACHE_TTL = {
  USER: 3600,        // 1 hour for individual users
  USER_LIST: 1800,   // 30 minutes for user lists
  DEFAULT: 1200      // 20 minutes default
};

class UserController {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const cacheKey = generateCacheKey('users', req.user.org_id);
      const {  User } = req.tenantModels;
     
      // Try cache first
      // const cachedUsers = await getFromCache(cacheKey);
      // if (cachedUsers) {
      //   console.log(`[Cache] Returning users from cache for org ${req.user.organization}`);
      //   return res.status(200).json({
      //     success: true,
      //     count: cachedUsers.length,
      //     data: cachedUsers,
      //     fromCache: true
      //   });
      // }
      const users = await userService.getAllUsers(req.user,User);
      
      // Cache the results
      // await setToCache(cacheKey, users, CACHE_TTL.USER_LIST);
      // console.log(`[Cache] Cached users for org ${req.user.organization}`);

      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  // Get single user
  async getUser(req, res, next) {
    try {
      const cacheKey = generateCacheKey('user', req.user.org_id, { id: req.params.id });
      const {  User } = req.tenantModels;
      // Try cache first
      // const cachedUser = await getFromCache(cacheKey);
      // if (cachedUser) {
      //   console.log(`[Cache] Returning user ${req.params.id} from cache`);
      //   return res.status(200).json({
      //     success: true,
      //     data: cachedUser,
      //     fromCache: true
      //   });
      // }

      const user = await userService.getUser(req.params.id, req.user,User);
      
      // Cache the result
      // await setToCache(cacheKey, user, CACHE_TTL.USER);
      // console.log(`[Cache] Cached user ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const {  User } = req.tenantModels;
      const user = await userService.updateUser(
        req.params.id, 
        req.body, 
        req.user,
        User
      );
      
      // Clear relevant cache entries
      // await Promise.all([
      //   deleteFromCache(generateCacheKey('user', req.user.organization, { id: req.params.id })),
      //   clearPattern(`users:org:${req.user.organization}*`)
      // ]);
      // console.log(`[Cache] Cleared cache for updated user ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: user,
        message: "User updated successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin update user
  async adminUpdateUser(req, res, next) {
    try {
      const {  User } = req.tenantModels;
      const user = await userService.adminUpdateUser(
        req.params.id, 
        req.body, 
        req.user,
        User
      );
      
      // Clear relevant cache entries
      // await Promise.all([
      //   deleteFromCache(generateCacheKey('user', req.user.organization, { id: req.params.id })),
      //   clearPattern(`users:org:${req.user.organization}*`)
      // ]);
      // console.log(`[Cache] Cleared cache for admin-updated user ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: user,
        message: "User updated successfully"
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    try {
      const {  User } = req.tenantModels;
      await userService.deleteUser(req.params.id, req.user,User);
      
      // Clear relevant cache entries
      // await Promise.all([
      //   deleteFromCache(generateCacheKey('user', req.user.organization, { id: req.params.id })),
      //   clearPattern(`users:org:${req.user.organization}*`)
      // ]);
      // console.log(`[Cache] Cleared cache for deleted user ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: {},
        message: "User deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();