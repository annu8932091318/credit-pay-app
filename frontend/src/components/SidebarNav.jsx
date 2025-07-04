import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  useTheme,
  Paper,
  Typography,
  alpha,
  Tooltip,
  ListItemButton,
  Avatar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AddShoppingCart as AddSaleIcon,
  Receipt as ReceiptIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', description: 'Overview and analytics' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers', description: 'Manage your customers' },
  { text: 'Add Sale', icon: <AddSaleIcon />, path: '/add-sale', description: 'Record a new transaction' },
  { text: 'Sales History', icon: <ReceiptIcon />, path: '/sales-history', description: 'View past transactions' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile', description: 'Manage your account' },
];

function SidebarNav({ open, onClose, drawerWidth = 240 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
          boxShadow: theme.shadows[3],
          overflowX: 'hidden',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        },
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          height: 80, 
          display: 'flex', 
          alignItems: 'center', 
          background: `linear-gradient(120deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 1
        }}
      >
        <Box 
          component="img" 
          src="https://ik.imagekit.io/credit/IMG_1950-fotor-bg-remover-20250704174641.png?updatedAt=1751631431189" 
          alt="Credit Pay Logo" 
          sx={{ 
            height: 45, 
            width: 'auto', 
            mr: 1.5,
            filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.2))',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }} 
        />
        <Box>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              color: 'white',
              letterSpacing: '0.5px',
              textShadow: '0px 2px 3px rgba(0,0,0,0.2)'
            }}
          >
            Credit Pay
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha('#fff', 0.85),
              display: 'block',
              marginTop: -0.5
            }}
          >
            Business Manager
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="overline" 
          color="textSecondary"
          sx={{ 
            opacity: 0.7, 
            fontWeight: 500,
            letterSpacing: '1px',
            pl: 1
          }}
        >
          MAIN NAVIGATION
        </Typography>
      </Box>
      
      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Tooltip 
              title={item.description} 
              placement="right" 
              arrow
              key={item.text}
            >
              <ListItem 
                disablePadding
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: '12px',
                    py: 1.2,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'light' 
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.25),
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light' 
                          ? alpha(theme.palette.primary.main, 0.25)
                          : alpha(theme.palette.primary.main, 0.35),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: '4px',
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '0 4px 4px 0'
                      }
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.7)
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.text.primary, 0.7),
                      minWidth: 40
                    }}
                  >
                    {isActive ? (
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: theme.palette.primary.main
                        }}
                      >
                        {item.icon}
                      </Avatar>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mx: 2,
          mb: 2,
          borderRadius: 2,
          background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.1)})`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
          Need help?
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Check our documentation or contact support for assistance.
        </Typography>
      </Paper>
    </Drawer>
  );
}

export default SidebarNav;