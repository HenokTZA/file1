import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiUsers, FiUser } from 'react-icons/fi';
import { createTeam } from '../../features/teamSlice';
import { useUsers } from '../../hooks/useUsers';
const TeamCreateModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const { users, loading: usersLoading } = useUsers();

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        members: []
      });
      setSelectedMembers([]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberToggle = (userId, isChecked, role = 'member') => {
    setSelectedMembers(prev => {
      if (isChecked) {
        return [...prev, { user: userId, role }];
      } else {
        return prev.filter(m => m.user !== userId);
      }
    });
  };

  const handleRoleChange = (userId, newRole) => {
    setSelectedMembers(prev => 
      prev.map(member => 
        member.user === userId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTeam({
        name: formData.name,
        description: formData.description,
        members: selectedMembers,
        organization: user.organization
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              <FiUsers className="inline mr-2" />
              Create New Team
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Team Name Field */}
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                id="teamName"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team name"
              />
            </div>

            {/* Description Field */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Members Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Members
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {users?.map(user => {
                  const isSelected = selectedMembers.some(m => m.user === user._id);
                  const memberRole = selectedMembers.find(m => m.user === user._id)?.role || 'member';
                  
                  return (
                    <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                          <FiUser size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={memberRole}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                          disabled={!isSelected}
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleMemberToggle(user._id, e.target.checked, memberRole)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamCreateModal;