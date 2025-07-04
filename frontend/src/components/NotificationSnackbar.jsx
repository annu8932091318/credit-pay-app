import React, { createContext, useContext, useState } from 'react';
import { 
  Snackbar, 
  Alert, 
  Slide, 
  Box, 
  Typography, 
  IconButton,
  useTheme
} from '@mui/material';
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  WarningAmberOutlined as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Create a context for the notification
export const NotificationContext = createContext({
  showNotification: () => {},
  hideNotification: () => {},
});

// Custom hook for using notifications
export const useNotification = () => useContext(NotificationContext);

// Notification Provider component
export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [autoHide, setAutoHide] = useState(true);
  
  const showNotification = (message, severity = 'success', autoHide = true) => {
    setMessage(message);
    setSeverity(severity);
    setAutoHide(autoHide);
    setOpen(true);
  };
  
  const hideNotification = () => {
    setOpen(false);
  };
  
  return (
    <NotificationContext.Provider 
      value={{ showNotification, hideNotification }}
    >
      {children}
      <NotificationSnackbar 
        open={open} 
        message={message} 
        severity={severity} 
        onClose={hideNotification}
        autoHide={autoHide}
      />
    </NotificationContext.Provider>
  );
}

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function NotificationSnackbar({ open, message, severity, onClose, autoHide = true }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };
  
  // Map severity to icon
  const severityIcons = {
    success: <SuccessIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
    info: <InfoIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
  };
  
  const icon = severityIcons[severity] || <InfoIcon fontSize="small" />;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHide ? 6000 : null}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={TransitionUp}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '10px',
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: { xs: '90%', sm: '500px' },
        }
      }}
    >
      <Alert 
        icon={icon}
        onClose={handleClose} 
        severity={severity} 
        variant="filled" 
        sx={{ 
          width: '100%',
          boxShadow: isDark 
            ? '0 4px 20px rgba(0,0,0,0.5)' 
            : '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          py: 1.5,
          px: 2
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Typography variant="body2" fontWeight={500}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
}

export default NotificationSnackbar;