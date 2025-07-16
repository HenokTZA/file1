import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';

const ResourceEditModal = ({ resource, resourceType, onClose, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with resource data
  useEffect(() => {
    if (resource) {
      const defaultValues = {
        name: resource.displayName || '',
        isBlockableOverride: resource.isBlockableOverride ?? '', 
        ...resource.fields
      };
      reset(defaultValues);
    }
  }, [resource, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">Edit {resourceType?.name || 'Resource'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name*
              </label>
              <input
                type="text"
                {...register('name', { required: 'Display name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">{errors.name.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Behavior
              </label>
              <select
                {...register('isBlockableOverride')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Default (from Resource Type)</option>
                <option value="true">Force Blockable (Exclusive)</option>
                <option value="false">Force Non-Blockable</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Override the default booking behavior.
              </p>
            </div>
            {/* Dynamic fields based on resource type */}
            {resourceType?.fieldDefinitions?.map((field) => (
              <div key={field.fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.displayName || field.fieldName}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFieldInput(field, register, errors)}
                {errors[field.fieldName] && (
                  <span className="text-red-500 text-sm">
                    {errors[field.fieldName].message || 'This field is required'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const renderFieldInput = (field, register, errors) => {
  const validation = {
    required: field.required ? `${field.displayName || field.fieldName} is required` : false,
    validate: (value) => {
      if (!field.required && (value === undefined || value === null || value === '')) {
        return true;
      }
      
      switch(field.fieldType) {
        case 'number':
          return !isNaN(Number(value)) || 'Must be a valid number';
        case 'date':
          return !isNaN(new Date(value).getTime()) || 'Must be a valid date';
        default:
          return true;
      }
    }
  };

  switch(field.fieldType) {
    case 'string':
      return (
        <input
          type="text"
          {...register(field.fieldName, validation)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          step="any"
          {...register(field.fieldName, validation)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          {...register(field.fieldName)}
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          {...register(field.fieldName, validation)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    default:
      return (
        <input
          type="text"
          {...register(field.fieldName, validation)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
  }
};

export default ResourceEditModal;