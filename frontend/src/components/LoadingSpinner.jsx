import React from 'react';
import { 
  Backdrop, 
  Box, 
  Typography, 
  Paper,
  useTheme,
  Fade
} from '@mui/material';
import ClassicLoader from './ClassicLoader';

function LoadingSpinner({ 
  open = false, 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false
}) {
  const theme = useTheme();
  
  if (fullScreen) {
    return (
      <Backdrop
        open={open}
        sx={{ 
          color: theme.palette.primary.main, 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          backdropFilter: 'blur(3px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <Fade in={open}>
          <Paper
            elevation={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 50px',
              borderRadius: '16px',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 30, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              minWidth: '280px',
            }}
          >
            <ClassicLoader 
              size="large"
              text=""
            />
            {message && (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mt: 3,
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}
              >
                {message}
              </Typography>
            )}
          </Paper>
        </Fade>
      </Backdrop>
    );
  }

  return (
    <Fade in={open}>
      <Box
        sx={{
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 5,
          width: '100%',
          minHeight: '120px'
        }}
      >
        <ClassicLoader 
          size="medium"
          text=""
        />
        {message && (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mt: 2,
              fontWeight: 500,
              opacity: 0.9
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
}

export default LoadingSpinner;