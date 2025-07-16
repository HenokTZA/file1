const Organization = require('../Models/OrganizationSchema');
const User = require('../Models/UserSchema');

exports.createOrganization = async (organizationData) => {
    try {
        // Check if organization name already exists
        const existingOrg = await Organization.findOne({ name: organizationData.name });
        if (existingOrg) {
            throw new Error('Organization with this name already exists');
        }

        const organization = new Organization(organizationData);
        return await organization.save();
    } catch (error) {
        console.error('Error in createOrganization:', error);
        throw error;
    }
};


exports.getOrganizationById = async (organizationId) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }
  return organization;
};

exports.updateOrganization = async (organizationId, updateData) => {
  // Don't allow changing the name if it's being updated
  if (updateData.name) {
    const existingOrg = await Organization.findOne({ name: updateData.name });
    if (existingOrg && existingOrg._id.toString() !== organizationId) {
      throw new Error('Organization with this name already exists');
    }
  }

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  return organization;
};

exports.deleteOrganization = async (organizationId) => {
  // Check if there are users associated with this organization
  const userCount = await User.countDocuments({ organization: organizationId });
  if (userCount > 0) {
    throw new Error('Cannot delete organization with associated users');
  }

  const organization = await Organization.findByIdAndDelete(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  return organization;
};

exports.getAllOrganizations = async (options = {}) => {
  const { page = 1, limit = 10, search } = options;
  
  const query = {};
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  const organizations = await Organization.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
  const count = await Organization.countDocuments(query);
  
  return {
    organizations,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page
  };
};

exports.updateOrganizationSettings = async (organizationId, settings) => {
  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { $set: { settings } },
    { new: true, runValidators: true }
  );
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  return organization;
};

exports.updateSubscription = async (organizationId, subscriptionData) => {
  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { subscription: subscriptionData },
    { new: true, runValidators: true }
  );
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  return organization;
};