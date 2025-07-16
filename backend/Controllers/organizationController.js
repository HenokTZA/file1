const organizationService = require('../Services/organizationService');
const { sendResponse } = require('../utils/responseHandler');

// Admin-only operations
exports.createOrganization = async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.name) {
        return sendResponse(res, 400, 'Organization name is required', null);
      }
  
      const organization = await organizationService.createOrganization(req.body);
      sendResponse(res, 201, 'Organization created successfully', organization);
    } catch (error) {
      sendResponse(res, 400, error.message, null);
    }
  };
exports.getOrganization = async (req, res) => {
  try {
    const organization = await organizationService.getOrganizationById(req.params.id);
    sendResponse(res, 200, 'Organization retrieved successfully', organization);
  } catch (error) {
    sendResponse(res, 404, error.message, null);
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await organizationService.getAllOrganizations({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search
    });
    sendResponse(res, 200, 'Organizations retrieved successfully', organizations);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const organization = await organizationService.updateOrganization(
      req.params.id,
      req.body
    );
    sendResponse(res, 200, 'Organization updated successfully', organization);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    await organizationService.deleteOrganization(req.params.id);
    sendResponse(res, 200, 'Organization deleted successfully', null);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

// Organization-specific operations (require organization ownership/admin)
exports.getMyOrganization = async (req, res) => {
  try {
    const organization = await organizationService.getOrganizationById(req.user.organization);
    sendResponse(res, 200, 'Organization retrieved successfully', organization);
  } catch (error) {
    sendResponse(res, 404, error.message, null);
  }
};

exports.updateMyOrganizationSettings = async (req, res) => {
  try {
    const organization = await organizationService.updateOrganizationSettings(
      req.user.organization,
      req.body
    );
    sendResponse(res, 200, 'Organization settings updated successfully', organization);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};

exports.updateMySubscription = async (req, res) => {
  try {
    const organization = await organizationService.updateSubscription(
      req.user.organization,
      req.body
    );
    sendResponse(res, 200, 'Subscription updated successfully', organization);
  } catch (error) {
    sendResponse(res, 400, error.message, null);
  }
};