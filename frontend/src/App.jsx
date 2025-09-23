import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';

import utils from './dependencies/helpers/utilities';
import ValuesStore from "./store/values-store";
import SettingsStore from "./store/settings-store";
import useThemeConfig from './hooks/useThemeConfig';

// Layouts
import { DropdownSidebarLayout } from '@/layout/Layout';
import UserManagementLayout from '@/layout/userManagementLayout';

// Pages
import Admin from './pages/Admin';
import SystemSettings from '@/pages/Settings/SystemSettings';
import UserManagement from '@/pages/UserManagement/UserManagement';
import Roles from './pages/UserManagement/Roles';
import Resources from './pages/UserManagement/Resources';
import Permission from './pages/UserManagement/Permission';
import Logs from './pages/Settings/Logs';
import LogsOverview from './pages/Settings/LogsOverview';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import VerifyResetToken from './pages/Auth/VerifyResetToken';
import RequestResetLink from './pages/Auth/RequestResetLink';
import RequestOtp from './pages/Auth/RequestOtp';
import VerifyOtp from './pages/Auth/VerifyOtp';
import NotFound from './components/404error';


const LoadingSpinner = ({ tip = "Loading...", fullscreen = false }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: fullscreen ? '100vh' : '200px',
    gap: '16px'
  }}>
    <Spin size="large" />
    <span style={{ color: '#666', fontSize: '14px' }}>{tip}</span>
  </div>
);
// Route Protection Component
function ProtectedRoute({ children }) {
  const valuesStore = ValuesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(true); // null = checking, true = authorized, false = unauthorized

  const [lastAuthorizedPath, setLastAuthorizedPath] = useState();

  useEffect(() => {
    const checkRouteAuthorization = () => {
      const routesAvailable = valuesStore.getValue('routes');



      // If routes are not loaded yet, keep checking
      if (!routesAvailable || routesAvailable.length === 0) {
        return false; // Keep checking
      }

      // Check if current route is authorized
      const matchingRoute = valuesStore.getArrayObjectsValue(
        "routes",
        "resource_path",
        location.pathname
      );

      // console.log("Route authorization check:", {
      //   currentPath: location.pathname,
      //   matchingRoute,
      //   availableRoutes: routesAvailable
      // });

      if (Object.keys(matchingRoute).length > 0) {
        // Route is authorized
        valuesStore.setLastAuthorizedPath("lastAuthorizedRoute", location.pathname);
        setIsAuthorized(true);
        setLastAuthorizedPath(location.pathname);
        return true;
      } else {
        // Route is not authorized
        const lastPath = JSON.parse(localStorage.getItem("lastAuthorizedRoute"));;
        console.log(`Unauthorized route: ${location.pathname}`, lastPath);
        console.log(`Unauthorized route, redirecting to: ${lastPath}`);
        setIsAuthorized(false);
        navigate(lastPath, { replace: true });
        return true;
      }
    };



    if (checkRouteAuthorization()) {
      return;
    }

    // If routes aren't loaded yet, set up polling
    const interval = setInterval(() => {
      if (checkRouteAuthorization()) {
        clearInterval(interval);
      }
    }, 500); // Check every 500ms instead of 1000ms for better UX

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [location.pathname, navigate, valuesStore]);

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (

      <>
        <LoadingSpinner fullscreen={true} tip='Verifying route authorization...' />
      </>
    );
  }

  // Show children if authorized (unauthorized case is handled by navigation)
  return isAuthorized ? children : null;
}

function App() {
  const settingsStore = SettingsStore();
  const valuesStore = ValuesStore();
  const theme = useThemeConfig();
  // const navigate = useNavigate();
  const location = useLocation();
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    const publicPaths = ["/login", "/create_account", "/reset_password", "/otp_request", "/verify_otp"];
    const isPublicPath = publicPaths.includes(location.pathname) ||
      location.pathname.includes("verify_password");

    if (!isPublicPath) {
      // Bootstrap the app and set bootstrapped state
      utils.bootstrap(valuesStore, settingsStore, [
        settingsStore.settings,
        settingsStore.tables_metadata,
      ]);

      // Set a small delay to ensure bootstrap completes
      setTimeout(() => {
        setIsBootstrapped(true);
      }, 100);
    } else {
      setIsBootstrapped(true); // Public paths don't need bootstrap
    }

    return () => {
      // cleanup here
    };
  }, []);



  if (!isBootstrapped) {
    return (
      <ConfigProvider theme={theme}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <LoadingSpinner fullscreen={true} tip='Bootstrapping the app' />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create_account" element={<SignUp />} />
        <Route path="/reset_password" element={<RequestResetLink />} />
        <Route path="/verify_password/:resetToken" element={<VerifyResetToken />} />
        <Route path="/otp_request" element={<RequestOtp />} />
        <Route path="/verify_otp" element={<VerifyOtp />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          // <ProtectedRoute>
          //   <DropdownSidebarLayout />
          // </ProtectedRoute>
          <DropdownSidebarLayout />



        }>
          <Route index element={<Admin />} />
          <Route path="home" element={<Admin />} />

          {/* Settings sub-routes */}
          <Route path="settings">
            <Route index element={<Navigate to="api_settings" replace />} />
            <Route path="api_settings" element={<SystemSettings />} />
            <Route path="system_logs" element={<LogsOverview />} />
            <Route path="system_logs/report" element={<Logs />} />
          </Route>

          {/* User Management sub-routes */}
          <Route path="management" element={<UserManagementLayout />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<Roles />} />
            <Route path="resources" element={<Resources />} />
            <Route path="permissions" element={<Permission />} />
          </Route>
        </Route>

        <Route path='*' element={<NotFound url={"/"} />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;