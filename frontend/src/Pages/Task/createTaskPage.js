import React from 'react';
import { useSelector } from 'react-redux';
import TaskForm from '../../Components/taskComponents/taskForm';
import { toast } from 'react-toastify';

const TaskPage = ({ onClose, onEventCreate, event, isOffset = false }) => {
  // Get all resource types from Redux store
  const { resourceTypes } = useSelector((state) => state.resourceTypes);
  
  const initialTaskData = {
    title: event?.title || "",
    start_time: event?.start_time || "",
    end_time: event?.end_time || "",
    color_code: event?.color_code || "",
    assignedResources: event?.assignedResources || [],
    
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (onEventCreate) {
        await onEventCreate(taskData);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      const errorMessage = 
        error?.message || "An unknown error occurred while creating the task.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className={`mt-3 ${isOffset ? '' : 'lg:ml-96'}`}>
      <TaskForm 
        onSubmit={handleTaskSubmit} 
        initialData={initialTaskData}
        resourceTypes={resourceTypes} // Pass all resource types
      />
    </div>
  );
};

export default TaskPage;