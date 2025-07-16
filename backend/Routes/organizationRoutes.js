const express = require('express');
const router = express.Router();
const organizationController = require('../Controllers/organizationController');
// const { protect, authorize } = require('../middlewares/auth');

// Admin-only routes
router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganization);
router.put('/:id',  organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

// Organization member routes (require organization membership)
router.get('/me',  organizationController.getMyOrganization);
router.put('/me/settings', organizationController.updateMyOrganizationSettings);
router.put('/me/subscription', organizationController.updateMySubscription);
// router.post('/', protect, authorize([5]), organizationController.createOrganization);
// router.get('/', protect, authorize([5]), organizationController.getAllOrganizations);
// router.get('/:id', protect, authorize([5]), organizationController.getOrganization);
// router.put('/:id', protect, authorize([5]), organizationController.updateOrganization);
// router.delete('/:id', protect, authorize([5]), organizationController.deleteOrganization);

// // Organization member routes (require organization membership)
// router.get('/me', protect, organizationController.getMyOrganization);
// router.put('/me/settings', protect, authorize([3, 4, 5]), organizationController.updateMyOrganizationSettings);
// router.put('/me/subscription', protect, authorize([4, 5]), organizationController.updateMySubscription);

module.exports = router;