// services/booking.service.js
const mongoose = require('mongoose');

/**
 * Checks for conflicting bookings for a given set of resources within a time range.
 * @returns {Promise<object[]>} A promise resolving to an array of conflicting bookings. Empty array means available.
 */
exports.findConflictingBookings = async ({
  resourceIds,
  startTime,
  endTime,
  organizationId,
  ResourceBookingModel,
  excludeTaskId // Used when updating a task, to avoid it conflicting with itself
}) => {
  // An overlap exists if: (booking.startTime < new.endTime) AND (booking.endTime > new.startTime)
  const conflictQuery = {
    organization: organizationId,
    resource: { $in: resourceIds },
    status: 'confirmed', // Only check against active bookings
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeTaskId) {
    conflictQuery.task = { $ne: new mongoose.Types.ObjectId(excludeTaskId) };
  }

  const conflictingBookings = await ResourceBookingModel.find(conflictQuery)
    .populate('resource', 'displayName')
    .populate('task', 'title schedule')
    .lean();

  return conflictingBookings;
};

/**
 * Throws a formatted error if any conflicts are found.
 */
exports.checkForConflictsAndThrow = async (options) => {
  const conflicts = await exports.findConflictingBookings(options);

  if (conflicts.length > 0) {
    const conflictDetails = conflicts.map(c =>
      `Resource '${c.resource.displayName}' is booked for task '${c.task.title}' from ${c.task.schedule.start.toLocaleString()} to ${c.task.schedule.end.toLocaleString()}`
    ).join('; ');

    throw {
      statusCode: 409, // 409 Conflict
      message: `Scheduling conflict detected. ${conflictDetails}`
    };
  }
};