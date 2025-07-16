const mongoose = require('mongoose');
const bookingService = require('./resourceBookingService');
const { addDays, addWeeks, addMonths, addYears } = require('date-fns'); 

const generateRecurringInstances = (baseTask, frequency, endDate) => {
  const tasks = [];
  let currentStart = new Date(baseTask.schedule.start);
  let currentEnd = new Date(baseTask.schedule.end);
  const periodEnd = new Date(endDate);

  // Calculate duration of the original task to maintain it for all instances
  const durationMs = currentEnd.getTime() - currentStart.getTime();

  // --- REFACTORED PARSING LOGIC ---
  const freqLower = frequency.toLowerCase();
  let interval = 1;
  let unit = freqLower;

  const match = freqLower.match(/^(\d+)\s*(daily|weekly|monthly|yearly|day|week|month|year)s?$/);

  if (match) {
    interval = parseInt(match[1], 10);
    // Normalize the unit to its singular form
    unit = match[2].replace(/s$/, ''); // remove plural 's'
  }
  // --- END OF REFACTORED PARSING LOGIC ---

  while (currentStart <= periodEnd) {
    // We only create clones for dates *after* the original start date
    if (currentStart > new Date(baseTask.schedule.start)) {
      const taskClone = {
        ...baseTask,
        _id: undefined, // Let MongoDB generate a new ID
        schedule: {
          start: new Date(currentStart),
          end: new Date(currentStart.getTime() + durationMs), // Apply original duration
          timezone: baseTask.schedule.timezone,
        },
        isRecurringInstance: true,
        rootTask: baseTask._id || null,
      };
      tasks.push(taskClone);
    }

    // --- UNIFIED INCREMENT LOGIC ---
    // Increment the start date for the next loop
    switch (unit) {
      case 'daily':
      case 'day':
        currentStart = addDays(currentStart, interval);
        break;
      case 'weekly':
      case 'week':
        currentStart = addWeeks(currentStart, interval);
        break;
      case 'monthly':
      case 'month':
        currentStart = addMonths(currentStart, interval);
        break;
      case 'yearly':
      case 'year':
        currentStart = addYears(currentStart, interval);
        break;
      default:
        // If frequency is invalid, break the loop to prevent infinite execution
        console.error(`Invalid recurrence unit: ${unit}`);
        return tasks;
    }
  }

  return tasks;
};
exports.createRecurringTasks = async ({ baseTask, frequency, endDate, TaskModel, ResourceModel, ResourceBookingModel }) => {
  // First create the root task
  const rootTask = await exports.createTask(baseTask, TaskModel, ResourceModel, ResourceBookingModel); 

  // Generate recurring instances
  const recurringInstances = generateRecurringInstances(
    { ...baseTask, _id: rootTask._id },
    frequency,
    endDate
  );

// --- NEW: Check for conflicts for ALL future instances before creating them ---
if (baseTask.resources?.length > 0) {
  const resourceIds = baseTask.resources.map(r => r.resource);
  // This is an advanced query to check all time slots in one go
  const timeSlots = recurringInstances.map(inst => ({
      startTime: { $lt: inst.schedule.end },
      endTime: { $gt: inst.schedule.start },
  }));

  const conflicts = await ResourceBookingModel.find({
      resource: { $in: resourceIds },
      organization: baseTask.organization,
      status: 'confirmed',
      $or: timeSlots
  }).populate('resource', 'displayName').populate('task', 'title').lean();

  if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c =>
          `Resource '${c.resource.displayName}' conflicts with task '${c.task.title}'`
      ).join('; ');
      throw {
          statusCode: 409,
          message: `Cannot create recurring schedule due to resource conflicts: ${conflictDetails}`
      };
  }
}

  // Save all instances
  const createdInstances = await TaskModel.insertMany(recurringInstances);

  // --- NEW: Create bookings for ALL instances ---
  if (baseTask.resources?.length > 0) {
    const allBookings = createdInstances.flatMap(instance =>
      instance.resources.map(res => ({
        resource: res.resource,
        task: instance._id,
        organization: instance.organization,
        startTime: instance.schedule.start,
        endTime: instance.schedule.end
      }))
    );
    if (allBookings.length > 0) {
        await ResourceBookingModel.insertMany(allBookings);
    }
  }
  
  // --- END OF NEW LOGIC ---
  
  // Get IDs of all created tasks (root + instances)
  const allTaskIds = [rootTask._id, ...createdInstances.map(t => t._id)];

  // Fetch all tasks with proper population
  const populatedTasks = await TaskModel.find({ _id: { $in: allTaskIds } })
    .populate([
      {
        path: 'resources.resource',
        populate: { path: 'type', select: 'name icon color' }
      },
      {
        path: 'assignments.user',
        select: 'first_name last_name email avatar'
      },
      {
        path: 'assignments.team',
        select: 'name'
      },
      {
        path: 'dependencies.task',
        select: 'title status'
      }
    ])
    .lean();

  return populatedTasks;
  
};
exports.createTask = async (taskData, TaskModel, ResourceModel, ResourceBookingModel) => {
  try {
    // Basic validation
    if (!taskData.title?.trim()) {
      throw { statusCode: 400, message: 'Title is required' };
    }

    // Validate date consistency
    const startDate = new Date(taskData.schedule.start);
    const endDate = new Date(taskData.schedule.end);
    
    if (startDate >= endDate) {
      throw {
        message: 'End time must be after start time',
        statusCode: 400
      };
    }

    // --- REVISED: INTELLIGENT RESOURCE AVAILABILITY CHECK ---
    if (taskData.resources?.length > 0) {
      const allResourceIds = taskData.resources.map(r => r.resource);

      // 1. Fetch resources and populate their type to get both the override and the default value.
      // This single query validates existence and fetches the necessary data.
      const resourcesToCheck = await ResourceModel.find({
        _id: { $in: allResourceIds },
        organization: taskData.organization
      })
      .populate('type', 'isBlockable') // Efficiently populate only the 'isBlockable' default.
      .lean();

      // 2. Validate that all requested resources were found
      if (resourcesToCheck.length !== allResourceIds.length) {
        throw { statusCode: 404, message: 'Some resources were not found or do not belong to the organization.' };
      }
      
      // 3. Determine which resources are effectively blockable using the override logic.
      const blockableResourceIds = resourcesToCheck
        .filter(resource => {
          const isEffectivelyBlockable = resource.isBlockableOverride ?? resource.type?.isBlockable ?? false;
          return isEffectivelyBlockable;
        })
        .map(resource => resource._id); // Get just the IDs of the blockable resources.

      // 4. If any of the assigned resources are blockable, check them for scheduling conflicts.
      if (blockableResourceIds.length > 0) {
        await bookingService.checkForConflictsAndThrow({
          resourceIds: blockableResourceIds, // IMPORTANT: Pass ONLY the filtered list of blockable IDs
          startTime: startDate,
          endTime: endDate,
          organizationId: taskData.organization,
          ResourceBookingModel
        });
      }
      // If no resources are blockable, the conflict check is correctly skipped.
    }

    // Create task
    const task = new TaskModel({
      ...taskData,
      isRecurringRoot: false,
      isRecurringInstance: false
    });
    
    const savedTask = await task.save();

    // Create bookings for ALL assigned resources, as this logs their assignment.
    if (savedTask.resources?.length > 0) {
      const bookingsToCreate = savedTask.resources.map(res => ({
        resource: res.resource,
        task: savedTask._id,
        organization: savedTask.organization,
        startTime: savedTask.schedule.start,
        endTime: savedTask.schedule.end,
      }));
      await ResourceBookingModel.insertMany(bookingsToCreate);
    }
   
    // Populate key references before returning
    const populatedTask = await TaskModel.findById(savedTask._id)
      .populate([
        {
          path: 'resources.resource',
          // Note: You can now populate the override field here if the UI needs it
          populate: { path: 'type', select: 'name icon color isBlockable' }
        },
        {
          path: 'assignments.user',
          select: 'first_name last_name email avatar'
        },
        {
          path: 'assignments.team',
          select: 'name'
        },
        {
          path: 'dependencies.task',
          select: 'title status'
        }
      ])
      .lean();

    return populatedTask;

  } catch (error) {
    console.error('Error in task creation service:', error);
    // Re-throw for the controller/route handler to manage the HTTP response
    throw error;
  }
};
exports.getTaskById = async (taskId, TaskModel) => {
  const task = await TaskModel.findOne({
    _id: taskId,
    
  })
    .populate('resources.resource')
    .populate('assignments.user')
    .populate('assignments.team')
    .populate('dependencies.task')
    .populate('createdBy', 'first_name last_name email');
    
  if (!task) {
    throw { message: 'Task not found', statusCode: 404 };
  }
  
  return task;
};
exports.updateTask = async (taskId, updateData, TaskModel, ResourceBookingModel) => {
 
  const taskBeforeUpdate = await TaskModel.findById(taskId);

  if (!taskBeforeUpdate) {
    throw { message: 'Task not found', statusCode: 404 };
  }

  // Prevent changing immutable fields.
  if (updateData.organization || updateData.createdBy) {
    throw {
      message: 'Cannot change task organization or creator',
      statusCode: 400
    };
  }

  // 2. Determine if a conflict check is needed
  const newSchedule = updateData.schedule;
  const newResources = updateData.resources;
  const scheduleChanged = newSchedule && (
    new Date(taskBeforeUpdate.schedule.start).getTime() !== new Date(newSchedule.start).getTime() ||
    new Date(taskBeforeUpdate.schedule.end).getTime() !== new Date(newSchedule.end).getTime()
  );
  const resourcesChanged = newResources !== undefined;

  // 3. Perform conflict check if schedule or resources changed
  if (scheduleChanged || resourcesChanged) {
    // Use the new data if available, otherwise fall back to the old data.
    const resourcesToCheck = newResources || taskBeforeUpdate.resources;
    if (resourcesToCheck && resourcesToCheck.length > 0) {
        const resourceIds = resourcesToCheck.map(r => r.resource);
        await bookingService.checkForConflictsAndThrow({
            resourceIds,
            startTime: newSchedule?.start || taskBeforeUpdate.schedule.start,
            endTime: newSchedule?.end || taskBeforeUpdate.schedule.end,
            organizationId: taskBeforeUpdate.organization,
            ResourceBookingModel,
            excludeTaskId: taskId // CRUCIAL: Don't let the task conflict with itself!
        });
    }
  }

  const isCompletingNow = updateData.status === 'done' && taskBeforeUpdate.status !== 'done';

  if (isCompletingNow) {
   
    if (!taskBeforeUpdate.schedule.start || !taskBeforeUpdate.schedule.end) {
        throw { message: 'Cannot complete a task without a defined start and end time.', statusCode: 400 };
    }

    // --- Generate Time Logs ---
    const newTimeLogs = [];
    if (taskBeforeUpdate.assignments && taskBeforeUpdate.assignments.length > 0) {
      const durationMs = new Date(taskBeforeUpdate.schedule.end).getTime() - new Date(taskBeforeUpdate.schedule.start).getTime();
      // Ensure duration is not negative
      const durationMinutes = Math.max(0, Math.round(durationMs / 60000));

      taskBeforeUpdate.assignments.forEach(assignment => {
        newTimeLogs.push({
          user: assignment.user,
          startTime: taskBeforeUpdate.schedule.start,
          endTime: taskBeforeUpdate.schedule.end,
          durationMinutes: durationMinutes,
          isBillable: true,
          notes: 'Automatically logged on task completion.'
        });
      });
    }
    // --- Generate Resource Logs ---
    const newResourceLogs = [];
    if (taskBeforeUpdate.resources && taskBeforeUpdate.resources.length > 0) {
      taskBeforeUpdate.resources.forEach(plannedResource => {
        let action = 'consumed'; // Default action
        if (plannedResource.relationshipType === 'produces') action = 'produced';
        if (plannedResource.relationshipType === 'uses') action = 'used';

        newResourceLogs.push({
          resource: plannedResource.resource,
          action: action,
          quantity: plannedResource.quantity || 1,
          loggedBy: taskBeforeUpdate.createdBy 
        });
      });
    }

    if (!updateData.$push) {
      updateData.$push = {};
    }
    updateData.$push.timeLogs = { $each: newTimeLogs };
    updateData.$push.resourceLogs = { $each: newResourceLogs };
  }
  // const task = await TaskModel.findOneAndUpdate(
  //   { _id: taskId },
  //   updateData,
  //   { new: true, runValidators: true }
  // );
  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  );
  // 6. Sync Resource Bookings
  const statusChanged = updateData.status && updateData.status !== taskBeforeUpdate.status;
  const isNowInactive = ['done', 'archived', 'impossible'].includes(updatedTask.status);

  // We need to update bookings if schedule/resources changed OR if the task became inactive.
  if (scheduleChanged || resourcesChanged || (statusChanged && isNowInactive)) {
    // A. Always remove old bookings for simplicity and robustness.
    await ResourceBookingModel.deleteMany({ task: taskId });

    // B. If the task is still active and has resources, create new bookings.
    if (!isNowInactive && updatedTask.resources && updatedTask.resources.length > 0) {
      const newBookings = updatedTask.resources.map(res => ({
        resource: res.resource,
        task: updatedTask._id,
        organization: updatedTask.organization,
        startTime: updatedTask.schedule.start,
        endTime: updatedTask.schedule.end,
        status: 'confirmed'
      }));
      await ResourceBookingModel.insertMany(newBookings);
    }
  }

  // .populate({
  //   path: 'resources.resource',
  //   populate: {
  //     path: 'type',
  //     model: 'ResourceType',
  //     select: 'name icon color'
  //   }
  // })
  // .populate({
  //   path: 'assignments.user',
  //   select: 'first_name last_name email avatar'
  // })
    
  // if (!task) {
  //   throw { message: 'Task not found', statusCode: 404 };
  // }
  
  // return task;
  return await TaskModel.findById(updatedTask._id)
    .populate([
      {
        path: 'resources.resource',
        populate: { path: 'type', select: 'name icon color' }
      },
      {
        path: 'assignments.user',
        select: 'first_name last_name email avatar'
      }
    ])
    .lean(); 
};
exports.deleteTask = async (taskId, TaskModel) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    
  });
  
  if (!task) {
    throw { message: 'Task not found', statusCode: 404 };
  }
  
  // Optional: Clean up any task references
  await TaskModel.updateMany(
    { 'dependencies.task': taskId },
    { $pull: { dependencies: { task: taskId } } }
  );
};
exports.getTasksByOrganization = async (TaskModel, options = {}) => {
  const { page = 1, limit = 100 } = options;
  
  const tasks = await TaskModel.find({ 
    
    status: { $ne: 'done' } // Exclude done tasks
  })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate({
      path: 'resources.resource',
      populate: {
        path: 'type',
        model: 'ResourceType',
        select: 'name icon color'
      }
    })
    .populate({
      path: 'assignments.user',
      select: 'first_name last_name email avatar'
    })
    
  const count = await TaskModel.countDocuments({ 
    
    status: { $ne: 'done' } // Consistent count query
  });
  
  return {
    tasks,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page
  };
};
exports.filterTasksByOrganization = async (organizationId,TaskModel, options = {}) => {
  const { page = 1, limit = 100, filters = {} } = options;
 
  // Base query with organization
  const query = { organization: new mongoose.Types.ObjectId(organizationId) };
  
  // Apply filters
  if (filters && Object.keys(filters).length > 0) {
    // ID filter
    if (filters._id) {
      query._id = new mongoose.Types.ObjectId(filters._id);
    }
  
    if (filters.resource) {
      const resourceIds = Array.isArray(filters.resource) 
        ? filters.resource.map(id => new mongoose.Types.ObjectId(id))
        : [new mongoose.Types.ObjectId(filters.resource)];
  
      // For intersection (ALL resources must exist)
      query.$and = resourceIds.map(resourceId => ({
        resources: {
          $elemMatch: {
            resource: resourceId,
            // Optional additional conditions
            ...(filters.resourceRelationship && { 
              relationshipType: filters.resourceRelationship 
            }),
            ...(filters.hasRequiredResources !== undefined && { 
              required: filters.hasRequiredResources 
            })
          }
        }
      }));
    }
    // For combined resource filters with multiple resources
    if (filters.resource && (filters.resourceRelationship || filters.hasRequiredResources !== undefined)) {
      const resourceConditions = {
        resource: { 
          $in: Array.isArray(filters.resource)
            ? filters.resource.map(id => new mongoose.Types.ObjectId(id))
            : [new mongoose.Types.ObjectId(filters.resource)]
        }
      };
    
      if (filters.resourceRelationship) {
        resourceConditions.relationshipType = filters.resourceRelationship;
      }
    
      if (filters.hasRequiredResources !== undefined) {
        resourceConditions.required = filters.hasRequiredResources;
      }
    
      query.resources = { $elemMatch: resourceConditions };
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Priority filter
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    // Visibility filter
    if (filters.visibility) {
      query.visibility = filters.visibility;
    }
    
    // Created by filter
    if (filters.createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
    }
    
    // Date range filters
    if (filters.startDate || filters.endDate) {
      query['schedule.start'] = {};
      if (filters.startDate) {
        query['schedule.start'].$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query['schedule.start'].$lte = new Date(filters.endDate);
      }
    }
    
    // Due date filter
    if (filters.dueDate) {
      query['schedule.end'] = { $lte: new Date(filters.dueDate) };
    }
    
    // Assigned user filter
    if (filters.assignedTo) {
      query['assignments.user'] = new mongoose.Types.ObjectId(filters.assignedTo);
    }
    
    // Team filter
    if (filters.team) {
      query['assignments.team'] = new mongoose.Types.ObjectId(filters.team);
    }
    
    // Assignment role filter
    if (filters.role) {
      query['assignments.role'] = filters.role;
    }
    
    // Empty assignments filter
    if (filters.hasAssignments === false) {
      query.assignments = { $size: 0 };
    } else if (filters.hasAssignments === true) {
      query.assignments = { $not: { $size: 0 } };
    }
  
    // Empty resources filter
    if (filters.hasResources === false) {
      query.resources = { $size: 0 };
    } else if (filters.hasResources === true) {
      query.resources = { $not: { $size: 0 } };
    }
    // Tag filter
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      query.tags = { $all: tags.map(tag => tag.toLowerCase()) };
    }
    
    // Task period filter
    if (filters.task_period) {
      query.task_period = filters.task_period;
    }
    
    // Repeat frequency filter
    if (filters.repeat_frequency) {
      query.repeat_frequency = filters.repeat_frequency;
    }
    
    // Color code filter
    if (filters.color_code) {
      query.color_code = filters.color_code;
    }
    
    // Text search (title or notes)
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { notes: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    // Dependencies filter
    if (filters.hasDependencies === true) {
      query.dependencies = { $not: { $size: 0 } };
    } else if (filters.hasDependencies === false) {
      query.dependencies = { $size: 0 };
    }
    
    // Specific dependency filter
    if (filters.dependencyTask) {
      query['dependencies.task'] = new mongoose.Types.ObjectId(filters.dependencyTask);
    }
  }

  try {
    const [tasks, count] = await Promise.all([
      TaskModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate([
          {
            path: 'resources.resource',
            populate: { path: 'type', select: 'name icon color' }
          },
          {
            path: 'assignments.user',
            select: 'first_name last_name email avatar'
          },
          {
            path: 'assignments.team',
            select: 'name'
          },
          {
            path: 'dependencies.task',
            select: 'title status'
          }
        ])
        .sort({ 'schedule.start': 1 })
        .lean(),
        TaskModel.countDocuments(query)
    ]);

    console.log(`Found ${tasks.length} matching tasks`);
    return {
      tasks,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};
exports.changeTaskStatus = async (taskId, newStatus, changedBy, notes, TaskModel) => {
  const task = await TaskModel.findOne({ _id: taskId, organization: organizationId });
  
  if (!task) {
    throw { message: 'Task not found', statusCode: 404 };
  }
  
  // Add to status history
  task.status.history.push({
    status: task.status.current,
    changedAt: new Date(),
    changedBy: changedBy,
    notes: notes || ''
  });
  
  // Update current status
  task.status.current = newStatus;
  
  return await task.save();
};
exports.fetchAllDoneTasks = async (organizationId,TaskModel) => {
  const tasks = await TaskModel.find({
    organization: organizationId,
    status: 'done'
  })
    .populate({
      path: 'resources.resource',
      populate: {
        path: 'type',
        model: 'ResourceType',
        select: 'name icon color'
      }
    })
    .populate('assignments.user')
    .sort({ completedAt: -1 });

 

  return tasks;
};
exports.fetchDoneTasksForUser = async (userId, organizationId, TaskModel) => {
  const tasks = await TaskModel.find({
    'assignments.user': userId,
    organization: organizationId,
    status: 'done'
  })
    .populate({
      path: 'resources.resource',
      populate: {
        path: 'type',
        model: 'ResourceType',
        select: 'name icon color'
      }
    })
    .populate('assignments.user')
    .sort({ completedAt: -1 });

  return tasks;
};
exports.getTasksByAssignedUser = async (userId, organizationId, TaskModel) => {
  return await TaskModel.find({
    'assignments.user': userId,
    status: { $ne: 'done' },
    organization: organizationId
  })
    .populate({
      path: 'resources.resource',
      populate: {
        path: 'type',
        model: 'ResourceType',
        select: 'name icon color'
      }
    })
    .populate('assignments.user')
    .sort({ 'schedule.start': 1 });
};
exports.getReportData = async (filter, TaskModel) => {
  try {
    const tasks = await TaskModel.find(filter)
      // Populate the user who was assigned to the task (the plan)
      .populate({
        path: 'assignments.user',
        select: 'first_name last_name email payroll' // Crucially includes payroll data
      })
      // Populate the resources that were planned for the task
      .populate({
        path: 'resources.resource',
        select: 'displayName fields type',
        populate: {
          path: 'type',
          model: 'ResourceType',
          select: 'name icon fieldDefinitions'
        }
      })
      // Populate the actual time logs, including the user who performed the work
      .populate({
        path: 'timeLogs',
        populate: {
            path: 'user',
            model: 'User',
            select: 'first_name last_name payroll' // Also get payroll here for direct access
        }
      })
      // Populate the actual resource logs, including details of the resource used/consumed
      .populate({
        path: 'resourceLogs',
        populate: {
            path: 'resource',
            model: 'Resource',
            select: 'displayName fields'
        }
      })
      .sort({ 'schedule.start': -1 })
      .lean(); // Use .lean() for fast, read-only operations

    return tasks;
  } catch (error) {
    // Log the error and re-throw it to be handled by the controller
    console.error('Error in getReportData service:', error);
    throw error;
  }
};