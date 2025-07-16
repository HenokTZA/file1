// In your main database (not tenant databases)
// This model tracks tenant metadata but doesn't contain operational data
const mongoose = require('mongoose');

module.exports = (connection) => {
  // ✅ Prevent OverwriteModelError
  if (connection.models.Organization) {
    return connection.models.Organization;
  }

  const organizationSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    subdomain: {
      type: String,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'pending'
    },
    industry: String,
    contactEmail: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    config: {
      databaseName: {
        type: String,
        required: true,
        unique: true
      },
      features: {
        tasks: { type: Boolean, default: true },
        resources: { type: Boolean, default: true },
        teams: { type: Boolean, default: true }
      }
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise','expert'],
        default: 'free'
      },
      startsAt: Date,
      expiresAt: Date,
      renewalPeriod: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
      }
    },
    usage: {
      users: {
        current: Number,
        max: Number
      },
      lastActive: Date
    }
  }, {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  });

  // ✅ Removed redundant field-level index definitions (already declared with `unique`)
  // ✅ Retain only schema-level indexes
  organizationSchema.index({ name: 1 });
  organizationSchema.index({ subdomain: 1 }, { unique: true });
  organizationSchema.index({ status: 1 });
  organizationSchema.index({ 'subscription.plan': 1 });
  organizationSchema.index({ 'subscription.expiresAt': 1 });

  return connection.model('Organization', organizationSchema);
};
