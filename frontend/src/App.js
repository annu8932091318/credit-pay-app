import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { Box, Toolbar, ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './contexts/ThemeContext';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import AddSalePage from './pages/AddSalePage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Import shared components
import SidebarNav from './components/SidebarNav';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import { NotificationProvider } from './components/NotificationSnackbar';
import LoadingSpinner from './components/LoadingSpinner';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#e3f2fd',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

// Layout wrapper for authenticated pages
const PrivateLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopName, setShopName] = useState('Your Shop');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mock fetching shop details
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setShopName('ABC Store');
    }, 500);
  }, []);

  // Access theme context from props instead
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {/* New Navbar component */}
      <Navbar />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* You can comment out or remove these if you prefer to use just the Navbar */}
        {/* <TopBar 
          shopName={shopName} 
          onSidebarToggle={handleDrawerToggle} 
        />
        <SidebarNav 
          open={mobileOpen} 
          onClose={handleDrawerToggle} 
        /> */}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            overflow: 'auto',
            bgcolor: 'background.default',
            color: 'text.primary',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            borderRadius: 1,
            position: 'relative',
            '&:after': isDarkMode ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(144,202,249,0.1) 50%, rgba(0,0,0,0) 100%)',
              zIndex: 1,
            } : {}
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// Auth guard component to protect routes
const PrivateRoute = ({ children }) => {
  // Mock auth check (replace with real auth logic)
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();

  return isAuthenticated ? (
    <PrivateLayout>{children}</PrivateLayout>
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // Create a theme based on dark mode state
  const currentTheme = React.useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#90caf9' : '#1565c0', // Slightly darker blue for formal look
        light: isDarkMode ? '#bbdefb' : '#e3f2fd',
        dark: isDarkMode ? '#5d99c6' : '#0d47a1',
        contrastText: isDarkMode ? '#000000' : '#ffffff',
      },
      secondary: {
        main: isDarkMode ? '#f48fb1' : '#d81b60', // Slightly darker pink for formal look
        light: isDarkMode ? '#f6a5c0' : '#f06292',
        dark: isDarkMode ? '#bf5f82' : '#ad1457',
        contrastText: '#ffffff',
      },
      background: {
        default: isDarkMode ? '#111827' : '#f5f7fa', // Classic dark blue-gray
        paper: isDarkMode ? '#1f2937' : '#ffffff',
        accent: isDarkMode ? '#374151' : '#e5e7eb',
      },
      text: {
        primary: isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.87)', // Slightly softer white
        secondary: isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.6)', // Lighter gray for better contrast
        disabled: isDarkMode ? '#6b7280' : 'rgba(0, 0, 0, 0.38)',
      },
      divider: isDarkMode ? 'rgba(209, 213, 219, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        active: isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.54)',
        hover: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(21, 101, 192, 0.08)',
        focus: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        disabled: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
      },
      error: {
        main: isDarkMode ? '#f87171' : '#d32f2f',
        light: isDarkMode ? '#fca5a5' : '#ef5350',
        dark: isDarkMode ? '#ef4444' : '#c62828',
      },
      warning: {
        main: isDarkMode ? '#fbbf24' : '#ed6c02',
        light: isDarkMode ? '#fcd34d' : '#ff9800',
        dark: isDarkMode ? '#f59e0b' : '#e65100',
      },
      info: {
        main: isDarkMode ? '#60a5fa' : '#0288d1',
        light: isDarkMode ? '#93c5fd' : '#03a9f4',
        dark: isDarkMode ? '#3b82f6' : '#01579b',
      },
      success: {
        main: isDarkMode ? '#34d399' : '#2e7d32',
        light: isDarkMode ? '#6ee7b7' : '#4caf50',
        dark: isDarkMode ? '#10b981' : '#1b5e20',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontWeight: 500,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 500,
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 500,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 500,
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 500,
        letterSpacing: '0.0075em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
      subtitle1: {
        letterSpacing: '0.00938em',
      },
      subtitle2: {
        letterSpacing: '0.00714em',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 6,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 2px 10px rgba(0,0,0,0.5)' 
              : '0 2px 4px rgba(0,0,0,0.1)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.5)' 
              : '0 2px 10px rgba(0,0,0,0.1)',
            backgroundImage: 'none'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDarkMode 
                ? '0 2px 8px rgba(0,0,0,0.5)' 
                : '0 2px 4px rgba(0,0,0,0.2)'
            }
          },
          contained: {
            boxShadow: isDarkMode 
              ? '0 2px 6px rgba(0,0,0,0.4)' 
              : '0 2px 4px rgba(0,0,0,0.1)',
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0 8px 30px rgba(0,0,0,0.5)' 
              : '0 8px 30px rgba(0,0,0,0.15)'
          }
        }
      },
    },
  }), [isDarkMode]);
  
  // Theme toggle handler
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  
  // Create theme context value
  const themeContextValue = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={currentTheme}>
        <NotificationProvider>
          <Router>
            <CssBaseline />
            <Routes>
            {/* Public route */}
            <Route path="/" element={<LoginPage />} />
            
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
                  <DashboardPage /> {/* Replace with NotificationsPage when you create it */}
                </PrivateRoute>
              }
            />
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
