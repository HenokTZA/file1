const mongoose = require('mongoose');

// Avoid OverwriteModelError
module.exports = (connection = mongoose) => {
  if (connection.models.TenantUser) {
    return connection.models.TenantUser;
  }

  const TenantUserSchema = new mongoose.Schema({
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    userIdInTenantDB: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    access_level: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  TenantUserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

  return connection.model('TenantUser', TenantUserSchema);
};
