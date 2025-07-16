const taskService = require('../Services/taskService');
const notificationService = require('../Services/notificationService');
const { sendResponse } = require('../utils/responseHandler');
const calculateTaskPeriod = require('../Helper/taskPeriodCalc');
const getColorForStatus =require('../utils/getColorForStatus');
const uploadFileToGridFS = require('../utils/uploadImage'); 
const { notifyUser, notifyOrg } = require('../socket/emitUtils');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const ical = require('ical');
exports.importICal = async (req, res) => {
  const { url } = req.body;
  const { Task, Resource } = req.tenantModels;
  const user = req.user;

  console.log("url", url);

  try {
    const response = await fetch(url);
    const data = await response.text();
    const parsed = ical.parseICS(data);

    const events = Object.values(parsed).filter((e) => e.type === 'VEVENT');

    console.log("events", events.length);

    let createdTasks = [];

    for (let e of events) {
      const taskData = {
        title: e.summary || 'Imported iCal Event',
        organization: user.org_id,
        createdBy: user._id,
        schedule: {
          start: new Date(e.start),
          end: new Date(e.end),
          timezone: 'UTC',
        },
        notes: e.description || '',
        priority: 'medium',
        status: 'pending',
      };

      console.log("taskData", taskData);

      const savedTask = await taskService.createTask(taskData, Task, Resource);
      createdTasks.push(savedTask);
    }

    return res.status(200).json({
      message: 'iCal events imported as tasks',
      count: createdTasks.length,
      taskIds: createdTasks.map(t => t._id),
    });

  } catch (error) {
    console.error('Error importing iCal:', error);
    return res.status(500).json({ error: 'Import failed' });
  }
};
exports.createTask = async (req, res) => {
  try {
    console.log("req.tenantModel",req.tenantModels)
    const { Task, Resource, Notification, ResourceBooking } = req.tenantModels;
    const cache = req.tenantCache;

    // Validate required fields
    if (!req.body.title || !req.body.schedule?.start || !req.body.schedule?.end) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        data: null
      });
    }

    // Prepare task data
    const taskData = {
      title: req.body.title,
      organization: req.user.org_id,
      createdBy: req.user._id,
      schedule: {
        start: new Date(req.body.schedule.start),
        end: new Date(req.body.schedule.end),
        timezone: req.body.schedule.timezone || 'UTC'
      },
      // Optional fields with defaults
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      notes: req.body.notes || '',
      assignments: req.body.assigned_to 
    ? req.body.assigned_to.map(userId => ({ user: userId })) 
    : [],
      // Only include if provided
      ...(req.body.resources && { resources: req.body.resources }),
      ...(req.body.repeat_frequency && { repeat_frequency: req.body.repeat_frequency }),
      ...(req.body.task_period && { task_period: req.body.task_period })
    };

    // Clear any undefined fields
    Object.keys(taskData).forEach(key => taskData[key] === undefined && delete taskData[key]);

    let createdTask;
    if (taskData.repeat_frequency !== 'none' && taskData.task_period) {
      // Handle recurring tasks
      const periodEndDate = calculateTaskPeriod(taskData.schedule.start, taskData.task_period);
      createdTask = await taskService.createRecurringTasks({
        baseTask: taskData,
        frequency: taskData.repeat_frequency,
        endDate: periodEndDate,
        TaskModel: Task,          
        ResourceModel: Resource ,
        ResourceBookingModel: ResourceBooking 
      });
    } else {
      // Handle single task
      
      createdTask = await taskService.createTask(taskData, Task, Resource, ResourceBooking );
    }
   // Invalidate all paginated task lists
   await cache.delPattern(`tasks:org:${req.user.org_id}:*`);

   if (taskData.assignments && taskData.assignments.length > 0) {
    
    await Promise.all(
      taskData.assignments.map((assignment) => {
        const userId = assignment.user.toString();
  
        // Real-time notification
        notifyUser(userId, 'task:assigned', {
          taskId: createdTask._id,
          title: taskData.title,
          message: `You've been assigned a new task: "${taskData.title}"`,
          createdBy: req.user.first_name || 'A team member',
          organization: req.user.org_id,
        });
  
        // Persistent DB notification
        return notificationService.createNotification(
          {
            user: userId,
            organization: req.user.org_id,
            title: 'New Task Assigned',
            message: `You've been assigned a new task: "${taskData.title}"`,
            type: 'task',
            referenceId: createdTask._id,
            referenceModel: 'Task',
            isRead: false,
          },
          Notification
        );
      })
    );
  }
  
    // Ensure we're sending a response
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });

  } catch (error) {
    console.error('Error in createTask:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Task creation failed',
      data: null
    });
  }
};
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updateData = {};
    const mongoose = require('mongoose');
    const { Task ,Notification,ResourceBooking } = req.tenantModels;
   
    // Parse the assigned_resources if it exists
    if (req.body.assigned_resources) {
      const assignedResources = JSON.parse(req.body.assigned_resources);
      
           // In your updateTask controller:
     if (assignedResources.resources && Array.isArray(assignedResources.resources)) {
      updateData.resources = assignedResources.resources
        .filter(resource => resource?.resource?._id)
        .map(resource => ({
          resource: new mongoose.Types.ObjectId(resource.resource?._id),
          relationshipType: resource.relationshipType,
          required: resource.required,
          _id: resource._id 
            ? new mongoose.Types.ObjectId(resource._id) 
            : new mongoose.Types.ObjectId()
        }));
    }
    
     // Transform assignments with proper ObjectIds
     if (Array.isArray(assignedResources.assigned_to)) {
      updateData.assignments = assignedResources.assigned_to.map(user => ({
        user: new mongoose.Types.ObjectId(user.id),
        role: 'assignee',
        _id: new mongoose.Types.ObjectId()
      }));
    }
    
    }

    // Handle images - keptImages should be an array of image IDs to keep
    if (req.body.keptImages) {
      updateData.images = JSON.parse(req.body.keptImages).map(id => 
       new mongoose.Types.ObjectId(id)
      );
    }
   
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadFileToGridFS(file,req.tenantDB).then(result => result.file._id)
      );
      
      const uploadedImageIds = await Promise.all(uploadPromises);
      
      // Combine kept images with new ones (max 5 total)
      updateData.images = [
        ...(updateData.images || []),
        ...uploadedImageIds
      ].slice(0, 5);
    }

    // Handle other fields
    const fieldsToUpdate = [
      'title', 'status', 'priority', 'visibility',
      'task_period', 'repeat_frequency', 'notes'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle schedule if needed
    if (req.body.start || req.body.end) {
      updateData.schedule = {
        start: req.body.start,
        end: req.body.end,
        timezone: req.body.timezone || 'UTC'
      };
    }

    // Handle status color
    if (req.body.status) {
      
      updateData.color_code = getColorForStatus(req.body.status);
    }
    const updatedTask = await taskService.updateTask(
      taskId,
      updateData,
      Task,
      ResourceBooking 
    );
    
    const responseTask = {
      ...updatedTask, // Already a plain object
      assigned_resources: updatedTask.resources || [], // Use the 'resources' field from the task
      images: updatedTask.images || [],
    };

    // Invalidate cache
    const cache = req.tenantCache;

    // Invalidate single task
await cache.del(`task:${taskId}:org:${req.user.org_id}`);

// Invalidate all task lists
await cache.delPattern(`tasks:org:${req.user.org_id}:*`);

// Invalidate all done tasks (global)
await cache.del(`tasks:done:org:${req.user.org_id}`);
console.log(`[CACHE][DEL] tasks:done:org:${req.user.org_id}`);

// Invalidate user-specific caches
if (updatedTask.assignments && updatedTask.assignments.length > 0) {
  for (const assignment of updatedTask.assignments) {
    const userId = typeof assignment.user === 'object'
      ? assignment.user?._id
      : assignment.user;

    if (!userId) continue;

    await cache.del(`tasks:assigned:user:${userId}:org:${req.user.org_id}`);
    await cache.del(`tasks:done:user:${userId}:org:${req.user.org_id}`);

    console.log(`[CACHE][DEL] tasks:assigned:user:${userId}:org:${req.user.org_id}`);
    console.log(`[CACHE][DEL] tasks:done:user:${userId}:org:${req.user.org_id}`);
  }
}

// Notify all assigned users about the update
if (updatedTask.assignments && updatedTask.assignments.length > 0) {
 
  await Promise.all(
    updatedTask.assignments
      .map((assignment) => {
        if (!assignment.user) {
          console.warn("⚠️ Skipping null user in assignment:", assignment);
          return null;
        }
  
        const userId =
          typeof assignment.user === 'object'
            ? assignment.user?._id
            : assignment.user;
  
        // Real-time
        notifyUser(userId.toString(), 'task:updated', {
          taskId: updatedTask._id,
          title: updatedTask.title,
          message: `Task "${updatedTask.title}" has been updated.`,
          updatedBy: req.user.first_name || 'A team member',
          organization: req.user?.org_id
        });
  
        // Persistent notification
        return notificationService.createNotification(
          {
            user: new mongoose.Types.ObjectId(userId),
            organization: req.user.org_id,
            title: 'Task Updated',
            message: `Task "${updatedTask.title}" has been updated.`,
            type: 'task',
            referenceId: updatedTask._id,
            referenceModel: 'Task',
            isRead: false
          },
          Notification
        );
      })
      .filter(Boolean) // filters out null results
  );
  
}

res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: responseTask
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update task'
    });
  }
};
exports.getTaskById = async (req, res) => {
  try {
    const cache = req.tenantCache;
    const cacheKey = `task:${req.params.id}:org:${req.user.org_id}`;
    const { Task } = req.tenantModels;

    const cached = await cache.get(cacheKey);
    if (cached) {
      
      return sendResponse(res, 200, 'Task retrieved from cache', JSON.parse(cached));
    }

    const task = await taskService.getTaskById(req.params.id, Task);
    if (!task) return sendResponse(res, 404, 'Task not found', null);

    await cache.set(cacheKey, JSON.stringify(task), { expiration: 300 });
    
    sendResponse(res, 200, 'Task retrieved successfully', task);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { Task, Notification } = req.tenantModels;
    const cache = req.tenantCache;

    const taskToDelete = await Task.findById(taskId).lean();
    if (!taskToDelete) {
      return sendResponse(res, 404, 'Task not found', null);
    }
    // Now delete the task
    await taskService.deleteTask(taskId, Task);

    // Invalidate cache
    await cache.del(`task:${taskId}:org:${req.user.org_id}`);
    await cache.delPattern(`tasks:org:${req.user.org_id}:*`);
    console.log(`[CACHE][DEL] task:${taskId}:org:${req.user.org_id} and related task lists`);
  // Notify before deletion
  if (taskToDelete.assignments?.length > 0) {
    await Promise.all(
      taskToDelete.assignments.map((assignment) => {
        const userId = assignment.user.toString();
        
        // Real-time
        notifyUser(userId, 'task:deleted', {
          
          taskId: taskToDelete._id,
          title: taskToDelete.title,
          message: `Task "${taskToDelete.title}" has been deleted.`,
          deletedBy: req.user.first_name || 'A team member',
          organization: req.user.org_id,
        });

        // Persistent
        return notificationService.createNotification(
          {
            user: userId,
            organization: req.user.org_id,
            title: 'Task Deleted',
            message: `Task "${taskToDelete.title}" has been deleted.`,
            type: 'task',
            referenceId: taskToDelete._id,
            referenceModel: 'Task',
            isRead: false,
          },
          Notification
        );
      })
    );
  }
    sendResponse(res, 200, 'Task deleted successfully', null);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.getTasksByOrganization = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const { Task } = req.tenantModels;
    const orgId = req.user.org_id;
    const cache = req.tenantCache;

    const cacheKey = `tasks:org:${orgId}:page:${page}:limit:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, 'Tasks retrieved from cache', JSON.parse(cached));
    }

    const tasks = await taskService.getTasksByOrganization(Task, { page, limit });

    await cache.set(cacheKey, JSON.stringify(tasks), { expiration: 300 });
    
    sendResponse(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.filterTasksByOrganization = async (req, res) => {
  try {
    // Handle both POST (body) and GET (query) requests
    const requestData = req.method === 'POST' ? req.body.filters : req.query;
    const orgId = req.user.org_id;
    const { Task } = req.tenantModels;
    const cache = req.tenantCache;

    // Properly extract filters and pagination
    const { 
      page = 1, 
      limit = 10,
      filters: requestFilters = {} 
    } = requestData;

    // Handle cases where filters might be nested or direct
    const filters = typeof requestFilters === 'string' 
      ? JSON.parse(requestFilters) 
      : requestFilters;

    // Process filters
    const parsedFilters = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;
      
      if (value === 'true') parsedFilters[key] = true;
      else if (value === 'false') parsedFilters[key] = false;
      else if (key.endsWith('Date')) {
        parsedFilters[key] = new Date(value);
        if (isNaN(parsedFilters[key].getTime())) {
          throw new Error(`Invalid date format for ${key}`);
        }
      }
      else if (mongoose.Types.ObjectId.isValid(value)) {
        parsedFilters[key] = new mongoose.Types.ObjectId(value);
      }
      else if (key === 'tags' && typeof value === 'string') {
        parsedFilters[key] = value.split(',');
      }
      else {
        parsedFilters[key] = value;
      }
    }
    const filterKey = JSON.stringify(parsedFilters);
    const cacheKey = `tasks:filter:org:${orgId}:page:${page}:limit:${limit}:filters:${Buffer.from(filterKey).toString('base64')}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`[CACHE][HIT] ${cacheKey}`);
      return sendResponse(res, 200, 'Tasks filtered (cached)', JSON.parse(cached));
    }
    const result = await taskService.filterTasksByOrganization(
      orgId,
      Task,
      { 
        page: parseInt(page), 
        limit: Math.min(parseInt(limit), 100),
        filters: parsedFilters
      }
    );
    
    await cache.set(cacheKey, JSON.stringify(result), { expiration: 300 }); // Cache for 5 minutes
    console.log(`[CACHE][SET] ${cacheKey}`);

    sendResponse(res, 200, 'Tasks filtered successfully', result);
  } catch (error) {
    console.error('Filter error:', error);
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.changeTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { Task } = req.tenantModels;
    const cache = req.tenantCache;

    const updatedTask = await taskService.changeTaskStatus(
      req.params.id,
      status,
      req.user._id,
      notes,
      req.user.org_id,
      Task
    );

    // Invalidate the specific task and related task lists
    await cache.del(`task:${req.params.id}:org:${req.user.org_id}`);
    await cache.delPattern(`tasks:org:${req.user.org_id}:*`);
    
    sendResponse(res, 200, 'Task status updated successfully', updatedTask);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.getAllDoneTasks = async (req, res) => {
  try {
    const { Task } = req.tenantModels;
    const cache = req.tenantCache;
    const cacheKey = `tasks:done:org:${req.user.org_id}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      
      return sendResponse(res, 200, 'Done tasks from cache', JSON.parse(cached));
    }

    const tasks = await taskService.fetchAllDoneTasks(req.user.org_id, Task);
    await cache.set(cacheKey, JSON.stringify(tasks), { expiration: 300 });
    
    sendResponse(res, 200, 'Done tasks retrieved successfully', tasks);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.getDoneTasksForUser = async (req, res) => {
  const { userId } = req.query;
  const { Task } = req.tenantModels;
  const cache = req.tenantCache;

  if (!userId) {
    return sendResponse(res, 400, 'User ID is required', null);
  }

  const cacheKey = `tasks:done:user:${userId}:org:${req.user.org_id}`;
  try {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendResponse(res, 200, 'Done tasks for user from cache', JSON.parse(cached));
    }

    const tasks = await taskService.fetchDoneTasksForUser(userId, req.user.org_id, Task);
    await cache.set(cacheKey, JSON.stringify(tasks), { expiration: 300 });
    
    sendResponse(res, 200, 'Done tasks retrieved successfully', tasks);
  } catch (error) {
    sendResponse(res, error.statusCode || 500, error.message, null);
  }
};
exports.getTasksByAssignedUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const { Task } = req.tenantModels;
    const cache = req.tenantCache;

    if (!userId) {
      return sendResponse(res, 400, 'User ID is required', null);
    }

    const cacheKey = `tasks:assigned:user:${userId}:org:${req.user.org_id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      
      return sendResponse(res, 200, 'Assigned tasks from cache', JSON.parse(cached));
    }

    const tasks = await taskService.getTasksByAssignedUser(userId, req.user.org_id, Task);
    await cache.set(cacheKey, JSON.stringify(tasks), { expiration: 300 });
    
    sendResponse(res, 200, 'Assigned tasks retrieved successfully', tasks);
  } catch (error) {
    sendResponse(res, 500, 'Failed to fetch tasks', { details: error.message });
  }
};
exports.getTaskReportData = async (req, res) => {
  try {
    const { Task } = req.tenantModels;
    const filter = {
      organization: req.user.org_id,
      status: 'done'
    };
    
    // --- UPDATED FILTER LOGIC ---
    const { startDate, endDate, userIds, resourceIds } = req.query;

    if (startDate) {
      filter['schedule.end'] = { ...filter['schedule.end'], $gte: new Date(startDate) };
    }
    if (endDate) {
      filter['schedule.start'] = { ...filter['schedule.start'], $lte: new Date(endDate) };
    }
    
    // Handle an array of User IDs sent from the frontend
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      filter['assignments.user'] = { $in: userIds };
    }
    
    // Handle an array of Resource IDs sent from the frontend
    if (resourceIds && Array.isArray(resourceIds) && resourceIds.length > 0) {
      // Find tasks where any of the specified resources were logged or planned
      filter['$or'] = [
          { 'resources.resource': { $in: resourceIds } },
          { 'resourceLogs.resource': { $in: resourceIds } }
      ];
    }
    
    const tasks = await taskService.getReportData(filter, Task);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Error in getTaskReportData controller:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve report data' });
  }
};