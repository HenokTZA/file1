import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { logout } from '../features/authSlice'; // Import logout action

// Flag to track if the toast has already been displayed
let isToastDisplayed = false;

export const checkTokenExpiration = (token) => {
  if (!token) return true; // No token means it's effectively "expired"
  const { exp } = jwtDecode(token);
  return Date.now() >= exp * 1000; // Token is expired if current time is past expiration
};

export const checkTokenAndLogout = (token, dispatch) => {
  if (checkTokenExpiration(token)) {
    dispatch(logout()); // Dispatch logout action

    // Display the toast only if it hasn't been displayed already
    if (!isToastDisplayed) {
      toast.error("Your session has expired. Please log in again.");
      isToastDisplayed = true; // Set the flag to true
    }

    return true; // Indicate that the token is expired
  }
  return false; // Indicate that the token is valid
};

// Reset the toast flag when the user logs in again
export const resetToastFlag = () => {
  isToastDisplayed = false;
};

export default checkTokenExpiration;