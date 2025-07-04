import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  alpha,
  useTheme,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  SentimentVeryDissatisfied as SadIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

function NotFoundPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          textAlign: 'center', 
          width: '100%', 
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`
            : `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, #fff)`,
          boxShadow: theme.shadows[6]
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          }}
        />
        
        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: { xs: 2, md: 4 }
          }}>
            <Box sx={{ position: 'relative' }}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{
                  fontSize: { xs: '120px', md: '150px' },
                  fontWeight: 900,
                  color: alpha(theme.palette.primary.main, 0.1),
                  letterSpacing: '-5px',
                  mb: -2
                }}
              >
                404
              </Typography>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translate(-50%, -50%)'
                  },
                  '50%': {
                    transform: 'translate(-50%, -60%)'
                  }
                }
              }}>
                <SadIcon sx={{ 
                  fontSize: 80, 
                  color: theme.palette.primary.main,
                  opacity: 0.8
                }} />
              </Box>
            </Box>
            
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mt: 4,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Page Not Found
            </Typography>
            
            <Typography 
              variant="body1" 
              color="textSecondary" 
              sx={{ 
                mt: 2, 
                mb: 4,
                maxWidth: '80%',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Oops! The page you're looking for seems to have gone missing.
              It might have been moved or doesn't exist anymore.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  borderRadius: 8,
                  px: 3,
                  py: 1.5,
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ 
                  borderRadius: 8,
                  px: 3,
                  py: 1.5,
                  borderWidth: '2px',
                  borderColor: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-3px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                Go Back
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center',
            justifyContent: 'center' 
          }}>
            <Box 
              component="img"
              src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg" 
              alt="404 Illustration"
              sx={{
                width: '100%',
                maxWidth: 350,
                height: 'auto',
                borderRadius: 3,
                boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                transform: 'perspective(1000px) rotateY(-10deg)',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg)'
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default NotFoundPage;