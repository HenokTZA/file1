
import { useState, useEffect, useCallback } from 'react'; // <-- Step 1
import {  useSelector } from 'react-redux';
import RichTextEditor from './richTextEditor';
import {SelectInput} from './selectInput';
import DOMPurify from 'dompurify';
import RecurrencePicker from './recurrencePicker'; // <-- Step 1 (Adjust path)
import { useDebounce } from '../../hooks/useDebounce';
import ImageSlider from './imageSlider';
import { useResources } from '../../hooks/useResources';
import { useUsers } from '../../hooks/useUsers';
import {getTimezoneOffsetHours} from '../../Helper/getTimezones';
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Pad single digit month/day/hour/minute with a leading zero
    const pad = (num) => num.toString().padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Invalid date for formatting:", dateString);
    return '';
  }
};
const adjustTimeForBackend = (time, timezoneInput) => {
  try {
    // Validate time
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      console.error('Invalid date input:', time);
      return null;
    }

    // Get offset in hours (handles both numbers and timezone names)
    const timezoneOffset = getTimezoneOffsetHours(timezoneInput);
    
    // Calculate adjusted time
    const utcTime = date.getTime();
    const adjustedTime = new Date(utcTime + timezoneOffset * 60 * 60 * 1000);

    if (isNaN(adjustedTime.getTime())) {
      console.error('Invalid adjusted time:', adjustedTime);
      return null;
    }

    return adjustedTime.toISOString();
  } catch (error) {
    console.error('Error adjusting time:', error);
    return null;
  }
};
const statusStyles = {
  pending: 'bg-gray-200 text-gray-800 ring-gray-300',
  in_progress: 'bg-blue-200 text-blue-800 ring-blue-300',
  done: 'bg-green-200 text-green-800 ring-green-300',
  impossible: 'bg-red-200 text-red-800 ring-red-300',
  overdue: 'bg-yellow-200 text-yellow-800 ring-yellow-300',
};
const EventDetailsModal = ({
  isVisible,
  closeModal,
  selectedEvent,
  role,
  handleDelete,
  handleFormSubmit,
}) => {
   
const [newImages, setNewImages] = useState([]); // Store new images for preview
const [images, setImages] = useState([]);
const token = useSelector(state => state.auth.token);
const { resourceTypes } = useSelector((state) => state.resourceTypes);
const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [editableEvent, setEditableEvent] = useState(selectedEvent || {});
const { users = [] } = useUsers();
const {
  availableResources,
  isFetchingAvailable,
  getAvailableResourcesForType,
} = useResources();

useEffect(() => {
  setEditableEvent(selectedEvent || {});
}, [selectedEvent]);

const debouncedStartTime = useDebounce(editableEvent?.start, 500); 
const debouncedEndTime = useDebounce(editableEvent?.end, 500);

   // 2. Add the useEffect to fetch available resources
   useEffect(() => {
     // Only run if we are in edit mode and have valid dates/types
     if (isEditMode && debouncedStartTime && debouncedEndTime && resourceTypes?.length > 0) {
       resourceTypes.forEach(type => {
         getAvailableResourcesForType(type._id, debouncedStartTime, debouncedEndTime);
       });
     }
   // 3. Set the correct dependencies
   }, [isEditMode, debouncedStartTime, debouncedEndTime, resourceTypes, getAvailableResourcesForType]);

const handleChange = (e) => {
  const { name, value } = e.target;
  let processedValue;

  // Case 1: Handle the date inputs specifically.
  if (name === 'start' || name === 'end') {
    // Convert the timezone-naive string from the input into a proper local Date object.
    processedValue = new Date(value);
  
  // Case 2: Handle multi-select inputs that pass an array of values.
  } else if (Array.isArray(value)) {
    // Create a new array to ensure React recognizes the state change.
    processedValue = [...value];

  // Case 3: Handle all other standard inputs (text, single-select, etc.).
  } else {
    processedValue = value;
  }

  // Finally, update the state ONCE with the correctly processed value.
  setEditableEvent((prev) => ({
    ...prev,
    [name]: processedValue,
  }));
};


  useEffect(() => {
    const fetchImages = async () => {
      if (!editableEvent?.images?.length) return;
  
      try {
        const queryParam = editableEvent.images.join(',');
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/tasks/images/bulk?fileIds=${queryParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
  
        if (data.success) {
          const imageBlobs = await Promise.all(
            data.data.map(async (img) => {
              try {
                const response = await fetch(
                  `${process.env.REACT_APP_API_BASE_URL}/api/tasks/image/${img.fileId}`,
                  {
                    method: 'GET',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
        
                if (!response.ok) throw new Error('Failed to fetch image');
                
               
                const blob = await response.blob();
               
                
                if (blob.size === 0) {
                  throw new Error('Received empty blob');
                }
                
                const objectUrl = URL.createObjectURL(blob);
                console.log("Object URL created:", objectUrl);
        
                return {
                  url: objectUrl,
                  contentType: img.contentType,
                  filename: img.filename,
                };
              } catch (err) {
                console.error(`Failed to load image ${img.fileId}`, err);
                return null;
              }
            })
          );
        
          console.log("Final image blobs:", imageBlobs);
          setImages(imageBlobs.filter(Boolean));
        }
      } catch (err) {
        console.error("Error fetching image metadata:", err);
      }
    };
  
    fetchImages();
  
    // Cleanup function
    return () => {
      images.forEach(img => {
        if (img?.url) URL.revokeObjectURL(img.url);
      });
    };
  }, [editableEvent]);
 

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const handleRemoveImage = (image) => {
    setImages((prevImages) => prevImages.filter((img) => img !== image));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prevNewImages) => prevNewImages.filter((_, i) => i !== index));
  };
  const handleRecurrenceChange = useCallback((recurrenceValues) => {
    // This function receives an object like { repeat_frequency: 'weekly', task_period: '2 weeks' }
    // and merges it into the existing event state.
    setEditableEvent(prevEvent => ({
        ...prevEvent,
        ...recurrenceValues, 
    }));
}, []);

  const onSubmit = (e) => {
    e.preventDefault();
    // 1. Get the user's timezone, exactly like in handleEventResize
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fallbackTimezoneOffset = new Date().getTimezoneOffset() / -60;
  const timezoneToUse = userTimezone || fallbackTimezoneOffset;

  // 2. Call the adjustment function on the Date objects from our state
  // This is the CRUCIAL step that mirrors your working code.
  const adjustedStartTime = adjustTimeForBackend(editableEvent.start, timezoneToUse);
  const adjustedEndTime = adjustTimeForBackend(editableEvent.end, timezoneToUse);

    // Prepare the complete payload
    const payload = {
      ...editableEvent,
      images: images, // Current images
      newImages: newImages, // Newly uploaded images
      // Ensure dates are properly formatted if needed
      start: adjustedStartTime, // Use the adjusted time
    end: adjustedEndTime, 
            assigned_resources: editableEvent.assigned_resources,
      notes: editableEvent.notes,
      repeat_frequency: editableEvent.repeat_frequency,
      task_period: editableEvent.task_period
    };
  
    // Remove any undefined or null values
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v != null)
    );
    handleFormSubmit(cleanPayload);
  };
   const handleStatusChange = async (newStatus) => {
    // Create an updated event object with only the status changed
    const updatedEvent = {
      ...editableEvent,
      status: newStatus,
    };
  
    // Call the main form submission handler with this updated event
    // This assumes handleFormSubmit can handle the full event object
    await handleFormSubmit(updatedEvent);
  
    // Close the menu after selection
    setIsStatusMenuOpen(false);
  };
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  if (!isVisible || !editableEvent) return null;
  if (!editableEvent) {
    return <p>Loading event details...</p>;  // Show a loading message instead of crashing
  }
  
  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-5xl w-full">
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-2 right-2 text-red-700 hover:text-red-900 text-2xl font-bold transition-transform transform hover:scale-110"
          aria-label="Close"
        >
          &times;
        </button>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
          <h3 className="font-semibold bg-blue-200 text-gray-800 px-5 py-1 rounded-md hover:bg-blue-300 border-y-2 border-blue-400">
  Event Information
