import { useEffect, useMemo } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import useTable from './hooks/useTable'
import Admin from './pages/Admin';

function App() {
  // Initialize with your backend's pagination format
  const initialParams = {
    pagination: {
      current: 1,        // Maps to currentPage in backend
      pageSize: 5,       // Maps to limit in backend  

    }
  };

  const table = useTable(initialParams, "v1/goals");

  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...table.getColumnSearchProps("name"),
      sorter: true,
      filterSearch: true
    },
  ], []);




  const authRoutes = {
    path: "/*",  // Define a distinct root for auth-related pages
    element: <Outlet />,  // Use Outlet to handle nested routes
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
  ]);




  useEffect(() => {
    console.log('Initializing table...')
    table.setColumns(columns);
    table.setColFilters("name", "v1/filter/goals");
    table.setAllowSelection(true);
  }, []); // Empty dependency - only run once

  return (
    <>

      <RouterProvider router={router} />
      {/* {table.table} */}
    </>
  )
}

export default App