// This function takes the raw API response and flattens it for the UI grid.
export const transformApiData = (tasks) => {
    if (!Array.isArray(tasks)) return [];
  
    return tasks.map(task => {
      // Calculate Labor Cost
      const laborCost = task.timeLogs.reduce((sum, log) => {
        const rate = log.user?.payroll?.rate || 0;
        const duration = log.durationMinutes || 0;
        return sum + (rate / 60) * duration;
      }, 0);
  
      // Calculate Resource Cost & Items Produced
      let totalResourceCost = 0;
      let itemsProduced = 0;
      task.resourceLogs.forEach(log => {
        if (log.action === 'consumed' || log.action === 'used') {
          const costField = log.resource?.fields ? Object.keys(log.resource.fields).find(key => key.startsWith('cost_per_')) : null;
          if (costField) {
            const costRate = log.resource.fields[costField] || 0;
            totalResourceCost += (log.quantity || 0) * costRate;
          }
        } else if (log.action === 'produces') {
          itemsProduced += log.quantity || 0;
        }
      });
  
      // Flatten data for the grid
      return {
        id: task._id,
        title: task.title,
        completedOn: new Date(task.schedule.end).toLocaleDateString(),
        assignedUser: task.assignments[0]?.user.first_name || 'N/A',
        userRate: task.timeLogs[0]?.user.payroll.rate || 0,
        loggedTimeMinutes: task.timeLogs.reduce((sum, log) => sum + log.durationMinutes, 0),
        laborCost,
        resourceUsed: task.resourceLogs[0]?.resource.displayName || 'N/A',
        resourceQty: task.resourceLogs[0]?.quantity || 0,
        totalResourceCost,
        itemsProduced,
        costPerItem: itemsProduced > 0 ? (laborCost + totalResourceCost) / itemsProduced : 0,
      };
    });
  };
  
  // This function calculates KPIs from the already transformed data.
  export const calculateKPIs = (transformedTasks) => {
    if (!transformedTasks.length) {
      return {
        totalTasks: 0, totalLaborCost: 0, totalHoursLogged: 0,
        averageTaskDuration: 0, totalResourceCost: 0, totalItemsProduced: 0,
      };
    }
  
    const totalTasks = transformedTasks.length;
    const totalLaborCost = transformedTasks.reduce((sum, task) => sum + task.laborCost, 0);
    const totalHoursLogged = transformedTasks.reduce((sum, task) => sum + (task.loggedTimeMinutes / 60), 0);
    const averageTaskDuration = transformedTasks.reduce((sum, task) => sum + task.loggedTimeMinutes, 0) / totalTasks;
    const totalResourceCost = transformedTasks.reduce((sum, task) => sum + task.totalResourceCost, 0);
    const totalItemsProduced = transformedTasks.reduce((sum, task) => sum + task.itemsProduced, 0);
  
    return {
      totalTasks, totalLaborCost, totalHoursLogged,
      averageTaskDuration, totalResourceCost, totalItemsProduced,
    };
  };