// models/ResourceBooking.model.js
const mongoose = require('mongoose');

module.exports = (connection) => {
  if (connection.models['ResourceBooking']) {
    return connection.models['ResourceBooking'];
  }

  const resourceBookingSchema = new mongoose.Schema({
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true 
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true 
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      index: true 
    },
    endTime: {
      type: Date,
      required: true,
      index: true 
    },
    status: {
        type: String,
        enum: ['confirmed', 'completed', 'cancelled'],
        default: 'confirmed'
    }
  }, { timestamps: true });

  // Compound index for the most common availability query
  resourceBookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });

  return connection.model('ResourceBooking', resourceBookingSchema);
};