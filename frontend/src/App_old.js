
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Components/sidebarComponent';
import React from 'react';
import RegisterPage from './Pages/Auth/registerPage';
import LoginPage from './Pages/Auth/loginPage';
import LogoutPage from './Pages/Auth/logoutPage';
import TaskPage from './Pages/Task/createTaskPage';
import HomePage from './Pages/homePage';
import ForgotPasswordPage from './Pages/Auth/forgotPasswordPage';
import ResetPasswordPage from './Pages/Auth/resetPasswordPage';
import ConfirmEmail from './Components/authComponents/confirmEmail';
import FilterPage from './Pages/FilterAndReport/filterPage';
import CreateResourceTypePage from './Pages/ResourceType/createResourceTypePage';
import ResourceListPage from './Pages/Resource/resourceListPage'
import Navbar from './Components/navbarComponents';
import ProfilePage from './Components/profileComponents';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "./accessControl/protectedRoute";
import { ROLES } from "./accessControl/roles";
import UnauthorizedPage from "./Pages/unauthorizedPage";
import UserManagementPage from "./Pages/User/userPage";
import MainLayout from './Components/layout/layoutWrapper'
import ResourceTypesPage from './Pages/ResourceType/showResourceTypePage';
import TeamsPage from './Pages/Team/TeamsPage';
import TaskAnalytics  from './Pages/Analytics/TaskAnalytics';
import CalendarImport from './Components/calendarImport';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket } from "./socket";
const ConditionalNavBar = () => {
  const location = useLocation();

  // Paths where Navbar and Sidebar are not displayed
  const authPaths = [ "/login", "/logout", "/forgot-password", "/reset-password", "/confirm-email"];

  const hideNavBar = authPaths.some(path => location.pathname.startsWith(path));

  return hideNavBar ? null : (
    <>
      <Navbar />
      <Sidebar />
    </>
  );
};

const App = () => {
  const { isLoggedIn, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && token) {
      connectSocket(token);
    }
  }, [isLoggedIn, token]);


  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnFocusLoss pauseOnHover />
      <ConditionalNavBar />
      <div className="pt-16"> {/* Pushes content below navbar */}
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />

          {/* Public Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/confirm-email/:confirmationCode" element={<ConfirmEmail />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/import-calendar" element={<MainLayout><CalendarImport /></MainLayout>} />
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.RANDOM_USER}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/register"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                <MainLayout><RegisterPage /></MainLayout>
                
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.ADMIN}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.RANDOM_USER}>
                 <MainLayout>
                 <TaskAnalytics/>
                 </MainLayout>
              </ProtectedRoute>
            }
          />
           <Route
            path="/teams"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.RANDOM_USER}>
                 <MainLayout>
                 <TeamsPage />
                 </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-task"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                <TaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filter-tasks"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                <FilterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-resource-type"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                <MainLayout>
      <CreateResourceTypePage />
    </MainLayout>
              </ProtectedRoute>
            }
          />
           <Route
            path="/show-resource-type"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                <MainLayout>
      <ResourceTypesPage/>
    </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resource-types/:typeId"
            element={
              <ProtectedRoute requiredAccessLevel={ROLES.MANAGER}>
                 <MainLayout>
               < ResourceListPage/>
               </MainLayout>
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;