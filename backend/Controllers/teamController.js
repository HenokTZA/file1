
const teamService = require('../Services/teamService');
const { sendResponse } = require('../utils/responseHandler');

exports.createTeam = async (req, res) => {
  try {
    const { Team, User } = req.tenantModels;

    const teamData = {
      ...req.body,
      organization: req.user.org_id
    };
    
    const team = await teamService.createTeam(teamData,Team,User);
   
    sendResponse(res, 201, 'Team created successfully', team);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.getTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const orgId = req.user.org_id;
    const { Team } = req.tenantModels;

    const team = await teamService.getTeamById(teamId, orgId,Team);
    
    sendResponse(res, 200, 'Team retrieved successfully', team);
  } catch (error) {
    sendResponse(res, 404, error.message, null);
  }
};

exports.getOrganizationTeams = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const { page = 1, limit = 10, search } = req.query;
    const { Team, User } = req.tenantModels;
    const teams = await teamService.getTeamsByOrganization(orgId, { page, limit, search },Team);
  
    sendResponse(res, 200, 'Teams retrieved successfully', teams);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const orgId = req.user.org_id;
    const { Team, User } = req.tenantModels;

    const team = await teamService.updateTeam(teamId, req.body, orgId,Team,User);
    
    sendResponse(res, 200, 'Team updated successfully', team);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const orgId = req.user.org_id;
    const { Team, User } = req.tenantModels;

    await teamService.deleteTeam(teamId, orgId,Team,User);
    
    sendResponse(res, 200, 'Team deleted successfully', null);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.addMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const orgId = req.user.org_id
    const { Team, User } = req.tenantModels;

    const team = await teamService.addTeamMember(
      teamId,
      req.body.userId,
      req.body.role || 'member',
      orgId,
      Team,
      User
    );
    
    sendResponse(res, 200, 'Member added successfully', team);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.removeMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const orgId = req.user.org_id;
    const { Team, User } = req.tenantModels;

    const team = await teamService.removeTeamMember(
      teamId,
      req.params.userId,
      orgId,
      Team,User
    );
   
    sendResponse(res, 200, 'Member removed successfully', team);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const orgId = req.user.org_id;
    const { Team, User } = req.tenantModels;

    const team = await teamService.updateMemberRole(
      teamId,
      req.params.userId,
      req.body.role,
      orgId,
      Team,
    
    );
    
    sendResponse(res, 200, 'Member role updated successfully', team);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};