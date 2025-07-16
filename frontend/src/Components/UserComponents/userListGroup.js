import React from 'react';
import { FaEdit, FaTrash, FaUser, FaUserCheck } from "react-icons/fa";
import {FiShield} from "react-icons/fi";
// Helper to get an icon and color for the role
const getRoleDetails = (level) => {
    switch (level) {
        case 5: return { icon: <FiShield />, color: 'text-red-500' };
        case 4: return { icon: <FaUserCheck />, color: 'text-purple-500' };
        case 3: return { icon: <FaUser />, color: 'text-blue-500' };
        case 2: return { icon: <FaUser />, color: 'text-green-500' };
        default: return { icon: <FaUser />, color: 'text-gray-500' };
    }
};

const UserListGroup = ({ title, users, onEdit, onDelete }) => {
    if (!users || users.length === 0) {
        return null; // Don't render if the group is empty
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                {title}
            </h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {users.map(user => {
                        const role = getRoleDetails(user.access_level);
                        return (
                            <li key={user._id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <span className={`text-xl ${role.color}`}>
                                        {role.icon}
                                    </span>
                                    <div>
                                        <p className="text-md font-medium text-gray-900">{user.full_name || user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <button 
                                        onClick={() => onEdit(user)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        aria-label={`Edit ${user.full_name || user.name}`}
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(user._id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        aria-label={`Delete ${user.full_name || user.name}`}
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default UserListGroup;
