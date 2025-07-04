import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Link, 
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Store as StoreIcon,
  Phone as PhoneIcon 
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

const SignupPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    shopName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Input change handler
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeTerms' ? checked : value
    }));
    
    // Clear error when user starts typing again
    if (error) setError(null);
  };

  // Password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      localStorage.setItem('token', 'mock-token');
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: 'background.default',
        backgroundImage: isDarkMode 
          ? 'linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.9))'
          : 'linear-gradient(rgba(247, 250, 252, 0.7), rgba(247, 250, 252, 0.9))'
      }}
    >
      {/* Theme toggle positioned at top right */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <ThemeToggle />
      </Box>
      
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 8,
            mb: 4
          }}
        >
          {/* Logo or App Name */}
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'primary.main',
              textShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
              letterSpacing: '-0.01em'
            }}
          >
            Credit Pay
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: 'text.secondary',
              maxWidth: 350
            }}
          >
            Create your account to start managing your shop credit system
          </Typography>
          
          <Paper
            elevation={isDarkMode ? 10 : 2}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
              background: isDarkMode 
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.95))'
                : theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : 'none',
              boxShadow: isDarkMode 
                ? '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.2)'
                : '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="fullName"
                    label="Full Name"
                    autoComplete="name"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="shopName"
                    label="Shop Name"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.shopName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            size="large"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    variant="outlined"
                    fullWidth
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                            size="large"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        name="agreeTerms" 
                        color="primary" 
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link component="button" variant="body2" onClick={(e) => e.preventDefault()}>
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link component="button" variant="body2" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.2,
                  fontWeight: 600,
                  position: 'relative',
                  boxShadow: isDarkMode 
                    ? '0 4px 14px rgba(0, 0, 0, 0.4)'
                    : '0 4px 14px rgba(21, 101, 192, 0.2)',
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 20px rgba(0, 0, 0, 0.6)'
                      : '0 6px 20px rgba(21, 101, 192, 0.4)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress 
                    size={24} 
                    sx={{ color: 'white', position: 'absolute' }} 
                  />
                ) : "Create Account"}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/" variant="body1" sx={{ fontWeight: 600 }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupPage;