</h3>

            <div className='space-x-2'>
            {role >= 3 && (
              <button
                type="button"
                className="bg-red-700 md:ml-[100px] text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                onClick={() => handleDelete(editableEvent?._id)}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={toggleEditMode}
              className="mr-2  bg-blue-200 text-gray-800 px-5 py-1 rounded-md hover:bg-blue-300 border-y-2 border-blue-400 transition"
            >
              {isEditMode ? 'Cancel' : 'Edit'}
            </button>
            </div>
          </div>

          {/* Conditional rendering based on edit mode */}
          {isEditMode ? (
              <>
            {isEditMode && (
  <div className="max-h-[80vh] overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-inner">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* Title */}
      {role >= 3 && (
        <div>
          <label className="block mb-1 text-sm font-medium">Title:</label>
          <input
            type="text"
            name="title"
            defaultValue={editableEvent?.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      )}

      {/* Start Time */}
      {role >= 2 && (
       <div>
       <label className="block mb-1 text-sm font-medium">Start Time:</label>
       <input
         type="datetime-local"
         name="start"
         // Use value and the new helper function
         value={formatDateForInput(editableEvent?.start)}
         onChange={handleChange}
         className="w-full px-3 py-2 border rounded-md"
       />
     </div>
      )}

      {/* End Time */}
      {role >= 2 && (
       <div>
       <label className="block mb-1 text-sm font-medium">End Time:</label>
       <input
         type="datetime-local"
         name="end"
         // Use value and the new helper function
         value={formatDateForInput(editableEvent?.end)}
         onChange={handleChange}
         className="w-full px-3 py-2 border rounded-md"
       />
     </div>
      )}

{role >= 2 && (
  // We give it more space (col-span-2) as it's a more complex component
  <div className="md:col-span-2"> 
    
    <RecurrencePicker
        value={{
            repeat_frequency: editableEvent?.repeat_frequency,
            task_period: editableEvent?.task_period
        }}
        onChange={handleRecurrenceChange}
        startDate={editableEvent?.start} // Pass the event's start date
    />
  </div>
)}

      
      {/* Status */}
      {role >= 2 && (
        <div>
          <label className="block mb-1 text-sm font-medium">Status:</label>
          <select
            name="status"
            defaultValue={editableEvent?.status || "pending"}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="impossible">Impossible</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      )}

      {/* Upload Images */}
      {role >= 2 && (
        <div>
          <label className="block text-sm font-medium">Upload Image:</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFileChange}
            className="w-full px-2 py-1 border rounded-md text-sm"
          />
        </div>
      )}
    </div>

    {/* Image Previews */}
    {role >= 2 && (
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Images */}
        <div>
          <h3 className="text-sm font-semibold mb-2 bg-blue-400 text-white px-4 py-1 rounded-md">Current Images:</h3>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative w-24 h-24">
                 <img
              src={image.url || image.base64 || image}
              alt={image.filename || `Image ${index + 1}`}  className="w-full h-full object-cover rounded-md" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage(image);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Images */}
        <div>
          <h3 className="text-sm font-semibold mb-2 bg-blue-400 text-white px-4 py-1 rounded-md">New Images:</h3>
          <div className="flex flex-wrap gap-2">
            {newImages.map((file, index) => (
              <div key={index} className="relative w-24 h-24">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveNewImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Resources Section */}
   
{role >= 3 && resourceTypes && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-3">Resources</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Assigned People */}
      <div className="border rounded-lg p-4 bg-white">
        <SelectInput
          label="Assigned People"
          name="assigned_resources.assigned_to"
          value={editableEvent?.assigned_resources?.assigned_to?.map(u => u.id) || []}
          onChange={(e) => {
            const selectedUserIds = e.target.value || [];
            const selectedUsers = selectedUserIds.map(id => 
              users.find(u => u._id === id)
            );
            
            setEditableEvent(prev => ({
              ...prev,
              assigned_resources: {
                ...prev.assigned_resources,
                assigned_to: selectedUsers
              }
            }));
          }}
          options={users?.map(u => ({ label: u.full_name, value: u._id })) || []}
          isMulti
        />
      </div>

     
      {resourceTypes.map(type => {

        const resourcesForThisType = availableResources[type._id] || [];

        // 2. Get the currently selected resources for this type to set the dropdown's value
        const currentResourcesForType = editableEvent?.assigned_resources?.resources
          ?.filter(res => (res.resource?.type?._id || res.resource?.type) === type._id)
          ?.map(res => res.resource._id) || [];
        
        // 3. Use the new loading state
        const isLoading = isFetchingAvailable;

        return (
          <div key={type._id} className="border rounded-lg p-4 bg-white">
            {isLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">
                    Checking availability...
                </div>
            ) : (
                <SelectInput
                  label={type.name}
                  name={`resources_${type._id}`}
                  value={currentResourcesForType}
                  onChange={(e) => {
                    const selectedResourceIds = e.target.value || [];
                    
                    const otherResources = editableEvent?.assigned_resources?.resources?.filter(
                      res => (res.resource?.type?._id || res.resource?.type) !== type._id
                    ) || [];

                    // 4. Map over the NEW availableResources list to find the full object
                    const newResources = selectedResourceIds.map(resourceId => {
                      const resource = resourcesForThisType.find(r => r._id === resourceId);
                      
                      return {
                        _id: resource?._id, // Use optional chaining for safety
                        relationshipType: "requires",
                        required: false,
                        resource: {
                          _id: resourceId,
                          type: type,
                          displayName: resource?.displayName,
                          ...resource
                        }
                      };
                    });

                    setEditableEvent(prev => ({
                      ...prev,
                      assigned_resources: {
                        ...prev.assigned_resources,
                        resources: [...otherResources, ...newResources]
                      }
                    }));
                  }}
                  // 5. Populate options from the NEW availableResources list
                  options={resourcesForThisType.map(r => ({
                    label: r.displayName || r.name,
                    value: r._id
                  }))}
                  isMulti
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
)}
    {/* Notes */}
    {role >= 2 && (
      <div className="mt-6">
        <label className="block mb-1 text-sm font-medium">Note:</label>
        <RichTextEditor
          value={editableEvent?.notes}
          onChange={(value) => handleChange({ target: { name: "notes", value } })}
        />
      </div>
    )}
  </div>
)}

            </>
          ): (
            <div className="space-y-4">              <div className="flex justify-between items-center border-b pb-4">
                {/* --- LEFT SIDE: Title and Status Changer --- */}
                <div className="flex items-center gap-x-4">
                 
                  {/* --- STATUS QUICK-CHANGER --- */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-opacity-50 flex items-center gap-x-1.5 transition-transform hover:scale-105 focus:outline-none ${
                        statusStyles[editableEvent?.status] || statusStyles.pending
                      }`}
                    >
                      {/* Optional: Add a small dot for visual flair */}
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {editableEvent?.status.replace('_', ' ') || 'Pending'}
                    </button>
          
                    {/* Dropdown Menu */}
                    {isStatusMenuOpen && (
                      <div className="absolute top-full mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {['in_progress', 'done', 'impossible', 'overdue'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(status)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
               
              </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {/* Image Slider */}
                {images.length > 0 && (
                  <div className="col-span-full flex justify-center mb-4">
                    <ImageSlider images={images} />
                  </div>
                )}
            
                {/* Start, End, Status CARD */}
                <div className="bg-blue-100 shadow-md rounded-xl p-4 transform rotate-[-1deg] space-y-2">
                  <p className="font-bold text-lg text-gray-800">🕒 Event Timing</p>
                  <p><strong>Start:</strong> {new Date(editableEvent?.start).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(editableEvent?.end).toLocaleString()}</p>
                  {/* We keep this here for clarity, even though it's also in the header */}
                  <p><strong>Status:</strong> {editableEvent?.status || 'pending'}</p>
                </div>
            
                {/* Repeat + Assigned To CARD */}
                <div className="bg-gray-200 shadow-md rounded-xl p-4 transform rotate-[1deg] space-y-2">
                  <p className="font-bold text-lg text-gray-800">🔁 Assignment</p>
                  <p><strong>Repeat:</strong> {editableEvent?.repeat_frequency || 'none'}</p>
                  <div>
                    <p className="font-semibold">Assigned To:</p>
                    {editableEvent?.assigned_resources?.assigned_to?.map(user => (
                      <div key={user._id} className="text-sm">
                        {user.name || user.email} {user.role && `(${user.role})`}
                      </div>
                    ))}
                  </div>
                </div>
            
                {/* Resources CARDs */}
                {editableEvent?.assigned_resources?.resources?.length > 0 &&
                  chunkArray(editableEvent.assigned_resources.resources, 3).map((chunk, index) => (
                    <div
                      key={index}
                      className={`bg-blue-100 shadow-md rounded-xl p-4 space-y-2 transform ${
                        index % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[1deg]'
                      }`}
                    >
                      <p className="font-bold text-lg text-gray-800">
                        📦 Resources {chunk.length < 3 ? '' : `(# ${index + 1})`}
                      </p>
                      {chunk.map(resource => (
                        <div key={resource._id} className="text-sm">
                          <strong>{resource.resource?.type?.name || 'Type'}:</strong>{' '}
                          {resource.resource?.displayName || 'Unnamed'}
                          {resource.required && (
                            <span className="text-xs text-red-600 ml-2">(required)</span>
                          )}
                        </div>
                      ))}
                    </div>
                ))}
            
                {/* Notes CARD */}
                <div className="bg-gray-200 shadow-md rounded-xl p-4 transform rotate-[2deg] space-y-2 col-span-full">
                  <p className="font-bold text-lg text-gray-900">📝 Notes</p>
                  <div className="prose prose-sm max-w-none">
                     {/* Assuming notes might contain HTML, using DOMPurify for safety */}
                     <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editableEvent?.notes) }} />
                  </div>
                </div>
              </div>
            </div>
          )}

      <div className="flex justify-between mt-6">
           {isEditMode && (
             <div className='flex md:flex-row '>
               <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDetailsModal;
             
