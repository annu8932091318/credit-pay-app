import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  useTheme,
  Slide,
  Paper,
  Avatar
} from '@mui/material';
import { 
  Warning as WarningIcon, 
  Close as CloseIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon 
} from '@mui/icons-material';

// Slide transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning',
}) {
  const theme = useTheme();
  
  // Map severity to color
  const severityColors = {
    warning: 'warning',
    error: 'error',
    info: 'info',
    success: 'success',
  };

  // Map severity to icon
  const severityIcons = {
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
    success: SuccessIcon,
  };
  
  const SeverityIcon = severityIcons[severity] || WarningIcon;
  const color = severityColors[severity] || 'warning';
  
  const isDark = theme.palette.mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          backgroundColor: theme.palette[color][isDark ? 'dark' : 'light'],
          opacity: isDark ? 0.8 : 0.2,
          height: '8px',
          width: '100%'
        }} 
      />
      
      <DialogTitle 
        id="confirm-dialog-title" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          pt: 3, 
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar
            sx={{ 
              bgcolor: theme.palette[color][isDark ? 'dark' : 'main'],
              color: '#fff',
              width: 36,
              height: 36,
              mr: 2,
              boxShadow: `0 2px 8px ${theme.palette[color][isDark ? 'dark' : 'main']}40`
            }}
          >
            <SeverityIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" component="span" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <IconButton 
          aria-label="close" 
          onClick={onCancel} 
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <DialogContentText 
          id="confirm-dialog-description"
          sx={{
            color: 'text.primary',
            opacity: 0.9,
            lineHeight: 1.6
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onCancel} 
          color="inherit"
          variant="outlined"
          sx={{
            px: 3,
            borderRadius: '8px',
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={color} 
          variant="contained" 
          autoFocus
          sx={{
            px: 3,
            borderRadius: '8px',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog; 