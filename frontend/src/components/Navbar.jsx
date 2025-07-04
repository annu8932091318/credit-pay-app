import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Box,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  ExitToApp as ExitToAppIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const location = useLocation();
  
  // Get theme context
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  // Profile menu handlers
  const handleOpenProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  // Define navigation links
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Customers', path: '/customers', icon: <PeopleIcon /> },
    { label: 'Sales History', path: '/sales', icon: <ShoppingCartIcon /> },
    { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
  ];
  
  // Profile menu options
  const profileMenuItems = [
    { label: 'My Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'Logout', path: '/', icon: <ExitToAppIcon /> },
  ];

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }} className="drawer-header">
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            letterSpacing: '0.02em',
            textShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          Credit Pay
        </Typography>
        <IconButton 
          onClick={toggleDrawer(false)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* User profile section */}
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex', 
          alignItems: 'center',
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <Avatar 
          sx={{ 
            mr: 2, 
            width: 48,
            height: 48,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }} 
          className="user-avatar"
        >
          S
        </Avatar>
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '0.95rem',
              letterSpacing: '0.01em'
            }}
          >
            Shop Owner
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              letterSpacing: '0.02em',
              mt: 0.3
            }}
          >
            Admin
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />

      {/* Navigation links */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.path}
            sx={{ 
              bgcolor: isActive(item.path) ? (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)') : 'transparent',
              borderLeft: isActive(item.path) ? `4px solid ${isDarkMode ? '#90caf9' : '#1565c0'}` : '4px solid transparent',
              pl: isActive(item.path) ? 1.75 : 2,
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
            className={isActive(item.path) ? "drawer-list-item active" : "drawer-list-item"}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? (isDarkMode ? '#90caf9' : '#1565c0') : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'regular',
                color: isActive(item.path) ? (isDarkMode ? '#90caf9' : '#1565c0') : 'text.primary'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Profile options section */}
      <Typography variant="overline" sx={{ px: 2, mt: 2, display: 'block', color: 'text.secondary' }}>
        Account
      </Typography>
      
      {profileMenuItems.map((item) => (
        <ListItem 
          button 
          key={item.path} 
          component={Link} 
          to={item.path}
          onClick={item.label === 'Logout' ? () => localStorage.removeItem('token') : undefined}
          sx={{
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={isDarkMode ? 6 : 3} 
        sx={{ 
          bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          color: isDarkMode ? 'text.primary' : 'inherit',
          transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
          borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
        }} 
        className="navbar"
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ 
                mr: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              className="navbar-toggle"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              color: 'inherit', 
              textDecoration: 'none', 
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
            className="navbar-brand"
          >
            Credit Pay
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5 }} className="navbar-nav">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color={isActive(item.path) ? 'primary' : 'inherit'}
                  sx={{ 
                    fontWeight: isActive(item.path) ? 600 : 500,
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.8,
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    },
                    color: isActive(item.path) 
                      ? (isDarkMode ? '#90caf9' : '#0f4c81')
                      : 'text.primary'
                  }}
                  startIcon={
                    <Box sx={{ 
                      color: isActive(item.path) 
                        ? (isDarkMode ? '#90caf9' : '#0f4c81')
                        : 'text.secondary',
                      mr: -0.5
                    }}>
                      {item.icon}
                    </Box>
                  }
                  className={`nav-button ${isActive(item.path) ? "active-nav-item active-nav-button" : ""}`}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Theme Toggle */}
          <Box sx={{ mx: 1, display: 'flex', alignItems: 'center' }}>
            <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
          </Box>
          
          <Tooltip title="Account settings">
            <IconButton 
              onClick={handleOpenProfileMenu} 
              size="small" 
              sx={{ 
                ml: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              aria-controls={profileMenuAnchor ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={profileMenuAnchor ? 'true' : undefined}
            >
              <Avatar 
                className="user-avatar"
                sx={{
                  width: 38,
                  height: 38,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                S
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="profile-menu"
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleCloseProfileMenu}
            onClick={handleCloseProfileMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: isDarkMode ? 8 : 3,
              sx: {
                overflow: 'visible',
                filter: isDarkMode 
                  ? 'drop-shadow(0px 4px 15px rgba(0,0,0,0.5))' 
                  : 'drop-shadow(0px 2px 10px rgba(0,0,0,0.15))',
                mt: 1.5,
                borderRadius: 2,
                bgcolor: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.87)',
                borderRadius: 1,
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '& .MuiListItemIcon-root': {
                  color: isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.54)',
                },
                '& .MuiMenuItem-root:hover': {
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                }
              },
            }}
          >
            {profileMenuItems.map((item) => (
              <MenuItem 
                key={item.path} 
                component={Link} 
                to={item.path}
                onClick={item.label === 'Logout' ? () => localStorage.removeItem('token') : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        className="nav-drawer"
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : '#ffffff',
            color: isDarkMode ? '#f5f5f5' : 'rgba(0, 0, 0, 0.87)',
            borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            boxShadow: isDarkMode ? '4px 0 15px rgba(0,0,0,0.5)' : '2px 0 15px rgba(0,0,0,0.08)',
            overflowX: 'hidden'
          }
        }}
        SlideProps={{
          sx: {
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Navbar;
