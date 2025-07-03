import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

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
  
  const showNotification = (message, severity = 'success') => {
    setMessage(message);
    setSeverity(severity);
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
      />
    </NotificationContext.Provider>
  );
}

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function NotificationSnackbar({ open, message, severity, onClose }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={TransitionUp}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled" 
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default NotificationSnackbar;