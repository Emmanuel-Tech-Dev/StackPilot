import { useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';

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
// import SignUp, Reset, etc.

function App() {
  const settingsStore = SettingsStore();
  const valuesStore = ValuesStore();
  const theme = useThemeConfig();

  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return null;
  };

  // --- Auth Routes ---
  const authRoutes = {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    ),
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
      { path: "create_account", element: <SignUp /> },
      // { path: "reset-password/:resetToken", element: <VerifyResetToken /> },
    ],
  };

  // --- Admin Routes ---
  const adminRoutes = {
    path: "/admin",
    element: (
      <>
        <ScrollToTop />
        <DropdownSidebarLayout>
          <Outlet />
        </DropdownSidebarLayout>
      </>
    ),
    children: [
      { index: true, element: <Admin /> },
      { path: "home", element: <Admin /> },

      {
        path: "settings",
        children: [
          { index: true, element: <Navigate to="api_settings" replace /> },
          { path: "api_settings", element: <SystemSettings /> },
          { path: "system_logs", element: <LogsOverview /> },
          { path: "system_logs/report", element: <Logs /> },
        ],
      },

      {
        path: "user_management",
        element: <UserManagementLayout />,
        children: [
          { index: true, element: <Navigate to="users" replace /> },
          { path: "users", element: <UserManagement /> },
          { path: "roles", element: <Roles /> },
          { path: "resources", element: <Resources /> },
          { path: "permissions", element: <Permission /> },
        ],
      },
    ],
  };

  const router = createBrowserRouter(
    [
      authRoutes,
      adminRoutes,
      // { path: "*", element: <NotFound /> }
    ]
  );

  useEffect(() => {
    utils.bootstrap(valuesStore, settingsStore);
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
          v7_fetcherPersist: true,
          v7_normalizeFormMethod: true,
          v7_partialHydration: true,
          v7_skipActionErrorRevalidation: true,
        }}
      />
    </ConfigProvider>
  );
}

export default App;
