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
} from '@mui/material';
import { Warning as WarningIcon, Close as CloseIcon } from '@mui/icons-material';

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
  // Map severity to color
  const severityColors = {
    warning: 'warning.main',
    error: 'error.main',
    info: 'info.main',
    success: 'success.main',
  };

  // Map severity to icon
  const SeverityIcon = WarningIcon;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
        <SeverityIcon sx={{ color: severityColors[severity], mr: 1 }} />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton aria-label="close" onClick={onCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog; 