const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// All routes protected
router.use(protect);

// User management routes
router.get('/', authorize([2,3, 4, 5]), userController.getAllUsers); 
router.get('/:id', userController.getUser); // Users can view their own profile
router.put('/:id', userController.updateUser); // Users can update their own profile
router.put('/:id/admin', authorize([4, 5]), userController.adminUpdateUser); // Admins can update any user
router.delete('/:id', authorize([5]), userController.deleteUser); // Only super admins can delete users

module.exports = router;