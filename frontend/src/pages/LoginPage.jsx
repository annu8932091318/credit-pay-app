// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  Link,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon,
  Visibility,
  VisibilityOff 
} from '@mui/icons-material';
import { useNotification } from '../components/NotificationSnackbar';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { otpLoginShopkeeper } from '../api';

function LoginPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { login } = useAuth();
  
  // States
  const [tabValue, setTabValue] = useState(0); // 0 = email/password, 1 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Ref for the first OTP input field
  const firstOtpInputRef = useRef(null);

  // Email validation
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Phone number validation
  const isPhoneValid = (phone) => /^[0-9]{10}$/.test(phone);

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!isEmailValid(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }
    
    if (!password) {
      showNotification('Please enter your password', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await login({ email, password });
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      showNotification(error.error || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number input
  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(input);
  };

  // Handle phone number submission
  const handleSubmitPhone = async (e) => {
    e.preventDefault();
    
    if (!isPhoneValid(phoneNumber)) {
      showNotification('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock API call to request OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtpForm(true);
      showNotification('OTP sent successfully!', 'success');
      
      // Start countdown timer
      startResendTimer();
    } catch (error) {
      showNotification('Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };
  
  // Handle keydown events for navigation between OTP inputs
  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (index > 0 && otp[index] === '') {
        // If current field is empty and backspace is pressed, go to previous field
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    } 
    // Handle left arrow key
    else if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    } 
    // Handle right arrow key
    else if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // Handle OTP submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showNotification('Please enter a valid 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      // Call backend to verify OTP and get shopkeeper info and token
      const response = await otpLoginShopkeeper(phoneNumber, otpValue);
      // The backend should return { token, shopkeeper }
      const { token, shopkeeper, user } = response.data || response;
      if (token && (shopkeeper || user)) {
        // Store token and update user context using AuthContext's login logic
        localStorage.setItem('token', token);
        // Use setUser from AuthContext if available, or call login with the user/shopkeeper object
        if (typeof login === 'function') {
          // login expects credentials, but we want to just set user and token
          // So, set user directly if possible
          // If login supports direct user setting, use it; otherwise, setUser manually
          // Here, we assume login can accept an object with user/shopkeeper and token
          await login({ token, user: shopkeeper || user });
        }
        showNotification('Login successful!', 'success');
        navigate('/dashboard');
      } else {
        showNotification('No shopkeeper found for this phone number. Please check your number or sign up.', 'error');
      }
    } catch (error) {
      if (error?.response?.data?.error === 'No shopkeeper found for this phone number') {
        showNotification('No shopkeeper found for this phone number. Please check your number or sign up.', 'error');
      } else {
        showNotification('Invalid OTP. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setCanResend(false);
    
    try {
      // Mock API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('OTP resent successfully!', 'success');
      startResendTimer();
    } catch (error) {
      showNotification('Failed to resend OTP. Please try again.', 'error');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-focus first OTP input when OTP form appears
  useEffect(() => {
    if (showOtpForm && firstOtpInputRef.current) {
      // Short timeout to ensure component is fully rendered
      setTimeout(() => {
        firstOtpInputRef.current.focus();
      }, 100);
    }
  }, [showOtpForm]);

  // Timer for OTP resend
  const startResendTimer = () => {
    setTimer(30);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Only redirect if not already on dashboard
    if (token && window.location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        background: theme => theme.palette.mode === 'dark' 
          ? 'linear-gradient(145deg, #121212 0%, #1e1e1e 100%)' 
          : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 10px 40px rgba(0,0,0,0.5)'
              : '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #5d99c6, #90caf9)'
                : 'linear-gradient(90deg, #0a3258, #0f4c81)',
            }
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src="https://ik.imagekit.io/credit/IMG_1950-fotor-bg-remover-20250704174641.png?updatedAt=1751631431189"
            alt="Credit Pay Logo"
            sx={{ 
              height: 90,
              width: 90,
              mb: 3,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              }
            }}
          />
          
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              mb: 0.5,
              backgroundClip: 'text',
              backgroundImage: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #5d99c6, #90caf9)'
                : 'linear-gradient(90deg, #0a3258, #0f4c81)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.01em'
            }}
          >
            Credit Pay
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              fontWeight: 400
            }}
          >
            Shopkeeper Login Portal
          </Typography>
          
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ width: '100%', mb: 3 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Email / Password" sx={{ flex: 1 }} />
            <Tab label="OTP Login" sx={{ flex: 1 }} />
          </Tabs>
          
          {/* Email/Password Login Form */}
          {tabValue === 0 ? (
            <Box component="form" onSubmit={handleEmailLogin} sx={{ width: '100%', maxWidth: '360px' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                helperText="Enter your registered email address"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VisibilityOff color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                helperText="Enter your password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 4px 15px rgba(144, 202, 249, 0.2)'
                    : '0 4px 15px rgba(15, 76, 129, 0.2)',
                }}
                disabled={loading || !email || !password}
              >
                {loading ? <CircularProgress size={26} /> : 'Login'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setTabValue(1)}
                  underline="hover"
                >
                  Use OTP instead
                </Link>
              </Box>
            </Box>
          ) : (
            /* OTP Login Section */
            <Box sx={{ width: '100%', maxWidth: '360px' }}>
              {!showOtpForm ? (
                /* Phone Number Input */
                <Box component="form" onSubmit={handleSubmitPhone}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Mobile Number"
                    name="phone"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                    helperText="Enter your 10-digit mobile number"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 4,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 15px rgba(144, 202, 249, 0.2)'
                        : '0 4px 15px rgba(15, 76, 129, 0.2)',
                    }}
                    disabled={loading || !isPhoneValid(phoneNumber)}
                  >
                    {loading ? <CircularProgress size={26} /> : 'Send OTP'}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => setTabValue(0)}
                      underline="hover"
                    >
                      Use Email/Password instead
                    </Link>
                  </Box>
                </Box>
              ) : (
                /* OTP Verification Form */
                <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 2 }}>
                  <Typography 
                    variant="h6" 
                    align="center" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    Verification Code
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                      mb: 3,
                      color: 'text.secondary'
                    }}
                  >
                    Enter the 6-digit code sent to <b>{phoneNumber}</b>
                  </Typography>
                  
                  {/* OTP Input Fields */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 1,
                      mb: 3
                    }}
                  >
                    {otp.map((digit, index) => (
                      <TextField
                        key={index}
                        id={`otp-input-${index}`}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        inputRef={index === 0 ? firstOtpInputRef : null}
                        inputProps={{
                          maxLength: 1,
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          autoComplete: 'one-time-code',
                          style: { 
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 600
                          },
                        }}
                        variant="outlined"
                        sx={{ 
                          width: '40px',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderWidth: '2px',
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={loading || otp.join('').length !== 6}
                  >
                    {loading ? <CircularProgress size={26} /> : 'Verify & Login'}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    {canResend ? (
                      <Link
                        component="button"
                        variant="body2"
                        onClick={handleResendOtp}
                        underline="hover"
                        disabled={loading}
                      >
                        Resend OTP
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Resend OTP in {timer}s
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => setShowOtpForm(false)}
                      underline="hover"
                    >
                      Change mobile number
                    </Link>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {!showOtpForm && tabValue === 1 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component="a" 
                  href="/signup" 
                  variant="body2" 
                  sx={{ fontWeight: 600 }}
                >
                  Sign up now
                </Link>
              </Typography>
            </Box>
          )}
          
          {tabValue === 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component="a" 
                  href="/signup" 
                  variant="body2" 
                  sx={{ fontWeight: 600 }}
                >
                  Sign up now
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      
      <LoadingSpinner open={loading} fullScreen={true} />
    </Box>
  );
}

export default LoginPage;