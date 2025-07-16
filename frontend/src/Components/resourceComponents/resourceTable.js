import { useState,useEffect } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ResourceEditModal from './resourceEditModal'; // We'll create this component

import { fetchResourceTypes } from '../../features/resourceTypeSlice'; // Adjust the import path as needed
import { useDispatch } from 'react-redux';
const ResourceTable = ({ resources, resourceType, onEdit, onDelete }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const dispatch = useDispatch();
  // Safely extract the resources array from the response
  const resourcesArray = Array.isArray(resources) 
    ? resources 
    : resources?.resources || [];

  const handleEditClick = (resource) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedResource(null);
  };
  useEffect(() => {
    if (!resourceType) {
      console.log('Resource type missing, attempting refetch...');
      dispatch(fetchResourceTypes());
    }
  }, [resourceType ,dispatch]);
  
  const handleSave = async (updatedData) => {
    try {
      await onEdit(selectedResource._id, updatedData);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  // Calculate column count for colspan
  const columnCount = (resourceType?.fieldDefinitions?.filter(f => f.showInList)?.length || 0) + 2;

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Display Name
              </th>
              {resourceType?.fieldDefinitions
                ?.filter(field => field.showInList)
                .map(field => (
                  <th 
                    key={field.fieldName} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                  >
                    {field.displayName || field.fieldName}
                  </th>
                ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resourcesArray.length > 0 ? (
              resourcesArray.map((resource, index) => (
                <tr 
                  key={resource._id} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100 hover:bg-gray-200'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {resource.displayName || '-'}
                  </td>
                  {resourceType?.fieldDefinitions
                    ?.filter(field => field.showInList)
                    .map(field => (
                      <td key={field.fieldName} className="px-6 py-4 whitespace-nowrap">
                        {renderFieldValue(
                          resource.fields?.[field.fieldName] || resource[field.fieldName], 
                          field.fieldType
                        )}
                      </td>
                    ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditClick(resource)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(resource._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columnCount} 
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No resources found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedResource && (
        <ResourceEditModal
          resource={selectedResource}
          resourceType={resourceType}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  );
};

const renderFieldValue = (value, fieldType) => {
  if (value === undefined || value === null) return '-';
  
  switch(fieldType) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'object':
      return JSON.stringify(value);
    default:
      return String(value);
  }
};

export default ResourceTable;