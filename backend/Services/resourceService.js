const Task = require('../Models/TaskSchema');

exports.createResource = async (resourceData, ResourceModel, ResourceTypeModel) => {
  // Verify the resource type exists
  const resourceType = await ResourceTypeModel.findOne({
    _id: resourceData.type
  }).lean();

  if (!resourceType) {
    throw new Error(`Resource type with ID ${resourceData.type} not found`);
  }

  // Convert fields to Map
  const fieldsMap = resourceData.fields instanceof Map 
    ? resourceData.fields 
    : new Map(Object.entries(resourceData.fields || {}));

  // Validate fields
  const fieldErrors = [];
  const fieldDefinitions = resourceType.fieldDefinitions || [];
  const allowedFields = new Set(fieldDefinitions.map(def => def.fieldName));

  // Validate required fields and types
  for (const def of fieldDefinitions) {
    const fieldValue = fieldsMap.get(def.fieldName);
    
    if (def.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      fieldErrors.push(`Field '${def.fieldName}' is required`);
      continue;
    }
    
    if (fieldValue !== undefined && fieldValue !== null) {
      const typeCheck = checkFieldType(fieldValue, def.fieldType);
      if (!typeCheck.valid) {
        fieldErrors.push(`Field '${def.fieldName}' should be ${def.fieldType}: ${typeCheck.message}`);
      }
    }
  }

  if (fieldErrors.length > 0) {
    throw new Error(`Validation errors: ${fieldErrors.join(', ')}`);
  }

  // Create resource with explicit field mapping
  const resource = new ResourceModel({
    displayName: resourceData.displayName, // Explicitly include
    type: resourceData.type,
    organization: resourceData.organization,
    createdBy: resourceData.createdBy,
    fields: fieldsMap,
    // Initialize other required fields
    status: 'active', // Add default status if needed
    tags: [] // Initialize empty array if needed
  });

  
  return await resource.save();
};
function checkFieldType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return { valid: typeof value === 'string', message: 'Must be a string' };
    case 'number':
      return { valid: typeof value === 'number', message: 'Must be a number' };
    case 'boolean':
      return { valid: typeof value === 'boolean', message: 'Must be true or false' };
    case 'date':
      return { valid: value instanceof Date || !isNaN(Date.parse(value)), message: 'Must be a valid date' };
    case 'array':
      return { valid: Array.isArray(value), message: 'Must be an array' };
    case 'object':
      return { valid: typeof value === 'object' && !Array.isArray(value) && value !== null, message: 'Must be an object' };
    default:
      return { valid: true, message: '' };
  }
}

exports.getResourceById = async (resourceId, organizationId,ResourceModel) => {
  return await ResourceModel.findOne({
    _id: resourceId,
    organization: organizationId
  })
    .populate('type')
    .populate('createdBy', 'first_name last_name');
};

exports.getAvailableResourcesByType = async (typeId, startTime, endTime, { ResourceModel, ResourceBookingModel }) => {
  // 1. Fetch all resources of the given type.
  // We need to populate 'type' to check the 'isBlockable' flag.
  const allResources = await ResourceModel.find({ type: typeId })
    .populate('type', 'isBlockable')
    .lean();

  if (allResources.length === 0) {
    return [];
  }

  // 2. Separate resources into blockable and non-blockable.
  const nonBlockableResources = [];
  const blockableResources = [];

  allResources.forEach(resource => {
    const isEffectivelyBlockable = resource.isBlockableOverride ?? resource.type?.isBlockable ?? false;
    if (isEffectivelyBlockable) {
      blockableResources.push(resource);
    } else {
      nonBlockableResources.push(resource); // Non-blockable resources are always "available".
    }
  });

  // If there are no blockable resources, we can return everything immediately.
  if (blockableResources.length === 0) {
    return allResources;
  }

  // 3. Find which of the blockable resources are already booked in the given time frame.
  const blockableResourceIds = blockableResources.map(r => r._id);

  const conflictingBookings = await ResourceBookingModel.find({
    resource: { $in: blockableResourceIds },
    status: 'confirmed', // Or whatever statuses mean "booked"
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  }).lean();

  const bookedResourceIds = new Set(conflictingBookings.map(b => b.resource.toString()));

  // 4. Filter out the booked resources from the blockable list.
  const availableBlockableResources = blockableResources.filter(
    resource => !bookedResourceIds.has(resource._id.toString())
  );

  // 5. Combine the lists and return.
  return [...nonBlockableResources, ...availableBlockableResources];
};
exports.getResourcesByType = async (typeId, organizationId, options = {},ResourceModel) => {
  const { page = 1, limit = 10 } = options;
  
  const resources = await ResourceModel.find({
    type: typeId,
    
  })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('type')
    .populate('createdBy', 'first_name last_name');
    
  const count = await ResourceModel.countDocuments({
    type: typeId,
    organization: organizationId
  });
  
  return {
    resources,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page
  };
};

exports.updateResource = async (resourceId, updateData, organizationId,ResourceModel) => {
  // Don't allow changing the resource type
  if (updateData.type) {
    throw new Error('Cannot change resource type after creation');
  }
  console.log("updateData",updateData)
  const resource = await ResourceModel.findOneAndUpdate(
    { _id: resourceId, organization: organizationId },
    updateData,
    { new: true, runValidators: true }
  ).populate('type');
  console.log("resource",resource)
  if (!resource) {
    throw new Error('Resource not found');
  }
  
  return resource;
};

// exports.deleteResource = async (resourceId, organizationId,ResourceModel) => {
//   // Check if the resource is referenced in any tasks
//   const taskCount = await Task.countDocuments({
//     'relatedResources.resource': resourceId,
//     organization: organizationId
//   });
  
//   if (taskCount > 0) {
//     throw new Error('Cannot delete resource referenced in tasks');
//   }
  
//   const resource = await ResourceModel.findOneAndDelete({
//     _id: resourceId,
//     organization: organizationId
//   });
  
//   if (!resource) {
//     throw new Error('Resource not found');
//   }
// };
exports.deleteResource = async (resourceId, organizationId, ResourceModel, TaskModel) => { 
  // Check if the resource is referenced in any tasks
  // FIX: Use the passed-in TaskModel
  const taskCount = await TaskModel.countDocuments({ 
    'resources.resource': resourceId, // Make sure this path matches your Task schema
    organization: organizationId
  });
  
  if (taskCount > 0) {
    throw new Error(`Cannot delete this resource because it is assigned to ${taskCount} task(s).`);
  }
  
  const resource = await ResourceModel.findOneAndDelete({
    _id: resourceId,
    organization: organizationId
  });
  
  if (!resource) {
    throw new Error('Resource not found');
  }

  // Good practice to return something to confirm deletion
  return { deleted: true, id: resourceId };
};
