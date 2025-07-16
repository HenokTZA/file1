
import React, { useState } from 'react';
import FieldEditor from '../../Components/resourceTypeComponents/fieldEditor';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createResourceType } from '../../features/resourceTypeSlice';
import IconExplorer from '../../Components/common/IconPicker';
import { FiChevronDown, FiX, FiPlus, FiSave, FiFileText, FiInfo } from 'react-icons/fi';
import * as FeatherIcons from 'react-icons/fi';
import { toast } from 'react-toastify';

const CreateResourceTypePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [resourceType, setResourceType] = useState({
    name: '',
    icon: 'FiBox', // A sensible default icon
    color: '#3b82f6',
    fieldDefinitions: [],
    isBlockable: false,
  });

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
      // Basic frontend validation before dispatch
      if (resourceType.fieldDefinitions.length === 0) {
        toast.warn('Please add at least one field definition.');
        return;
      }
      for (const field of resourceType.fieldDefinitions) {
          if (field.isQuantifiable && !field.quantifiableUnit) {
              toast.error(`The field "${field.displayName || field.fieldName}" is missing a unit.`);
              return;
          }
      }

      await dispatch(createResourceType(resourceType)).unwrap();
      toast.success(`Resource Type "${resourceType.name}" created successfully!`);
      navigate('/show-resource-type');
    } catch (error) {
      toast.error(error?.message || 'Failed to create resource type. Please check your input.');
      console.error("Create Resource Type Error:", error);
    }
  };

  const handleCancel = () => {
    navigate('/show-resource-type');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg">
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiFileText className="mr-3 text-blue-500" />
                Create New Resource Type
            </h1>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-800 transition-colors">
                <FiX size={24} />
            </button>
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
              <div className="space-y-1 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Exclusive Booking (Blockable)</label>
                  <div className="flex items-center space-x-4">
                    <label htmlFor="isBlockable-toggle" className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          id="isBlockable-toggle" 
                          className="sr-only peer"
                          checked={resourceType.isBlockable}
                          onChange={(e) => setResourceType({...resourceType, isBlockable: e.target.checked})} 
                        />
                        <div className="block bg-gray-300 w-12 h-7 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">
                        {resourceType.isBlockable ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  <div className="relative group flex items-center">
      <FiInfo className="text-gray-400 cursor-pointer" size={16} />
      {/* The Tooltip box */}
      <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 
                      px-3 py-2 bg-blue-500 text-white text-xs text-center rounded-lg shadow-lg 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        When enabled, resources of this type cannot be assigned to multiple tasks that overlap in time.
        {/* Optional: little arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
      </div>
    </div>
                </div>
               

            </div>
          </div>
          
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

          {/* --- FORM ACTIONS --- */}
          <div className="flex justify-end space-x-4 border-t pt-6">
            <button type="button" onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center shadow-md">
              <FiSave className="mr-2" /> Save Resource Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResourceTypePage;