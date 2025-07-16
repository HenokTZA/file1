
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateResource, deleteResource } from '../../features/resourceSlice';
import ResourceTable from '../../Components/resourceComponents/resourceTable';
import DynamicResourceForm from '../../Components/resourceComponents/dynamicResourceForm';
import React, { useState } from 'react';
import LoadingSpinner from '../../Components/common/LoadingSpinner';
import ErrorAlert from '../../Components/common/ErrorAlert';
import RenderDynamicIcon from '../../Components/common/RenderDynamicIcon';
import { useResources } from '../../hooks/useResources'; // Import the custom hook
import { FiEdit } from 'react-icons/fi';
import EditResourceTypeModal from '../../Components/resourceTypeComponents/editResourceTypeModal'; // Import the existing modal

const ResourceListPage = () => {
  const { typeId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);

  // Use the hook for this specific type
  const { 
    typeSpecificResources: resources,
    loading, 
    error,
    refreshResources
  } = useResources([typeId]);

  const resourceType = useSelector((state) => 
    state.resourceTypes.resourceTypes.find(type => type._id === typeId)
  );
  const handleEdit = async (resourceId, updatedData) => {
    await updateResource({ id: resourceId, updatedData });
    refreshResources();
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(resourceId);
      refreshResources();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          {resourceType?.icon && (
            <span className="mr-2" style={{ color: resourceType.color }}>
              {RenderDynamicIcon(resourceType.icon, 20, "text-blue-500")}
            </span>
          )}
          {resourceType?.name || 'Resources'}
        </h1>
          <div className="flex items-center space-x-3">
           {/* This button is only visible when the resourceType data is loaded */}
          {resourceType && (
            <button 
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 shadow-sm"
              onClick={() => setIsEditTypeModalOpen(true)}
            >
              <FiEdit className="mr-2"/>
              Edit This Type
            </button>
          )}
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-sm"
            onClick={() => setShowForm(true)}
          >
            Add New Resource
          </button>
        </div>
      </div>
      
      {showForm ? (
        <DynamicResourceForm 
          resourceType={resourceType} 
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refreshResources([typeId]);
          }}
        />
      ) : (
        <ResourceTable 
          resources={resources} 
          resourceType={resourceType}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
    <EditResourceTypeModal
      isOpen={isEditTypeModalOpen}
      onClose={() => setIsEditTypeModalOpen(false)}
      resourceTypeToEdit={resourceType}
    />
  </>
  );
};

export default ResourceListPage;