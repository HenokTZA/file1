exports.validateTaskData = (taskData) => {
  const errors = [];
  
  if (!taskData.title) {
    errors.push('Title is required');
  }
  
  // Check schedule object exists and has both times
  if (!taskData.schedule || !taskData.schedule.start || !taskData.schedule.end) {
    errors.push('Both start and end times are required in schedule');
  } else if (new Date(taskData.schedule.start) >= new Date(taskData.schedule.end)) {
    errors.push('End time must be after start time');
  }
  
  // Check assignments (updated to match your schema)
  if (taskData.assignments && taskData.assignments.length === 0) {
    errors.push('Task must have at least one assignment');
  }
  
  if (errors.length > 0) {
    throw { 
      message: `Validation errors: ${errors.join(', ')}`,
      statusCode: 400
    };
  }
};