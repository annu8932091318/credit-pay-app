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
} from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Ref for the first OTP input field
  const firstOtpInputRef = useRef(null);

  // Phone number validation
  const isPhoneValid = (phone) => /^[0-9]{10}$/.test(phone);

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
      // Mock API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store auth token (in a real app, this would come from the backend)
      localStorage.setItem('token', 'mock-jwt-token');
      
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Invalid OTP. Please try again.', 'error');
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
    if (token) {
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
          
          {!showOtpForm ? (
            /* Phone Number Form */
            <Box component="form" onSubmit={handleSubmitPhone} sx={{ mt: 1, width: '100%', maxWidth: '360px' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Mobile Number"
                name="phone"
                autoComplete="tel"
                autoFocus
                value={phoneNumber}
                onChange={handlePhoneChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: { fontSize: '1.1rem' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                helperText="Enter your registered 10-digit mobile number"
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
                disabled={loading || !phoneNumber || !isPhoneValid(phoneNumber)}
              >
                {loading ? <CircularProgress size={26} /> : 'Send Verification Code'}
              </Button>
              
              <Typography
                variant="body2"
                align="center"
                sx={{ 
                  mt: 3,
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                New to Credit Pay? Contact your administrator
              </Typography>
            </Box>
          ) : (
            /* OTP Verification Form */
            <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 2, width: '100%', maxWidth: '380px' }}>
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
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {canResend ? (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleResendOtp}
                    underline="hover"
                  >
                    Resend OTP
                  </Link>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Resend OTP in {timer} seconds
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
                  Change Phone Number
                </Link>
              </Box>
            </Box>
          )}
          
          {!showOtpForm && (
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