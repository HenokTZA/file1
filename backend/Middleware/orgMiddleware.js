
const { getOrganizationDB } = require('../config/dbManager');
const { getTenantRedis } = require('../utils/tenantRedis'); 
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  try {
    // Skip middleware for public/auth routes
    if (req.path.startsWith('/auth/login') || req.path.startsWith('/public')) {
      return next();
    }

    // Determine organization ID (tenant context)
    const orgId = 
      req.user?.org_id
      req.tenantId ||
      req.headers['x-org-id'] ||
      req.hostname.split('.')[0]; // for subdomain-based tenancy

    if (!orgId) {
      return res.status(400).json({ 
        success: false,
        error: 'Organization context required',
        suggestions: [
          'Include X-Org-ID header',
          'Use subdomain-based routing',
          'Authenticate with org-scoped token'
        ]
      });
    }

    // Get tenant connection
    const tenantConn = await getOrganizationDB(orgId);

    // Attach tenant connection and models
    req.tenantConnection = tenantConn;
    req.tenantDB = tenantConn.connection;
    req.tenantModels = {
      User: tenantConn.models.get('User'),
      ResourceType: tenantConn.models.get('ResourceType'),
      Resource: tenantConn.models.get('Resource'),
      Task: tenantConn.models.get('Task'),
      Team: tenantConn.models.get('Team'),
      Notification: tenantConn.models.get('Notification'),
      ResourceBooking: tenantConn.models.get('ResourceBooking')
    };
     
    // ✅ Inject tenant-scoped Redis helper
    req.tenantCache = getTenantRedis(orgId);

    const Organization = mongoose.model('Organization');
    const exists = await Organization.exists({ _id: orgId });

    if (!exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Organization not found' 
      });
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    next(error);
  }
};
