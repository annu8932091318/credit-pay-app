import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  useTheme
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
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Add Sale', icon: <AddSaleIcon />, path: '/add-sale' },
  { text: 'Sales History', icon: <ReceiptIcon />, path: '/sales-history' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
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
        },
      }}
    >
      <Box sx={{ p: 2, height: 64, display: 'flex', alignItems: 'center' }}>
        <Box 
          component="img" 
          src="/logo192.png" 
          alt="Credit Pay Logo" 
          sx={{ height: 40, width: 'auto', mr: 1 }} 
        />
        <Box sx={{ typography: 'h6', fontWeight: 'bold' }}>Credit Pay</Box>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default SidebarNav;