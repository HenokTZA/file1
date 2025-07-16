import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2, FiUsers,FiUser, FiX } from 'react-icons/fi';
import { updateTeam, deleteTeam } from '../../features/teamSlice';
import { useUsers } from '../../hooks/useUsers';

const TeamEditModal = ({ team, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.teams);
//   const { organizationUsers } = useSelector((state) => state.teams);
const { users,  } = useUsers();

  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    members: team?.members || []
  });

  const [selectedMembers, setSelectedMembers] = useState(team?.members || []);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        members: team.members
      });
      setSelectedMembers(team.members);
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      await dispatch(updateTeam({
        teamId: team._id,
        updateData: {
          name: formData.name,
          description: formData.description,
          members: selectedMembers
        }
      })).unwrap();
    //   dispatch(fetchOrganizationTeams());
      onClose();
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              <FiUsers className="inline mr-2" />
              Edit Team
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <FiX size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Team Info */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right Column - Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Team Members
                </label>
                
                {/* Selected Members */}
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                  { users.map(user => {
                    const isMember = selectedMembers.some(m => m.user === user._id);
                    const memberRole = selectedMembers.find(m => m.user === user._id)?.role || 'member';
                    
                    return (
                      <div key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                          <FiUser size={14} />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-gray-800">
                            {user.first_name}
                            {(user.access_level >= 3 || user.role === 'admin') && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={memberRole}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                            disabled={!isMember}
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                          <input
                            type="checkbox"
                            checked={isMember}
                            onChange={(e) => handleMemberToggle(user._id, e.target.checked, memberRole)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4 mt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this team?')) {
                    dispatch(deleteTeam(team._id));
                    onClose();
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-800"
              >
                <FiTrash2 className="inline mr-1" />
                Delete Team
              </button>
              <div className="space-x-3">
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamEditModal;