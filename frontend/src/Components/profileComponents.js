
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice"; // Import logout action
import { deleteUser, updateUser } from "../features/userSlice"; // Import user actions
import ProfileModal from "./profileModal"; // Assuming you have a reusable Modal component
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Toast CSS

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State for update confirmation modal

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
  };

  const handleUpdate = (e) => {
    const access_level=user?.access_level
    e.preventDefault();
    const updateData = { first_name: firstName, last_name: lastName, email, password, access_level };
    const id = user?._id;

    dispatch(updateUser({ id, updateData }))
      .then(() => {
        toast.success("Profile updated successfully!");
        setShowUpdateModal(false); // Close modal after updating
      })
      .catch((error) => {
        toast.error(error.message || "Failed to update profile.");
      });
  };

  const handleDeleteAccount = () => {
    const id = user?._id;

    dispatch(deleteUser({ id }))
      .then(() => {
        toast.success("Account deleted successfully!");
        setShowDeleteModal(false); // Close modal after deleting
      })
      .catch((error) => {
        toast.error(error.message || "Failed to delete account.");
      });
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-64 text-red-900 border border-red-600 p-4">
        <p>You are not logged in. Please log in to view your profile!</p>
      </div>
    );
  }

  return (
    <div className="container lg:ml-72 p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>

        {/* Profile Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="firstName" className="font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none"
              placeholder="Enter your first name"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="lastName" className="font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none"
              placeholder="Enter your last name"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none"
              placeholder="Enter a new password"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setShowUpdateModal(true)} // Open update confirmation modal
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)} // Open delete confirmation modal
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
            >
              Delete Account
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none"
            >
              Logout
            </button>
          </div>
        </form>
      </div>

      {/* Update Confirmation Modal */}
      {showUpdateModal && (
        <ProfileModal
          title="Update Profile"
          onClose={() => setShowUpdateModal(false)}
          onConfirm={handleUpdate}
          confirmText="Update"
        >
          <p>Are you sure you want to update your profile details?</p>
        </ProfileModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ProfileModal
          title="Delete Account"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          confirmText="Delete"
        >
          <p>Are you sure you want to delete your account? This action is irreversible.</p>
        </ProfileModal>
      )}
    </div>
  );
};

export default ProfilePage;
