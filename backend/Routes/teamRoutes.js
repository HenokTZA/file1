const express = require('express');
const router = express.Router();
const teamController = require('../Controllers/teamController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// All routes protected
router.use(protect);

// Basic team CRUD
router.post('/', authorize([3, 4, 5]), teamController.createTeam);
router.get('/', teamController.getOrganizationTeams);
router.get('/:id', teamController.getTeam);
router.put('/:id', authorize([3, 4, 5]), teamController.updateTeam);
router.delete('/:id', authorize([4, 5]), teamController.deleteTeam);

// Team member management
router.post('/:teamId/members', authorize([3, 4, 5]), teamController.addMember);
router.delete('/:teamId/members/:userId', authorize([3, 4, 5]), teamController.removeMember);
router.patch('/:teamId/members/:userId/role', authorize([4, 5]), teamController.updateMemberRole);

module.exports = router;