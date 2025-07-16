
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ROLES } from "../accessControl/roles";

const UnauthorizedPage = () => {
  const location = useLocation();
  const { currentAccessLevel, requiredAccessLevel } = location.state || {};

  // Map roles to names for better display
  const roleNames = {
    [ROLES.RANDOM_USER]: "Random User",
    [ROLES.SERVICE_PERSONAL]: "Service Personnel",
    [ROLES.MANAGER]: "Manager",
    [ROLES.FREE]: "Free Access",
    [ROLES.ADMIN]: "Admin",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this page.
        </p>
        {currentAccessLevel !== undefined && requiredAccessLevel !== undefined && (
          <div className="text-gray-600 mb-6">
            <p>
              <strong>Your Role:</strong> {roleNames[currentAccessLevel] || `Level ${currentAccessLevel}`}
            </p>
            <p>
              <strong>Required Role:</strong> {roleNames[requiredAccessLevel] || `Level ${requiredAccessLevel}`}
                 <span> </span> and above.
            </p>
          </div>
        )}
        <Link
          className="inline-block bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-500 transition-all duration-200"
          to="/home"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
