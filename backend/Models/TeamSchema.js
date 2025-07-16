
const mongoose = require('mongoose');
  module.exports = (connection) => {
    if (connection.models['Team']) {
      return connection.models['Team'];
    }
    const teamSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true
      },
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
      },
      // Removed organization field - implicit by database
      members: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',  // Reference within same tenant
          required: true
        },
        role: {
          type: String,
          enum: ['member', 'manager', 'admin'],
          default: 'member'
        }
      }],
      permissions: {
        taskAccess: {
          type: String,
          enum: ['read', 'write', 'admin'],
          default: 'read'
        },
        resourceAccess: {
          type: String,
          enum: ['read', 'write', 'admin'],
          default: 'read'
        }
      },
      description: {
        type: String,
        trim: true
      },
      tags: [{
        type: String,
        trim: true
      }]
    }, {
      timestamps: true,
      toJSON: {
        transform: function(doc, ret) {
          delete ret.__v;
          return ret;
        }
      }
    });
  
    // Indexes
    teamSchema.index({ name: 1 }); // Non-unique since uniqueness is per tenant
    teamSchema.index({ 'members.user': 1 });
    teamSchema.index({ tags: 1 });
  
    return connection.model('Team', teamSchema);
  };