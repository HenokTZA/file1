
import React, { useState, useCallback, useEffect } from 'react'; 
import DynamicFormField from './dynamicFormField';
import { SelectInput } from './selectInput';
import RichTextEditor from './richTextEditor';
import { useResources } from '../../hooks/useResources';
import { useUsers } from '../../hooks/useUsers';
import { useDebounce } from '../../hooks/useDebounce'; // Import the new hook

import RecurrencePicker from './recurrencePicker';
const formatDateTimeLocal = (date) => {
    if (!date) return ''; // Handle cases where date might be null
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const TaskForm = ({ onSubmit, initialData = {}, resourceTypes }) => {
    const getInitialState = () => {
        // Default start time is now
        const defaultStartTime = new Date();
        // Default end time is one hour after the start time
        const defaultEndTime = new Date(defaultStartTime);
        defaultEndTime.setHours(defaultStartTime.getHours() + 1);

        const defaults = {
            start_time: formatDateTimeLocal(defaultStartTime),
            end_time: formatDateTimeLocal(defaultEndTime),
            status: 'pending', // Also a good place for other defaults!
        };
        return (defaults);
    };
   
    const [formData, setFormData] = useState(getInitialState());
    const debouncedStartTime = useDebounce(formData.start_time, 500); // 500ms delay
    const debouncedEndTime = useDebounce(formData.end_time, 500);

    // const typeIds = resourceTypes?.map(type => type._id) || [];
    // const { getResourcesByType, loading: resourcesLoading } = useResources(typeIds);
    const { 
        availableResources,
        isFetchingAvailable,
        getAvailableResourcesForType,
      } = useResources();
    const { users, loading: usersLoading } = useUsers();
    
    useEffect(() => {
        // const { start_time, end_time } = formData;
        if (debouncedStartTime && debouncedEndTime && resourceTypes?.length > 0) {
            resourceTypes.forEach(type => {
                getAvailableResourcesForType(type._id, debouncedStartTime, debouncedEndTime);
            });
        }
        // Ensure we have valid dates and a list of types to check
        // if (start_time && end_time && resourceTypes?.length > 0) {
            
        //     // For each resource type, trigger the API call to check availability
        //     resourceTypes.forEach(type => {
        //         getAvailableResourcesForType(type._id, start_time, end_time);
        //     });
        // }
    }, [debouncedStartTime, debouncedEndTime,formData.start_time, formData.end_time, resourceTypes, getAvailableResourcesForType]);

    const handleResourceSelect = (resourceTypeId, event) => {
        const selectedResources = event.target.value;
        
        setFormData(prev => ({
            ...prev,
            resources: {
                ...prev.resources,
                [resourceTypeId]: Array.isArray(selectedResources)
                    ? selectedResources
                    : [selectedResources].filter(Boolean)
            }
        }));
    };

    
    const handleRecurrenceChange = useCallback((recurrenceValues) => {
        setFormData(prevData => ({
            ...prevData,
            ...recurrenceValues
        }));
    }, []); 

    // const renderResourceFields = () => {
    //     if (!resourceTypes?.length) return null;

    //     return Object.entries(
    //         resourceTypes.reduce((acc, type) => {
    //             const category = type.category || 'other';
    //             if (!acc[category]) acc[category] = [];
    //             acc[category].push(type);
    //             return acc;
    //         }, {})
    //     ).map(([category, types]) => (
    //         <div key={category} className="space-y-4">
    //             <h2 className="text-lg font-semibold capitalize">{category}</h2>
    //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    //                 {types.map(type => {
    //                     const resources = getResourcesByType(type._id);
    //                     const isLoading = !resources.length && resourcesLoading;

    //                     return (
    //                         <div key={type._id} className="border rounded-lg p-4 bg-white">
    //                             {isLoading ? (
    //                                 <div>Loading {type.name} resources...</div>
    //                             ) : (
    //                                 <DynamicFormField
    //                                     field={{
    //                                         fieldName: `resources.${type._id}`,
    //                                         displayName: type.name,
    //                                         fieldType: 'select',
    //                                         multiple: true,
    //                                         options: resources.map(res => ({
    //                                             label: res.displayName || res.name,
    //                                             value: res._id
    //                                         }))
    //                                     }}
    //                                     value={formData.resources?.[type._id] || []}
    //                                     onChange={(selected) => handleResourceSelect(type._id, selected)}
    //                                 />
    //                             )}
    //                             {type.description && (
    //                                 <p className="text-xs text-gray-500 mt-2">{type.description}</p>
    //                             )}
    //                         </div>
    //                     );
    //                 })}
    //             </div>
    //         </div>
    //     ));
    // };
    const renderResourceFields = () => {
        if (!resourceTypes?.length) return null;
    
        return Object.entries(
            resourceTypes.reduce((acc, type) => {
                            const category = type.category || 'other';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(type);
                            return acc;
                        }, {})        
                    ).map(([category, types]) => (
            <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {types.map(type => {
                        // +++ UPDATE THIS LOGIC +++
                        // 1. Get the list of available resources for this specific type from the Redux state map.
                        const resources = availableResources[type._id] || [];
                        
                        // 2. Use the new loading state.
                        const isLoading = isFetchingAvailable;
    
                        return (
                            <div key={type._id} className="border rounded-lg p-4 bg-white">
                                {isLoading ? (
                                    <div className="text-sm text-gray-500 animate-pulse">
                                        Checking availability...
                                    </div>
                                ) : (
                                    <DynamicFormField
                                        field={{
                                            fieldName: `resources.${type._id}`,
                                            displayName: type.name,
                                            fieldType: 'select',
                                            multiple: true,
                                            // 3. Map over the NEW resources list
                                            options: resources.map(res => ({
                                                label: res.displayName || res.name, // The backend sends the full resource object
                                                value: res._id
                                            }))
                                        }}
                                        value={formData.resources?.[type._id] || []}
                                        // Make sure the onChange is correct
                                        onChange={(e) => handleResourceSelect(type._id, e)}
                                    />
                                )}
                                {type.description && (
                                    <p className="text-xs text-gray-500 mt-2">{type.description}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    
    //     // +++ ADD LOGIC TO FLATTEN RESOURCES +++
    //     const resourcesByTypeId = formData.resources || {};
    //     const flattenedResources = Object.values(resourcesByTypeId)
    //         .flat() // Flatten the array of arrays
    //         .map(resourceId => ({ resource: resourceId })); // Format for the backend
    
    //     const payload = {
    //         ...formData,
    //         resources: flattenedResources, // Overwrite with the correct format
    //         // The backend expects `schedule.start` and `schedule.end`
    //         schedule: {
    //             start: formData.start_time,
    //             end: formData.end_time,
    //         }
    //     };
    
    //     // Clean up top-level time fields if the backend doesn't expect them
    //     delete payload.start_time;
    //     delete payload.end_time;
    
    //     onSubmit(payload); // Submit the correctly formatted payload
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleNotesChange = (value) => {
        setFormData({ ...formData, notes: value });
    };

    return (
        // The rest of your JSX remains the same
        <form onSubmit={handleSubmit} className="space-y-4 p-4 mt-7 md:px-6 bg-blue-50 shadow-md rounded-md max-w-full lg:max-w-6xl lg:mr-4">
            <h1 className="text-xl font-bold text-center flex justify-center mb-6">
                Create Task
            </h1>

            {/* Basic Task Info */}
            <div className="space-y-4">
                {/* First Row - Title and Assigned To (2 cols) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <DynamicFormField
                            field={{
                                fieldName: 'title',
                                displayName: 'Title',
                                fieldType: 'text',
                                required: true
                            }}
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <DynamicFormField
                            field={{
                                fieldName: "assigned_to",
                                displayName: "Assign To",
                                fieldType: "select",
                                multiple: true,
                                options: users.map(user => ({
                                    label: user.name || user.email,
                                    value: user._id
                                }))
                            }}
                            value={formData.assigned_to || []}
                            onChange={handleChange}
                            isLoading={usersLoading}
                        />
                    </div>
                </div>

                {/* Second Row - Start and End Times (2 cols) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <DynamicFormField
                            field={{
                                fieldName: 'start_time',
                                displayName: 'Start Time',
                                fieldType: 'datetime',
                                required: true
                            }}
                            value={formData.start_time}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <DynamicFormField
                            field={{
                                fieldName: 'end_time',
                                displayName: 'End Time',
                                fieldType: 'datetime',
                                required: true
                            }}
                            value={formData.end_time}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Third Row - The remaining three fields (3 cols) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div >
                        <RecurrencePicker
                            value={{
                                repeat_frequency: formData.repeat_frequency,
                                task_period: formData.task_period // Pass current values
                            }}
                            onChange={handleRecurrenceChange}
                            startDate={formData.start_time} // Pass the task's start date!
                        />
                    </div>
                    <div>
                        <SelectInput
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={[
                                { label: 'Pending', value: 'pending' },
                                { label: 'In Progress', value: 'in progress' },
                                { label: 'Done', value: 'done' },
                                { label: 'Overdue', value: 'overdue' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {renderResourceFields()}
            </div>

            <div className="mt-6">
                <label className="block mb-1 text-sm font-medium text-gray-600">Notes</label>
                <RichTextEditor value={formData.notes} onChange={handleNotesChange} />
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
                Create Task
            </button>
        </form>
    );
};

export default TaskForm;