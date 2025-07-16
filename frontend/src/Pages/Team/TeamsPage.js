import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiUsers, FiUser, FiX } from 'react-icons/fi';
import {
  fetchOrganizationTeams,
  deleteTeam,
  clearCurrentTeam,
  resetTeamError
} from '../../features/teamSlice';
import { io } from 'socket.io-client';
import { useUsers } from '../../hooks/useUsers';
import TeamCreateModal from '../../Components/teamComponents/teamCreateModal'; 
import TeamEditModal from '../../Components/teamComponents/teamEditModal'; 

const TeamsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Get state from Redux store
  const { user, access_level } = useSelector((state) => state.auth);
  const { teams, currentTeam, loading, error } = useSelector((state) => state.teams);
  const { users, loading: usersLoading } = useUsers();
  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8); // 10 users per page
  const [editingTeam, setEditingTeam] = useState(null);

// Replace your handleEdit function with:
const handleEdit = (team) => {
  setEditingTeam(team);
};
  // Fetch all teams and users, setup socket
  useEffect(() => {
    dispatch(fetchOrganizationTeams({ search: searchTerm }));
    // dispatch(fetchOrganizationUsers());

    const socket = io(API_URL, {
      query: { organizationId: user?.organization }
    });

    socket.on('team:created', (data) => {
      dispatch(fetchOrganizationTeams());
      showToast('success', `New team "${data.team.name}" created`);
    });

    socket.on('team:updated', (data) => {
      dispatch(fetchOrganizationTeams());
    });

    socket.on('team:deleted', (data) => {
      dispatch(fetchOrganizationTeams());
      setSelectedTeam(null);
      showToast('info', 'Team deleted');
    });

    return () => {
      socket.disconnect();
      dispatch(clearCurrentTeam());
      dispatch(resetTeamError());
    };
  }, [dispatch, user?.organization, searchTerm, API_URL]);

  const showToast = (type, message) => {
    // Your existing toast implementation
  };
console.log("teams",teams)
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await dispatch(deleteTeam(id)).unwrap();
        showToast('success', 'Team deleted successfully');
        if (selectedTeam?._id === id) {
          setSelectedTeam(null);
          setShowAllUsers(true);
        }
      } catch (err) {
        showToast('error', err.message || 'Failed to delete team');
      }
    }
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowAllUsers(false);
  };

  const handleShowAllUsers = () => {
    setSelectedTeam(null);
    setShowAllUsers(true);
  };

  const filteredTeams = Array.isArray(teams)
    ? teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

    const displayedUsers = showAllUsers 
    ? users 
    : selectedTeam?.members || [];
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Teams Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              className="pl-10 pr-4 py-2 border rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {access_level >= 3 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiPlus className="mr-2" size={16} />
              Create Team
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Teams List */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-medium text-gray-800">Teams</h2>
            </div>
            <div className="p-4">
              {filteredTeams.length > 0 ? (
                <div className="space-y-4">
                  {filteredTeams.map((team) => (
                    <div
                      key={team._id}
                      onClick={() => handleTeamClick(team)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTeam?._id === team._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{team.name}</h3>
                          <p className="text-sm text-red-800 mt-1 flex items-center">
                            <FiUsers className="mr-1  " size={14} />
                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                        {access_level >= 3 && (
  <div className="flex space-x-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditingTeam(team); // Set the team to edit instead of navigating
      }}
      className="text-blue-500 hover:text-blue-600 p-1"
    >
      <FiEdit2 size={16} />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(team._id);
      }}
      className="text-red-800 hover:text-red-900 p-1"
    >
      <FiTrash2 size={16} />
    </button>
  </div>
)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No teams found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'Get started by creating a new team'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Users/Members List */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white shadow rounded-lg overflow-hidden h-full">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-medium text-gray-800">
                {showAllUsers ? 'All Organization Users' : `${selectedTeam?.name} Members`}
              </h2>
              {!showAllUsers && (
                <button
                  onClick={handleShowAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FiX className="mr-1" size={16} />
                  Show all
                </button>
              )}
            </div>
            <div className="p-4">
  {displayedUsers.length > 0 ? (
    <>
      {/* Paginated User List */}
      <div className="space-y-3 mb-4">
        {displayedUsers
          .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
          .map((user) => (
            <div key={user._id || user.user.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <FiUser size={18} />
              </div>
              <div className="ml-3 flex-grow">
                <h4 className="text-sm font-medium text-gray-800">
                  {user.first_name || user.user.full_name}
                  {(user.access_level >= 3 || user.role === 'admin') && (
  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
    Admin
  </span>
)}
                </h4>
                <p className="text-xs text-gray-500">{user.email ||user.user.email}</p>
              </div>
              {/* {!showAllUsers && access_level >= 3 && (
                <button 
                  onClick={() => handleRemoveMember(user._id)}
                  className="text-sm text-red-500 hover:text-red-700 p-1"
                >
                  <FiTrash2 size={16} />
                </button>
              )} */}
            </div>
          ))}
      </div>

      {/* Pagination Controls */}
      {displayedUsers.length > usersPerPage && (
        <div className="flex items-center justify-between border-t pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.ceil(displayedUsers.length / usersPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(displayedUsers.length / usersPerPage)))}
            disabled={currentPage === Math.ceil(displayedUsers.length / usersPerPage)}
            className={`px-3 py-1 rounded-md ${currentPage === Math.ceil(displayedUsers.length / usersPerPage) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            Next
          </button>
        </div>
      )}
    </>
  ) : (
    <div className="text-center py-8">
      <FiUser size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">
        {showAllUsers ? 'No users found' : 'No members in this team'}
      </h3>
    </div>
  )}
</div>
          </div>
        </div>
      </div>

      <TeamCreateModal 
  isOpen={isCreateModalOpen} 
  onClose={() => setIsCreateModalOpen(false)} 
/>
{editingTeam && (
  <TeamEditModal
    team={editingTeam}
    isOpen={!!editingTeam}
    onClose={() => setEditingTeam(null)}
  />
)}
    </div>
    
  );
};

export default TeamsPage;