import React from "react";

const ProfileModal = ({ title, children, onClose, onConfirm, confirmText = "Confirm" }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 w-96">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="mb-6">{children}</div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ProfileModal;
