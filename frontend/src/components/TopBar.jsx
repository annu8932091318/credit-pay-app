import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme,
  Avatar,
  Chip,
  Tooltip,
  Badge,
  alpha,
  Button,
  Paper
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle/ThemeToggle';

function TopBar({ shopName = 'Your Shop', onSidebarToggle }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const handleLogout = () => {
    // Clear any auth tokens or user data
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      color="inherit"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: 3,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.97))'
          : `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onSidebarToggle}
              sx={{ 
                mr: 2,
                color: theme.palette.text.primary,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* App Logo on extreme left */}
          <Box 
            component="img" 
            src="https://ik.imagekit.io/credit/IMG_1950-fotor-bg-remover-20250704174641.png?updatedAt=1751631431189" 
            alt="Credit Pay Logo" 
            sx={{ 
              height: 40, 
              width: 'auto', 
              mr: 2,
              ml: isMobile ? 0 : -1,
              display: 'flex',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/dashboard')}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={<StoreIcon fontSize="small" />}
              label={shopName}
              variant="outlined"
              color="primary"
              sx={{ 
                px: 1,
                height: 40,
                borderRadius: '20px',
                borderWidth: '2px',
                background: alpha(theme.palette.primary.main, 0.05),
                '& .MuiChip-label': {
                  px: 1,
                  fontWeight: 600,
                  fontSize: '0.9rem'
                },
                '& .MuiChip-icon': {
                  color: theme.palette.primary.main
                }
              }}
            />
            
            <Typography
              variant="body2"
              sx={{
                ml: 2,
                color: theme.palette.text.secondary,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle 
            isDark={theme.palette.mode === 'dark'} 
            onToggle={() => {}} 
          />
          
          <Tooltip title="Notifications">
            <IconButton
              size="medium"
              color="inherit"
              sx={{ 
                ml: 1,
                color: theme.palette.text.primary,
                transition: 'transform 0.2s',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Badge badgeContent={2} color="error" overlap="circular">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton
              size="medium"
              color="inherit"
              sx={{ 
                ml: 1,
                color: theme.palette.text.primary,
                transition: 'transform 0.2s',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Paper
            elevation={0}
            sx={{
              ml: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '30px',
              px: 1,
              py: 0.5,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.default, 0.5)
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                mr: 1
              }}
            >
              {shopName.charAt(0)}
            </Avatar>
            
            <Box sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight="medium">
                Admin
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Manager
              </Typography>
            </Box>
            
            <Tooltip title="Logout">
              <IconButton
                size="small"
                color="inherit"
                onClick={handleLogout}
                sx={{ 
                  color: theme.palette.error.main,
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.error.main, 0.1) 
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;