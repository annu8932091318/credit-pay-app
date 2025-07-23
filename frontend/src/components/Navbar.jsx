import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
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
  Container,
  Badge,
  Paper,
  alpha
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
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get theme and auth context
  const { isDarkMode, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  
  // Profile menu handlers
  const handleOpenProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleCloseProfileMenu();
    logout();
    navigate('/');
  };


  // Generic nav click handler: just navigate to the target path
  const handleNavClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  // Define navigation links
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, onClick: handleNavClick('/dashboard') },
    { label: 'Customers', path: '/customers', icon: <PeopleIcon />, onClick: handleNavClick('/customers') },
    { label: 'Sales History', path: '/sales', icon: <ShoppingCartIcon />, onClick: handleNavClick('/sales') },
    { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon />, badge: 3, onClick: handleNavClick('/notifications') },
  ];
  
  // Profile menu options
  const profileMenuItems = [
    { label: 'My Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'Logout', path: '/', icon: <ExitToAppIcon /> },
  ];

  // Check if a path is active
  const isActive = (path) => {
    if (location.pathname === path) return true;
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
      <Box 
        sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDarkMode 
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            letterSpacing: '0.02em',
            mb: 1
          }}
        >
          Credit Pay
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {user?.shopName || 'My Shop'}
          </Typography>
        </Box>
      </Box>

      {/* User profile section */}
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex', 
          alignItems: 'center',
          bgcolor: isDarkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1),
          borderBottom: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.2) : theme.palette.divider}`
        }}
      >
        <Avatar 
          sx={{ 
            mr: 2, 
            width: 48,
            height: 48,
            bgcolor: isDarkMode ? 'primary.main' : 'primary.dark',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '0.95rem'
            }}
          >
            {user?.name || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Shop Owner
          </Typography>
        </Box>
      </Box>

      {/* Navigation links */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.path}
            onClick={item.onClick}
            sx={{ 
              mb: 0.8,
              borderRadius: 2,
              py: 1,
              bgcolor: isActive(item.path) ? 
                (isDarkMode 
                  ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`
                  : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`) 
                : 'transparent',
              borderLeft: isActive(item.path) ? 
                `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDarkMode ? 
                  alpha(theme.palette.primary.main, 0.12) : 
                  alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(4px)'
              }
            }}
            className={isActive(item.path) ? "drawer-list-item active" : "drawer-list-item"}
          >
            <ListItemIcon 
              sx={{ 
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                minWidth: 40,
                '& .MuiSvgIcon-root': {
                  transition: 'transform 0.2s ease',
                  fontSize: '1.25rem'
                }
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 600 : 500,
                color: isActive(item.path) ? 'primary.main' : 'text.primary',
                letterSpacing: isActive(item.path) ? '0.02em' : 'normal',
                transition: 'all 0.2s ease'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Profile options section */}
      <List sx={{ p: 2 }}>
        {profileMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.path} 
            component={item.label === 'Logout' ? 'button' : Link}
            to={item.label !== 'Logout' ? item.path : undefined}
            onClick={item.label === 'Logout' ? handleLogout : undefined}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              '&:hover': {
                bgcolor: isDarkMode ? 
                  alpha(theme.palette.primary.main, 0.1) : 
                  alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={isDarkMode ? 0 : 2}
        sx={{ 
          background: isDarkMode 
            ? `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`
            : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: '#ffffff',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Container maxWidth="xl" sx={{ px: {xs: 2, sm: 3, md: 4} }}>
          <Toolbar disableGutters sx={{ minHeight: {xs: 64, sm: 70, md: 75}, py: 0.5 }}>
            {(isMobile || isTablet) && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ 
                  mr: 2,
                  color: '#ffffff'
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexGrow: isMobile ? 1 : 0
              }}
            >
              <Typography
                variant="h5"
                component="span"
                sx={{
                  color: isDarkMode ? '#ffffff' : '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  mr: { md: 4 },
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  letterSpacing: '0.02em',
                  textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer'
                }}
                className="navbar-brand"
              >
                Credit Pay
              </Typography>
            </Box>

            {!isMobile && !isTablet && (
              <Box sx={{ display: 'flex', ml: 2, mr: 'auto' }} className="navbar-nav">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    onClick={item.onClick}
                    sx={{ 
                      mx: 0.8,
                      px: 2.5,
                      py: 1.5,
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      position: 'relative',
                      backgroundColor: isActive(item.path) ? alpha('#ffffff', 0.15) : 'transparent',
                      transition: 'all 0.2s ease',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isActive(item.path) ? '30%' : '0%',
                        height: 2,
                        bgcolor: '#ffffff',
                        opacity: isActive(item.path) ? 1 : 0,
                        transition: 'all 0.3s ease',
                        borderRadius: '2px'
                      },
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.1),
                        '&::after': {
                          width: '20%',
                          opacity: 0.8
                        }
                      }
                    }}
                    className={`nav-button ${isActive(item.path) ? "active-nav-item active-nav-button" : ""}`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.badge ? (
                        <Badge badgeContent={item.badge} color="error" sx={{ mr: 0.5 }}>
                          {item.icon}
                        </Badge>
                      ) : item.icon}
                      {item.label}
                    </Box>
                  </Button>
                ))}
              </Box>
            )}
            
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Theme Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
              </Box>
              
              {/* User profile menu button */}
              <Box 
                sx={{ 
                  ml: 1.5, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  py: 1,
                  px: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha('#fff', 0.2)}`,
                  backgroundColor: alpha('#fff', 0.1),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.15),
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={handleOpenProfileMenu}
              >
                <Avatar 
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: '#ffffff',
                    color: theme.palette.primary.main,
                    fontSize: '1rem',
                    fontWeight: 700,
                    border: `2px solid ${alpha('#fff', 0.8)}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>

                {!isMobile && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: '#ffffff'
                      }}
                    >
                      {user?.name || 'User'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: alpha('#ffffff', 0.85),
                        lineHeight: 1.2
                      }}
                    >
                      {user?.shopName || 'My Shop'}
                    </Typography>
                  </Box>
                )}

                <ExpandMoreIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: 'text.secondary',
                    display: {xs: 'none', sm: 'block'}
                  }} 
                />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'background.paper' : '#ffffff',
            borderRight: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : theme.palette.divider}`,
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Menu
        id="profile-menu"
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleCloseProfileMenu}
        onClick={handleCloseProfileMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            borderRadius: 2,
            border: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : theme.palette.divider}`,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              gap: 1.5
            }
          }
        }}
      >
        {profileMenuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            component={item.label === 'Logout' ? 'button' : Link}
            to={item.label !== 'Logout' ? item.path : undefined}
            onClick={item.label === 'Logout' ? handleLogout : handleCloseProfileMenu}
            sx={{
              color: item.label === 'Logout' ? 'error.main' : 'text.primary',
              '& .MuiListItemIcon-root': {
                color: item.label === 'Logout' ? 'error.main' : 'text.secondary'
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default Navbar;
