// src/Components/resourceTypeComponents/EditResourceTypeModal.js
import React, { useState, useEffect } from 'react';
import FieldEditor from './fieldEditor';
import { useDispatch } from 'react-redux';
import { updateResourceType } from '../../features/resourceTypeSlice';
import IconExplorer from '../common/IconPicker';
import { FiChevronDown, FiPlus, FiSave, FiFileText } from 'react-icons/fi';
import * as FeatherIcons from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from './editModal'; // Import the Modal component

const EditResourceTypeModal = ({ isOpen, onClose, resourceTypeToEdit }) => {
  const dispatch = useDispatch();
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  
  // Local state for the form, initialized as empty
  const [resourceType, setResourceType] = useState({
    name: '', icon: 'FiBox', color: '#3b82f6', fieldDefinitions: []
  });

  useEffect(() => {
    if (resourceTypeToEdit) {
      // Use a deep copy for fieldDefinitions to prevent direct state mutation
      setResourceType({
          ...resourceTypeToEdit,
          fieldDefinitions: JSON.parse(JSON.stringify(resourceTypeToEdit.fieldDefinitions || []))
      });
    }
  }, [resourceTypeToEdit]);

  const addField = () => {
    setResourceType(prev => ({
      ...prev,
      fieldDefinitions: [
        ...prev.fieldDefinitions,
        
        {
          fieldName: '',
          displayName: '',
          fieldType: 'string',
          required: false,
          defaultValue: '',
          isQuantifiable: false,
          quantifiableUnit: '',
          quantifiableCategory: 'other',
        }
      ]
    }));
  };

  const removeField = (index) => {
    setResourceType(prev => ({
      ...prev,
      fieldDefinitions: prev.fieldDefinitions.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index, field) => {
    setResourceType(prev => {
      const newFields = [...prev.fieldDefinitions];
      newFields[index] = field;
      return { ...prev, fieldDefinitions: newFields };
    });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      // 1. Get the reliable ID from the prop.
      const id = resourceTypeToEdit._id; 
  
      // 2. The rest of the form data is in our local state.
      const updatedData = {
        name: resourceType.name,
        icon: resourceType.icon,
        color: resourceType.color,
        fieldDefinitions: resourceType.fieldDefinitions
      };
  
      // 3. Build the payload with the exact shape the thunk expects.
      await dispatch(updateResourceType({ id, updatedData })).unwrap();
      
      toast.success(`Resource Type "${resourceType.name}" updated successfully!`);
      onClose(); // Close the modal on success
    } catch (error) {
      toast.error(error?.message || 'Failed to update resource type.');
    }
  };
   // Guard clause to prevent rendering an empty form before data arrives
   if (!resourceTypeToEdit) {
    return null;
}
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl">
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiFileText className="mr-3 text-blue-500" />
                Edit Resource Type
            </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* --- MAIN DETAILS SECTION --- */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
             <h2 className="text-lg font-semibold text-gray-800 mb-4">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {/* Name Field (takes more space) */}
              <div className="space-y-1 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Name*</label>
                <input
                  type="text" value={resourceType.name}
                  onChange={(e) => setResourceType({...resourceType, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Icon Field */}
              <div className="space-y-1 relative">
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <button type="button" onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                  className="w-full h-[42px] bg-white flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left">
                  {resourceType.icon && FeatherIcons[resourceType.icon] ? (
                    <div className="flex items-center gap-2">
                      {React.createElement(FeatherIcons[resourceType.icon], { size: 20 })}
                      <span>{resourceType.icon}</span>
                    </div>
                  ) : <span className="text-gray-500">Select an icon</span>}
                  <FiChevronDown className="text-gray-400" />
                </button>
                {isIconPickerOpen && (
                  <div className="absolute z-20 mt-1 w-full right-0">
                    <IconExplorer onSelect={(iconName) => {
                        setResourceType({...resourceType, icon: iconName});
                        setIsIconPickerOpen(false);
                      }} />
                  </div>
                )}
              </div>

              {/* Color Field */}
              <div className="space-y-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3 h-[42px]">
                  <input type="color" value={resourceType.color}
                    onChange={(e) => setResourceType({...resourceType, color: e.target.value})}
                    className="h-10 w-10 p-0 border-0 rounded-md cursor-pointer appearance-none"
                    style={{backgroundColor: 'transparent'}}
                  />
                  <span className="font-mono text-sm bg-white border border-gray-300 px-2 py-1 rounded-md">{resourceType.color}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* --- FIELD DEFINITIONS SECTION --- */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-semibold text-gray-800">Field Definitions</h2>
              <button type="button" onClick={addField}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm">
                <FiPlus className="mr-2" /> Add Field
              </button>
            </div>

            {resourceType.fieldDefinitions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No fields added yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Field" to define the structure of your resource.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {resourceType.fieldDefinitions.map((field, index) => (
                  <FieldEditor
                    key={index} index={index} field={field}
                    onUpdate={updateField} onRemove={removeField}
                    resourceType={resourceType}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 border-t pt-6">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center shadow-md">
              <FiSave className="mr-2" />
              Save Changes 
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditResourceTypeModal;