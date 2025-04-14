import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: Auth state:', { user, loading, roles });

  // Show loading indicator while authentication is being checked
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && !roles.includes(user.role)) {
    console.log(`ProtectedRoute: User role ${user.role} not authorized, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute: User authenticated and authorized, rendering children');
  return children;
};

export default ProtectedRoute; 