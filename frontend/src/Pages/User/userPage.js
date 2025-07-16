import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// Assuming 'getUsers' is your action to fetch all users
import { getUsers, updateUserByAdmin, deleteUser } from "../../features/userSlice"; 
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import UserForm from "../../Components/UserComponents/userForm";
import UserListGroup from "../../Components/UserComponents/userListGroup"; // Import the new component
import LoadingSpinner from "../../Components/common/LoadingSpinner"; // Good practice to have these
import ErrorAlert from "../../Components/common/ErrorAlert";
import { useNavigate } from "react-router-dom";

// Define the access levels mapping
const ACCESS_LEVEL_MAP = {
    5: 'Super Admins',
    4: 'Free Users', // As per your button labels
    3: 'Managers',
    2: 'Service Personnels',
    1: 'Random Users'
};

const UserManagementPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get data from Redux store
    const { users, loading, error } = useSelector((state) => state.users);

    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Fetch users when the component mounts
        dispatch(getUsers());
    }, [dispatch]);

    const groupedUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) return {};
        
        return users.reduce((acc, user) => {
            const level = user.access_level;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(user);
            return acc;
        }, {});
    }, [users]);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleAddClick = () => {
        navigate("/register");
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Ensure you pass the correct payload format your thunk expects
                await dispatch(deleteUser(id)).unwrap(); 
                toast.success("User deleted successfully!");
            } catch (err) {
                toast.error(`Error: ${err.message || 'Could not delete user'}`);
            }
        }
    };

    const handleFormSubmit = async (userData) => {
        try {
            await dispatch(updateUserByAdmin({ id: editingUser._id, updateData: userData })).unwrap();
            toast.success("User updated successfully!");
            setShowForm(false);
            setEditingUser(null);
        } catch (err) {
            toast.error(`Error: ${err.message || 'Could not update user'}`);
        }
    }
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        User Management
                    </h1>
                    
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <FaPlus />
                    <span>Register New User</span>
                </button>
            </div>

            {/* --- REFACTORED: User List Rendering --- */}
            <div className="space-y-6">
                {Object.keys(ACCESS_LEVEL_MAP).sort((a,b) => b-a).map(level => (
                    <UserListGroup
                        key={level}
                        title={ACCESS_LEVEL_MAP[level]}
                        users={groupedUsers[level]}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ))}

                {users.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white shadow-md rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">No Users Found</h3>
                        <p className="mt-1 text-sm text-gray-500">Click "Register New User" to get started.</p>
                    </div>
                )}
            </div>
            {/* --- END OF REFACTORED SECTION --- */}


            {/* User Form Modal (This part is unchanged) */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-down">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
                            onClick={() => setShowForm(false)}
                        >
                            ×
                        </button>
                        <UserForm
                            onSubmit={handleFormSubmit}
                            user={editingUser}
                            onClose={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
