const { v4: uuidv4 } = require('uuid'); // UUID for unique IDs
// const generateRecurringTasks = (taskData, frequency) => {
//     const startDate = new Date(taskData.start_time);
//     const endDate = new Date(taskData.end_time);
//     const recurringTasks = [];
//     const currentYear = new Date().getFullYear();
  
//     const incrementDate = (date, frequency) => {
//       const newDate = new Date(date);
//       switch (frequency) {
//         case 'daily':
//           newDate.setDate(newDate.getDate() + 1);
//           break;
//         case 'weekly':
//           newDate.setDate(newDate.getDate() + 7);
//           break;
//         case 'monthly':
//           newDate.setMonth(newDate.getMonth() + 1);
//           break;
//         default:
//           throw new Error(`Unsupported frequency: ${frequency}`);
//       }
//       return newDate;
//     };
  
//     let nextStartDate = startDate;
//     let nextEndDate = endDate;
  
//     while (nextStartDate.getFullYear() === currentYear) {
//       const newTask = {
//         ...taskData,
//         _id: `task:${uuidv4()}`,
//         start_time: nextStartDate.toISOString(),
//         end_time: nextEndDate.toISOString(),
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       };
  
//       recurringTasks.push(newTask);
  
//       nextStartDate = incrementDate(nextStartDate, frequency);
//       nextEndDate = incrementDate(nextEndDate, frequency);
//     }
  
//     return recurringTasks;
//   };
//   module.exports=generateRecurringTasks;
const generateRecurringTasksWithinPeriod = (baseTask, repeatFrequency, taskPeriodEnd) => {
  const additionalTasks = [];
  let nextStartTime = new Date(baseTask.start_time);
  let nextEndTime = new Date(baseTask.end_time);
  const taskPeriodLimit = new Date(taskPeriodEnd);

  while (nextStartTime < taskPeriodLimit) {
    switch (repeatFrequency.toLowerCase()) {
      case "daily":
        nextStartTime.setDate(nextStartTime.getDate() + 1);
        nextEndTime.setDate(nextEndTime.getDate() + 1);
        break;
      case "weekly":
        nextStartTime.setDate(nextStartTime.getDate() + 7);
        nextEndTime.setDate(nextEndTime.getDate() + 7);
        break;
      case "monthly":
        nextStartTime.setMonth(nextStartTime.getMonth() + 1);
        nextEndTime.setMonth(nextEndTime.getMonth() + 1);
        break;
      default:
        throw new Error(`Invalid repeat frequency: ${repeatFrequency}`);
    }

    if (nextStartTime > taskPeriodLimit) break;

    additionalTasks.push({
      ...baseTask,
      _id: `task:${uuidv4()}`, // Unique ID for recurring task
      start_time: nextStartTime.toISOString(),
      end_time: nextEndTime.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return additionalTasks;
};
module.exports=generateRecurringTasksWithinPeriod;