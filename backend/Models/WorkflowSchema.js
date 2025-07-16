const mongoose = require('mongoose');
const workflowSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    description: String,
    steps: [{
      name: String,
      status: String,
      required: Boolean,
      assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      approvalRequired: Boolean,
      transitions: [{
        toStep: String,
        conditions: mongoose.Schema.Types.Mixed
      }]
    }],
    applicableTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceType'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  });
  
  const Workflow = mongoose.model('Workflow', workflowSchema);