import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout as LogoutIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function TopBar({ shopName = 'Your Shop', onSidebarToggle }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    // Clear any auth tokens or user data
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: 1
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1 }}
        >
          Welcome, {shopName}
        </Typography>
        
        <Box sx={{ display: { xs: 'flex' } }}>
          <IconButton
            size="large"
            aria-label="logout"
            color="inherit"
            onClick={handleLogout}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;