// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');
router.get('/', notificationController.getUserNotifications);
router.patch('/read', notificationController.markNotificationsRead);

module.exports = router;
