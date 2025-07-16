const mongoose = require('mongoose');

module.exports = (connection) => {
  if (connection.models['Task']) {
    return connection.models['Task'];
  }
  
  // +++ NEW: Sub-schema for logging user work time +++
  const timeLogSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    durationMinutes: { // Stored for efficient reporting
      type: Number, 
      min: 0
    },
    notes: String,
    isBillable: {
      type: Boolean,
      default: true
    }
  }, { _id: true, timestamps: true }); // Give logs their own ID and timestamps

  // +++ NEW: Sub-schema for logging resource consumption/production +++
  const resourceLogSchema = new mongoose.Schema({
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    action: {
      type: String,
      enum: ['consumed', 'produced', 'used'], // 'used' for non-consumable machines
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    unit: { // e.g., 'kg', 'liters', 'pieces', 'hours'
      type: String 
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }, { _id: true, timestamps: true });

  const taskSchema = new mongoose.Schema({
  // Core Task Metadata
  title: { type: String, required: true, trim: true, maxlength: 120 },
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true,
    
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Resource Relationships (Improved Structure)
  resources: [{
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    relationshipType: { 
      type: String, 
      enum: ['requires', 'uses', 'produces', 'references'],
      default: 'requires'
    },
    required: { type: Boolean, default: false }
  }],
  timeLogs: [timeLogSchema],
  resourceLogs: [resourceLogSchema],

  // Team & Assignment (Simplified)
  assignments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    role: { 
      type: String, 
      enum: ['assignee', 'reviewer', 'observer'],
      default: 'assignee'
    }
  }],

  // Task Relationships
  dependencies: [{
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    relation: { 
      type: String,
      enum: ['blocks', 'precedes', 'related-to'],
      default: 'blocks'
    }
  }],

  // Classification
  tags: [{ type: String, lowercase: true, trim: true }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // System
  visibility: {
    type: String,
    enum: ['private', 'team', 'organization'],
    default: 'team'
  },
  task_period: {
    type: String,
    // enum: ['', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: ''
  },
  repeat_frequency: {  // e.g., "every 2 weeks"
    type: String,
    default: '',
    trim: true
  },
  schedule: {
    start: { type: Date, required: true },
    end: { type: Date },
    timezone: { type: String, default: 'UTC' }
  },

  // Visual & Attachments
  color_code: {
    type: String,
    default: '#fbbf24',
   
  },
 
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files', // Reference to GridFS
  }],
  // Task Tracking
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'done', 'impossible', 'archived'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 5000
  },

}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v; // Remove version key
      return ret;
    }
  }
});

// Indexes for better performance
taskSchema.index({ organization: 1, status: 1 });
taskSchema.index({ 'assignments.user': 1 });
taskSchema.index({ tags: 1 });


return connection.model('Task', taskSchema);
};