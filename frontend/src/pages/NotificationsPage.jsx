import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar, 
  Chip, 
  Divider, 
  IconButton,
  Button,
  CircularProgress,
  Container,
  useTheme,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Payment as PaymentIcon, 
  Person as PersonIcon,
  Store as StoreIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import { useNotification } from '../components/NotificationSnackbar';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'Payment Received',
    message: 'Rahul Kumar has repaid ₹500 of their credit.',
    timestamp: '2023-10-25T10:30:00Z',
    read: false
  },
  {
    id: 2,
    type: 'customer',
    title: 'New Customer Added',
    message: 'Priya Sharma has been added to your customers list.',
    timestamp: '2023-10-24T15:45:00Z',
    read: true
  },
  {
    id: 3,
    type: 'credit',
    title: 'Credit Limit Alert',
    message: 'Amit Singh has reached 90% of their credit limit.',
    timestamp: '2023-10-23T09:15:00Z',
    read: false
  },
  {
    id: 4,
    type: 'system',
    title: 'System Update',
    message: 'Credit Pay app has been updated to version 2.1.0.',
    timestamp: '2023-10-22T14:20:00Z',
    read: true
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Reminder Sent',
    message: 'A payment reminder was sent to 3 customers with overdue credits.',
    timestamp: '2023-10-21T11:05:00Z',
    read: true
  }
];

const NotificationsPage = () => {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const { showNotification } = useNotification();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0
  });
  
  useEffect(() => {
    // Simulate API call to fetch notifications
    const fetchNotifications = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setNotifications(mockNotifications);
        
        // Calculate stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        setStats({
          total: mockNotifications.length,
          unread: mockNotifications.filter(n => !n.read).length,
          today: mockNotifications.filter(n => new Date(n.timestamp) >= todayStart).length
        });
        
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        showNotification('Failed to load notifications', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [showNotification]);
  
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    // Update unread count
    setStats(prev => ({
      ...prev,
      unread: prev.unread - 1
    }));
    
    showNotification('Notification marked as read', 'success');
  };
  
  const handleDeleteNotification = (id) => {
    const notif = notifications.find(n => n.id === id);
    const wasUnread = notif && !notif.read;
    
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: wasUnread ? prev.unread - 1 : prev.unread,
      today: new Date(notif.timestamp) >= new Date(new Date().setHours(0, 0, 0, 0)) ? prev.today - 1 : prev.today
    }));
    
    showNotification('Notification deleted', 'success');
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
    showNotification('All notifications marked as read', 'success');
  };
  
  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show only time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Get avatar icon based on notification type
  const getNotificationAvatar = (type) => {
    switch (type) {
      case 'payment':
        return <PaymentIcon />;
      case 'customer':
        return <PersonIcon />;
      case 'system':
        return <NotificationsIcon />;
      case 'credit':
        return <StoreIcon />;
      default:
        return <NotificationsIcon />;
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 2, pb: 6 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          Notifications
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Stats cards */}
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={isDarkMode ? 4 : 1}
              sx={{ 
                bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'white',
                border: isDarkMode ? '1px solid rgba(144, 202, 249, 0.2)' : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: '50%', 
                      mr: 2,
                      bgcolor: 'primary.main',
                      color: 'white'
                    }}
                  >
                    <NotificationsIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Notifications</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={isDarkMode ? 4 : 1}
              sx={{ 
                bgcolor: isDarkMode ? 'rgba(211, 47, 47, 0.1)' : 'white',
                border: isDarkMode ? '1px solid rgba(244, 67, 54, 0.2)' : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: '50%', 
                      mr: 2,
                      bgcolor: 'error.main',
                      color: 'white'
                    }}
                  >
                    <NotificationsIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.unread}</Typography>
                    <Typography variant="body2" color="text.secondary">Unread Notifications</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={isDarkMode ? 4 : 1}
              sx={{ 
                bgcolor: isDarkMode ? 'rgba(46, 125, 50, 0.1)' : 'white',
                border: isDarkMode ? '1px solid rgba(76, 175, 80, 0.2)' : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: '50%', 
                      mr: 2,
                      bgcolor: 'success.main',
                      color: 'white'
                    }}
                  >
                    <NotificationsIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.today}</Typography>
                    <Typography variant="body2" color="text.secondary">Today's Notifications</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleMarkAllAsRead}
            startIcon={<CheckCircleIcon />}
            disabled={stats.unread === 0}
            sx={{ mr: 2 }}
          >
            Mark all as read
          </Button>
        </Box>
        
        <Paper 
          elevation={isDarkMode ? 4 : 1}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          }}
        >
          {loading ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : notifications.length > 0 ? (
            <List disablePadding>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ 
                      py: 2,
                      px: 3,
                      bgcolor: !notification.read ? 
                        (isDarkMode ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)') : 
                        'transparent'
                    }}
                    secondaryAction={
                      <Box>
                        {!notification.read && (
                          <IconButton 
                            edge="end" 
                            aria-label="mark as read"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ mr: 1 }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText
                        }}
                      >
                        {getNotificationAvatar(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 600,
                              mr: 2
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={notification.type} 
                            size="small"
                            sx={{ 
                              height: 24,
                              fontSize: '0.75rem',
                              color: isDarkMode ? 'white' : 'inherit'
                            }}
                          />
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                ml: 1
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up! Check back later for updates.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default NotificationsPage;
