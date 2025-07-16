// middleware/validateReferences.js
const validateSameTenant = (modelName, path = null) => {
    return async (req, res, next) => {
      const referencedId = path ? req.body[path] : req.params.id;
      
      if (!referencedId) return next();
  
      try {
        const Model = req.orgDB.model(modelName);
        const referencedDoc = await Model.findById(referencedId);
        
        if (!referencedDoc) {
          return res.status(404).json({ error: `${modelName} not found` });
        }
        
        // For Task dependencies, we don't need additional checks
        // since both documents are in the same tenant DB
        next();
      } catch (error) {
        next(error);
      }
    };
  };
  
  module.exports = {
    validateUser: validateSameTenant('User', 'createdBy'),
    validateTask: validateSameTenant('Task', 'dependencies.task'),
    validateResource: validateSameTenant('Resource', 'resources.resource')
  };