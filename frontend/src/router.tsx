import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/layout/Layout';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { Sales } from './pages/Sales';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: '/products',
            element: <Products />,
          },
          {
            path: '/inventory',
            element: <Inventory />,
          },
          {
            path: '/pos',
            element: <POS />,
          },
          {
            path: '/sales',
            element: <Sales />,
          },
          {
            path: '/users',
            element: <Users />,
          },
          {
            path: '/notifications',
            element: <Notifications />,
          },
          {
            path: '/reports',
            element: <Reports />,
          },
          // Add other routes here as we build them
          {
            path: '*',
            element: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
