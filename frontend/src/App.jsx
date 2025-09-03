import { useEffect, useMemo, useState } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import useTable from './hooks/useTable'
import Admin from './pages/Admin';
import utils from './dependencies/helpers/utilities';
import ValuesStore from "./store/values-store";
import SettingsStore from "./store/settings-store";
import useThemeConfig from './hooks/useThemeConfig';
import { ConfigProvider } from 'antd';

import { DropdownSidebarLayout, SimpleLayout, PlainSidebarLayout } from './layout/Layout';







function App() {

  const settingsStore = SettingsStore();
  const valuesStore = ValuesStore();
  const theme = useThemeConfig()



  const authRoutes = {
    path: "/*",  // Define a distinct root for auth-related pages
    element: (
      <DropdownSidebarLayout>
        <Outlet />
      </DropdownSidebarLayout>
    )
    ,  // Use Outlet to handle nested routes
    children: [
      // { index: true, element: <Navigate to="login" /> }, // Redirect to /auth/login
      // { path: "login", element: <Login /> },
      // { path: "sign-up", element: <SignUp /> },
      // { path: "password-reset-link", element: <RequestResetLink /> },
      // { path: "reset-password", element: <VerifyResetToken /> },
      // { path: "reset-password/:resetToken", element: <VerifyResetToken /> },
      // { path: "otp-request", element: <RequestOtp /> },
      // { path: "otp-verify", element: <VerifyOtp /> },
      {
        path: "/*",
        element: (

          // <LayoutDash>
          <Outlet />
          // </LayoutDash>
        ),
        // Render a nested outlet for hall routes
        children: [
          { index: true, element: <Admin /> },  // Default path /admin/halls
          { path: "home", element: <Admin /> },
          // { path: "manage", element: <Navigate to="/admin/manage/users" /> },
          // { path: "manage/:tab", element: <AdminHome /> },
          // {
          //   path: "project", element: <Project />
          // },
          // { path: "project/:id", element: <SingleProject /> },
          // { path: "project/:id/pages/:pageId", element: <PagesPost /> },
          // { path: "components", element: <Component /> }

        ],
      },
    ]
  };



  const router = createBrowserRouter([
    authRoutes,

    // {
    //   path: "/",
    //   element: (
    //     <ProtectedRoute>
    //       <Navigate to="/" replace />
    //     </ProtectedRoute>
    //   ),
    // },
    // { path: "*", element: <NotFound url="/" /> },
  ],
    {
      future: {
        v7_startTransition: false, // Enable the v7_startTransition flag to silence the warning
      },
    }
  );




  useEffect(() => {
    utils.bootstrap(valuesStore, settingsStore);
  }, [])
  // Include store dependencies

  return (
    <>
      <ConfigProvider theme={theme}>
        <RouterProvider router={router} />
      </ConfigProvider>
      {/* {table.table} */}
    </>
  )
}

export default App