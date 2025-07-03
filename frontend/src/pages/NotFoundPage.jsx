import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
        <SadIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Go Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default NotFoundPage;