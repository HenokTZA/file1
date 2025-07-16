
// services/resourceTypeService.js

exports.createResourceType = async (typeData, ResourceTypeModel) => {
  if (!typeData.fieldDefinitions || typeData.fieldDefinitions.length === 0) {
    const err = new Error('At least one field definition is required');
    err.statusCode = 400;
    throw err;
  }

  const fieldNames = typeData.fieldDefinitions.map(f => f.fieldName);
  const uniqueNames = new Set(fieldNames);

  if (fieldNames.length !== uniqueNames.size) {
    const err = new Error('Field names must be unique within a resource type');
    err.statusCode = 400;
    throw err;
  }

  // +++ CRITICAL ADDITIONS FOR VALIDATION AND TYPE CASTING +++
  typeData.fieldDefinitions.forEach(field => {
    // 1. Validate Quantifiable Fields
    if (field.isQuantifiable && (!field.quantifiableUnit || field.quantifiableUnit.trim() === '')) {
      const err = new Error(`Field '${field.fieldName}' is marked as quantifiable but is missing a unit.`);
      err.statusCode = 400;
      throw err;
    }
     if (!field.isQuantifiable) {
      // Clean up quantifiable data if it's not quantifiable
      delete field.quantifiableUnit;
      delete field.quantifiableCategory;
    }

    // 2. Cast Default Value based on Field Type
    if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
      if (field.fieldType === 'number') {
        const numValue = parseFloat(field.defaultValue);
        if (isNaN(numValue)) {
          const err = new Error(`Default value for number field '${field.fieldName}' is not a valid number.`);
          err.statusCode = 400;
          throw err;
        }
        field.defaultValue = numValue; // Assign the casted number
      }
      // String values are already in the correct format, so no casting is needed.
    } else {
        // Ensure empty strings aren't saved as default values, use undefined instead
        delete field.defaultValue;
    }
  });


  const resourceType = new ResourceTypeModel(typeData);
  try {
    return await resourceType.save();
  } catch (error) {
    // Handle potential duplicate key error from the database index
    if (error.code === 11000) {
      const err = new Error(`A resource type with the name '${typeData.name}' already exists.`);
      err.statusCode = 409; // 409 Conflict
      throw err;
    }
    throw error; // Re-throw other errors
  }
};
exports.getResourceTypes = async (ResourceTypeModel) => {
  return await ResourceTypeModel.find({});
};

exports.getResourceTypeById = async (typeId, ResourceTypeModel) => {
  return await ResourceTypeModel.findById(typeId);
};

exports.updateResourceType = async (typeId, updateData, ResourceTypeModel) => {
  if (updateData.organization) {
    throw new Error('Cannot change organization');
  }

  const updated = await ResourceTypeModel.findByIdAndUpdate(
    typeId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new Error('Resource type not found');
  }

  return updated;
};

exports.deleteResourceType = async (typeId, ResourceTypeModel, ResourceModel) => {
  const resourceCount = await ResourceModel.countDocuments({ type: typeId });

  if (resourceCount > 0) {
    throw new Error('Cannot delete resource type that has existing resources');
  }

  const deleted = await ResourceTypeModel.findByIdAndDelete(typeId);

  if (!deleted) {
    throw new Error('Resource type not found');
  }

  return deleted;
};
