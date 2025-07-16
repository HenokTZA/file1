
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requiredAccessLevel }) => {
  const { isLoggedIn, access_level } = useSelector((state) => state.auth);
  console.log("access_level", access_level);
  console.log("required", requiredAccessLevel);

  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (access_level < requiredAccessLevel) {
    // Redirect to unauthorized page with current and required access levels
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          currentAccessLevel: access_level,
          requiredAccessLevel,
        }}
      />
    );
  }

  return children; // Render the protected route content
};

export default ProtectedRoute;
