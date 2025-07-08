import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

// Import theme provider
import { AppThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import AddSalePage from './pages/AddSalePage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

// Import shared components
import Navbar from './components/Navbar';
import { NotificationProvider } from './components/NotificationSnackbar';

// PrivateRoute component for protected routes
const PrivateRoute = ({ children }) => {
  // We'll still check localStorage.getItem as a fallback, but the AuthContext is preferred
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </>
  );
};

function App() {
  return (
    <AppThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <CustomersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <PrivateRoute>
                  <CustomerDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-sale"
              element={
                <PrivateRoute>
                  <AddSalePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <SalesHistoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              }
            />
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        </AuthProvider>
      </NotificationProvider>
    </AppThemeProvider>
  );
}

export default App;
