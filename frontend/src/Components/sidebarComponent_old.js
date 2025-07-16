import React, { useState,useEffect,useMemo} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaPlus } from 'react-icons/fa';
import { setTaskView } from '../features/taskSlice';
import {FiChevronDown } from 'react-icons/fi';
import { FiList, FiCheckCircle, FiArchive, FiClipboard, FiTool, FiUsers, FiUserPlus,  FiPackage } from "react-icons/fi";
import DateRangeFilter from "../Components/taskComponents/datePicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiOutlineHome,AiOutlineCalendar} from "react-icons/ai";
import { MdDashboard } from 'react-icons/md';
import { fetchResourceTypes,addResourceTypeFromSocket } from '../features/resourceTypeSlice';
import RenderDynamicIcon from './common/RenderDynamicIcon';
import { io } from 'socket.io-client';

const Sidebar = ({ tasksWithDates, onDateRangeSelect, onCalendarDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    teams: false,
    resources: false
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const API_URL = process.env.REACT_APP_API_URL;

  const { access_level } = useSelector((state) => state.auth.user) || {};
  const { user } = useSelector((state) => state.auth);
  const resourceTypes = useSelector((state) => 
    state.resourceTypes.resourceTypes || []
  );

  useEffect(() => {
    
    // if (!user?.organization || !user?.org_id) return;
   
    // Initial fetch
    if (access_level >= 3) {
      dispatch(fetchResourceTypes());
    }
  
    const socket = io(API_URL, {
      query: { organizationId: user?.organization?._id || user?.org_id }
    });
  
    socket.on('resourceType:created', (data) => {
      dispatch(addResourceTypeFromSocket(data.resourceType));
    });
  
    return () => {
      console.log("Cleaning up socket connection.");
      socket.off('resourceType:created');
      socket.disconnect();
    };
  }, [user, dispatch, access_level, API_URL]);
  
  // Categorize resources
  const categorizedResources = useMemo(() => {
    return resourceTypes.reduce((acc, type) => {
      const category = type.category === 'team' ? 'teams' : 'resources';
      acc[category] = acc[category] || [];
      acc[category].push(type);
      return acc;
    }, {});
  }, [resourceTypes]); // Only recalculate when resourceTypes changes

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };


  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar();
  };

  const handleHomeClick = () => {
    dispatch(setTaskView('allTasks'));
    navigate('/home');
    // setIsOpen(false);
  };

  const handleViewYourTasksClick = () => {
    dispatch(setTaskView('userTasks'));
    navigate('/home');
    setIsOpen(false);
  };

  const handleViewYourDoneTasksClick = () => {
    dispatch(setTaskView('userDoneTasks'));
    navigate('/home');
    setIsOpen(false);
  };

  const handleViewAllDoneTasksClick = () => {
    dispatch(setTaskView('allDoneTasks'));
    navigate('/home');
    setIsOpen(false);
  };
 
  const StyledAddButton = ({ icon, label, onClick }) => (
    <button 
      className="relative group bg-blue-400 text-white p-3 rounded-full shadow-md hover:bg-blue-500 transition-all duration-200 transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 whitespace-nowrap bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 text-sm px-3 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </button>
  );
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-3 left-4 z-50 text-1xl text-gray-800"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
  
      {/* Sidebar Container */}
      <aside
        className={`fixed top-1 left-0 h-screen w-[265px] bg-gray-50 border-r border-gray-300 shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:mt-16 transition-transform duration-300 ease-in-out z-40 flex flex-col`}
      >
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Date Picker */}
          <div className="mt-0 px-4">
            <DateRangeFilter
              onDateRangeSelect={onDateRangeSelect}
              onCalendarDateChange={onCalendarDateChange}
              tasksWithDates={tasksWithDates}
            />
          </div>
  
          {/* Navigation Buttons */}
          <div className="space-y-2 mt-4 px-4">
            <button
              className="w-full flex text-left text-gray-800 bg-blue-100 px-4 py-3 rounded-md hover:bg-blue-200 transition"
              onClick={handleHomeClick}
            >
              <AiOutlineHome className="text-blue-500 mr-3" size={24} />
              Home
            </button>

            {access_level >= 3 && (
            <button
  className="w-full flex items-center text-gray-800 bg-blue-100 px-4 py-3 mt-2 rounded-md hover:bg-blue-200 transition"
  onClick={() => handleNavigation('/analytics')}
>
  <MdDashboard className="text-blue-500 mr-3" size={24} />
  Analytics Dashboard
</button>
)}

  
            {access_level === 2 && (
              <>
                <button
                  className="w-full flex text-left text-gray-800 bg-blue-100 px-4 py-3 rounded-md hover:bg-blue-200 transition"
                  onClick={handleViewYourTasksClick}
                >
                  <FiList className="text-blue-500 mr-3" size={24} />
                  Your Tasks
                </button>
                <button
                  className="w-full flex text-left text-gray-800 bg-blue-100 px-4 py-3 rounded-md hover:bg-blue-200 transition"
                  onClick={handleViewYourDoneTasksClick}
                >
                  <FiCheckCircle className="text-blue-500 mr-3" size={24} />
                  Your Tasks History
                </button>
              </>
            )}
  
            {access_level >= 3 && (
              <button
                className="w-full flex items-center text-gray-800 bg-blue-100 px-4 py-3 rounded-md hover:bg-blue-200 transition"
                onClick={() => handleNavigation('/filter-tasks')}
              >
                <FiClipboard className="text-blue-500 mr-3" size={24} />
                Filter and Report
              </button>
            )}
  
            <button
              className="w-full flex text-left text-gray-800 bg-blue-100 px-4 py-3 rounded-md hover:bg-blue-200 transition"
              onClick={handleViewAllDoneTasksClick}
            >
              <FiArchive className="text-blue-500 mr-3" size={24} />
              Tasks History
            </button>
          </div>
  
          {/* Resource Types Section */}
          {access_level >= 3 && categorizedResources && (
            <div className="py-2 pl-4 pr-1 mr-3 border-t border-gray-200">
              {/* Teams Dropdown */}
              {categorizedResources.teams && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleCategory('teams')}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <FiUsers className="mr-3 text-blue-500" size={18} />
                      <span>Teams</span>
                    </div>
                    <FiChevronDown 
                      className={`transition-transform duration-200 ${expandedCategories.teams ? 'transform rotate-180' : ''}`} 
                      size={16} 
                    />
                  </button>
                  
                  <div 
                    className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                      expandedCategories.teams ? 'max-h-[300px]' : 'max-h-0'
                    }`}
                  >
                    <div className="ml-8 mt-1 space-y-1">
                      {categorizedResources.teams.map(type => (
                        <button
                          key={type._id}
                          onClick={() => navigate(`/resource-types/${type._id}`)}
                          className="w-full flex items-center text-left px-3 py-2 rounded-md hover:bg-blue-100 text-gray-700 transition-colors"
                        >
                          {type.icon && (
                            <span className="mr-2" style={{ color: type.color || '#1f2937' }}>
                              {RenderDynamicIcon(type.icon,20)}
                            </span>
                          )}
                          <span className="truncate">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resources Dropdown */}
              {categorizedResources.resources && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleCategory('resources')}
                    className="w-full flex items-center justify-between px-2 py-2 text-gray-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <FiPackage className="mr-3 text-blue-500" size={24} />
                      <span>Assets</span>
                    </div>
                    <FiChevronDown 
                      className={`transition-transform duration-200 ${expandedCategories.resources ? 'transform rotate-180' : ''}`} 
                      size={24} 
                    />
                  </button>
                  
                  <div 
                    className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                      expandedCategories.resources ? 'max-h-[200px]' : 'max-h-0'
                    }`}
                  >
                    <div className="ml-8 mt-1 space-y-1">
                      {categorizedResources.resources.map(type => (
                        <button
                          key={type._id}
                          onClick={() => navigate(`/resource-types/${type._id}`)}
                          className="w-full flex items-center text-left px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 text-gray-700 transition-colors"
                        >
                          {type.icon && (
                            <span className="mr-2" style={{ color: type.color || '#1f2937' }}>
                              {RenderDynamicIcon(type.icon,20)}
                            </span>
                          )}
                          <span className="truncate">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        
        </div>
        {access_level >= 2 && (
  <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 pt-2 pb-4 px-4 z-10">
    <div className="relative flex justify-end">
      <div className="relative flex flex-col items-center">
        {/* Plus Button */}
        <button 
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          aria-label="Add options"
          onClick={() => {
            setShowAddOptions(!showAddOptions);
            if (!showAddOptions) {
              setTimeout(() => {
                setShowAddOptions(false);
              }, 5000);
            }
          }}
        >
          <FaPlus size={18} />
        </button>

        {/* Options Panel - centered below the + button */}
        <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 transition-all duration-500 ease-in-out ${
          showAddOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          {access_level >= 4 && (
            <>
              <StyledAddButton 
                icon={<FiUsers size={18} />} 
                label="Team" 
                onClick={() => {
                  handleNavigation('/teams');
                  setShowAddOptions(false);
                }}
              />
              <StyledAddButton 
                icon={<FiTool size={18} />} 
                label="Assets" 
                onClick={() => {
                  handleNavigation('/show-resource-type');
                  setShowAddOptions(false);
                }}
              />
              <StyledAddButton 
                icon={<FiUserPlus size={18} />} 
                label="User" 
                onClick={() => {
                  handleNavigation('/register');
                  setShowAddOptions(false);
                }}
              />
            </>
          )}

          {/* Import Calendar */}
          <StyledAddButton 
            icon={<AiOutlineCalendar size={18} />} 
            label="Import Calendar" 
            onClick={() => {
              handleNavigation('/import-calendar');
              setShowAddOptions(false);
            }}
          />
        </div>
      </div>
    </div>
  </div>
)}

      </aside>
  
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;