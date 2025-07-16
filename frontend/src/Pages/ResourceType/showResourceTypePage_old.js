import React, { useEffect,useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {FiTrash2,FiEdit2} from 'react-icons/fi';
import {
  deleteResourceType,
  resetResourceTypeState,
  resourceTypeDeleted,
  fetchResourceTypes,
  addResourceTypeFromSocket
} from '../../features/resourceTypeSlice';
import { io } from 'socket.io-client';
import RenderDynamicIcon from '../../Components/common/RenderDynamicIcon';
import EditResourceTypeModal from '../../Components/resourceTypeComponents/editResourceTypeModal';

const ResourceTypesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Get state from Redux store
  const { user, access_level } = useSelector((state) => state.auth);
  const { resourceTypes, loading, error } = useSelector((state) => state.resourceTypes);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState(null);

  // Fetch all resource types and setup socket
  useEffect(() => {
    // if (access_level >= 3) {
    //   dispatch(fetchResourceTypes());
    // }

    const socket = io(API_URL, {
      query: { organizationId: user?.organization }
    });

    // Handle real-time updates
    socket.on('resourceType:created', (data) => {
      dispatch(addResourceTypeFromSocket(data.resourceType));
      showToast('success', `${data.resourceType.name} was just added.`);
    });

    socket.on('resourceType:deleted', (data) => {
      dispatch(resourceTypeDeleted(data.resourceTypeId));
      showToast('info', 'A resource type was deleted.');
    });

    return () => {
      socket.disconnect();
      // dispatch(resetResourceTypeState());
    };
  }, [dispatch, user?.organization, access_level, API_URL]);

  const showToast = (type, message) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource type?')) {
      try {
        await dispatch(deleteResourceType(id)).unwrap();
        showToast('success', 'Resource type deleted successfully');
      } catch (err) {
        showToast('error', err.message || 'Failed to delete resource type');
      }
    }
  };
  
  const handleEditClick = (resource) => {
    setSelectedResourceType(resource); // Set which resource to edit
    setIsEditModalOpen(true);          // Open the modal
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedResourceType(null); // Clear the selection when closing
  };

  const handleViewResources = (id) => {
    navigate(`/resource-types/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto mt-8">
      Error: {error}
    </div>
  );

   return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Resource Types</h1>
        {access_level >= 3 && (
          <button
            onClick={() => navigate('/create-resource-type')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add New Resource Type
          </button>
        )}
      </div>
  
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
  {resourceTypes.length > 0 ? (
    resourceTypes.map((resource, index) => (
           <tr
        key={resource._id}
        onClick={() => handleViewResources(resource._id)}
        className={`cursor-pointer transition-colors duration-150 ${
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        } hover:bg-blue-50`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full mr-3"
              style={{ backgroundColor: resource.color || '#3b82f6' }}
            >
              <span className="text-white">
                {RenderDynamicIcon(resource.icon, 16)}
              </span>
            </div>
            <span className="text-sm text-gray-900">
              {resource.name}
            </span>
          </div>
        </td>

        {/* This is the second cell for the action buttons */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        
          <div className="flex items-center justify-end space-x-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleEditClick(resource)} 
              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-green-100 transition-colors"
              title="Edit Type"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(resource._id)}
              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
              title="Delete Type"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    // This is the fallback row shown when there are no resource types
    <tr>
      <td 
        colSpan={2} 
        className="px-6 py-4 text-center text-sm text-gray-500"
      >
        No resource types found
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
    <EditResourceTypeModal
    isOpen={isEditModalOpen}
    onClose={handleCloseModal}
    resourceTypeToEdit={selectedResourceType}
  />
  </>
  );
};

export default ResourceTypesPage;