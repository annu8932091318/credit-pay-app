import React from 'react';
import { 
  CircularProgress, 
  Backdrop, 
  Box, 
  Typography 
} from '@mui/material';

function LoadingSpinner({ 
  open = false, 
  message = 'Loading...', 
  size = 40,
  fullScreen = false
}) {
  if (fullScreen) {
    return (
      <Backdrop
        open={open}
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column'
        }}
      >
        <CircularProgress color="inherit" size={size} />
        {message && (
          <Typography 
            variant="h6" 
            sx={{ mt: 2, color: 'common.white' }}
          >
            {message}
          </Typography>
        )}
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default LoadingSpinner;