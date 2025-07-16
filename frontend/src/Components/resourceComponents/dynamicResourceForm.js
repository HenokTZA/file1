import { useForm } from 'react-hook-form';
import { createResource } from '../../features/resourceSlice';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';

const DynamicResourceForm = ({ resourceType, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Convert field values to their proper types
      const processedFields = {};
      
      resourceType.fieldDefinitions.forEach(field => {
        const value = formData[field.fieldName];
        
        if (value === undefined || value === null) {
          if (field.required) {
            throw new Error(`Field '${field.fieldName}' is required`);
          }
          return;
        }

        switch(field.fieldType) {
          case 'number':
            processedFields[field.fieldName] = Number(value);
            if (isNaN(processedFields[field.fieldName])) {
              throw new Error(`Field '${field.fieldName}' must be a valid number`);
            }
            break;
          case 'boolean':
            processedFields[field.fieldName] = Boolean(value);
            break;
          case 'date':
            processedFields[field.fieldName] = new Date(value).toISOString();
            break;
          default:
            processedFields[field.fieldName] = value;
        }
      });
      let overrideValue = null; // Default to null (inherit from type)
      if (formData.isBlockableOverride === 'true') {
        overrideValue = true;
      } else if (formData.isBlockableOverride === 'false') {
        overrideValue = false;
      }
      const payload = {
        type: resourceType._id,
        organization: resourceType.organization,
        displayName: formData.name || `New ${resourceType.name}`,
        isBlockableOverride: overrideValue,
        fields: {
          ...processedFields,
          // Ensure these fields are included even if not in fieldDefinitions
          name: formData.name,
          model: formData.model || '',
          purchaseDate: formData.purchaseDate || new Date().toISOString()
        }
      };

      await dispatch(createResource(payload)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Error creating resource:', error);
      
      // Set form errors if they're validation errors
      if (error.message.includes('Field')) {
        const fieldName = error.message.match(/Field '(.+?)'/)?.[1];
        if (fieldName) {
          setError(fieldName, {
            type: 'manual',
            message: error.message
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Add New {resourceType.name}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name field (common for all resources) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
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
              defaultValue="" // Represents null
            >
              <option value="">Default (from Resource Type)</option>
              <option value="true">Force Blockable (Exclusive)</option>
              <option value="false">Force Non-Blockable</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Override the default booking behavior set on the '{resourceType.name}' type.
            </p>
          </div>
          
          {/* Dynamic fields based on resource type */}
          {resourceType.fieldDefinitions.map((field) => (
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
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-white bg-red-500 hover:bg-red-600"

          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
          >
            {isSubmitting ? 'Saving...' : 'Save Resource'}
          </button>
        </div>
      </form>
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
          defaultValue={field.defaultValue}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          step="any"
          {...register(field.fieldName, validation)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          defaultValue={field.defaultValue}
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          {...register(field.fieldName)}
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          defaultChecked={field.defaultValue}
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

export default DynamicResourceForm;