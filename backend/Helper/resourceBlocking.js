// This is the entire content of your new helper file.

/**
 * Filters a list of resource IDs to return only those that are effectively blockable.
 * An effectively blockable resource is one where its 'isBlockableOverride' is true,
 * or if that is not set, its type's 'isBlockable' is true.
 * @param {object} params - The parameters.
 * @param {string[]} params.resourceIds - An array of resource IDs to check.
 * @param {string} params.organizationId - The ID of the organization for security.
 * @param {mongoose.Model} params.ResourceModel - The Mongoose model for resources.
 * @returns {Promise<string[]>} A promise that resolves to an array of blockable resource IDs.
 * @throws Will throw an error if some resources are not found.
 */
const getBlockableResourceIds = async ({ resourceIds, organizationId, ResourceModel }) => {
  if (!resourceIds || resourceIds.length === 0) {
    return []; // No resources to check, return early.
  }

  // 1. Fetch resources and populate their type
  const resourcesToCheck = await ResourceModel.find({
    _id: { $in: resourceIds },
    organization: organizationId
  })
  .populate('type', 'isBlockable')
  .lean();

  // 2. Validate that all requested resources were found
  if (resourcesToCheck.length !== resourceIds.length) {
    throw { statusCode: 404, message: 'One or more assigned resources were not found or do not belong to the organization.' };
  }
  
  // 3. Determine which resources are effectively blockable
  const blockableIds = resourcesToCheck
    .filter(resource => {
      const isEffectivelyBlockable = resource.isBlockableOverride ?? resource.type?.isBlockable ?? false;
      return isEffectivelyBlockable;
    })
    .map(resource => resource._id.toString()); // Ensure IDs are strings

  return blockableIds;
};

// +++ THIS IS THE MOST IMPORTANT LINE +++
// Make this function the export of this module.
module.exports = getBlockableResourceIds;
