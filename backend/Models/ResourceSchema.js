const mongoose = require('mongoose');
module.exports = (connection) => {
  if (connection.models['Resource']) {
    return connection.models['Resource'];
  }
  const resourceSchema = new mongoose.Schema({
    
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceType',  // Reference within same tenant
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    isBlockableOverride: {
      type: Boolean,
      default: null // `null` means "inherit from type". `true` or `false` will override the type's setting.
    },
    displayName: {
      type: String,
      required: false
    },
    fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    status: String,
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference within same tenant
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference within same tenant
    }
  }, { 
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  });

  // Indexes
  resourceSchema.index({ type: 1 });
  resourceSchema.index({ tags: 1 });
  resourceSchema.index({ status: 1 });

  return connection.model('Resource', resourceSchema);
};