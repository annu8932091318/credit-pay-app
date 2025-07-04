import React from 'react';
import { Chip, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import { motion } from 'framer-motion';

const SaleStatus = ({ status, variant = 'chip', size = 'medium' }) => {
  const theme = useTheme();

  const getStatusDetails = () => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Paid',
          color: theme.palette.status.paid,
          icon: <CheckCircleIcon fontSize="small" />,
          borderColor: theme.palette.status.paid,
        };
      case 'PENDING':
        return {
          label: 'Pending',
          color: theme.palette.status.pending,
          icon: <PendingIcon fontSize="small" />,
          borderColor: theme.palette.status.pending,
        };
      case 'OVERDUE':
        return {
          label: 'Overdue',
          color: theme.palette.status.overdue,
          icon: <ErrorIcon fontSize="small" />,
          borderColor: theme.palette.status.overdue,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: theme.palette.status.cancelled,
          icon: <CancelIcon fontSize="small" />,
          borderColor: theme.palette.status.cancelled,
        };
      case 'PARTIAL':
        return {
          label: 'Partially Paid',
          color: theme.palette.status.partial,
          icon: <PaymentsIcon fontSize="small" />,
          borderColor: theme.palette.status.partial,
        };
      default:
        return {
          label: status,
          color: theme.palette.grey[500],
          icon: null,
          borderColor: theme.palette.grey[500],
        };
    }
  };

  const statusDetails = getStatusDetails();

  if (variant === 'text') {
    return (
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        style={{ color: statusDetails.color, fontWeight: 600 }}
      >
        {statusDetails.label}
      </Typography>
    );
  }

  if (variant === 'icon') {
    return (
      <Box display="flex" alignItems="center">
        <Box 
          component={motion.div} 
          sx={{ color: statusDetails.color }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {statusDetails.icon}
        </Box>
        <Typography
          variant="body2"
          style={{ 
            color: statusDetails.color, 
            marginLeft: 4, 
            fontWeight: 500 
          }}
        >
          {statusDetails.label}
        </Typography>
      </Box>
    );
  }

  if (variant === 'dot') {
    return (
      <Box display="flex" alignItems="center">
        <Box
          component={motion.span}
          sx={{
            width: size === 'small' ? 8 : 10,
            height: size === 'small' ? 8 : 10,
            borderRadius: '50%',
            backgroundColor: statusDetails.color,
            display: 'inline-block',
            marginRight: 1,
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          style={{ color: statusDetails.color, fontWeight: 500 }}
        >
          {statusDetails.label}
        </Typography>
      </Box>
    );
  }

  // Default: chip variant
  return (
    <Chip
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      label={statusDetails.label}
      icon={statusDetails.icon}
      size={size}
      style={{
        backgroundColor: `${statusDetails.color}10`,
        color: statusDetails.color,
        border: `1px solid ${statusDetails.borderColor}`,
        fontWeight: 500,
      }}
    />
  );
};

export default SaleStatus;
