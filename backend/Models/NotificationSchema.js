const mongoose = require('mongoose');

module.exports = (connection) => {
  if (connection.models['Notification']) {
    return connection.models['Notification'];
  }

  const notificationSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Who the notification is for
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String
    },
    type: {
      type: String,
      enum: ['task', 'resource','resourceType', 'team', 'comment', 'system'], // Add more types as needed
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // E.g., task ID, resource ID, etc.
    },
    referenceModel: {
      type: String,
      enum: ['Task', 'Resource', 'ResourceType' ,'Team'], // Add models your app uses
      required: false
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  });

  notificationSchema.index({ user: 1, isRead: 1 });
  notificationSchema.index({ organization: 1, createdAt: -1 });

  return connection.model('Notification', notificationSchema);
};
