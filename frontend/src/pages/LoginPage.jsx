import React, { useState, useEffect } from 'react';
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
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src="/logo192.png"
            alt="Credit Pay Logo"
            sx={{ height: 80, mb: 2 }}
          />
          
          <Typography component="h1" variant="h5" gutterBottom>
            Login to Shopkeeper Portal
          </Typography>
          
          {!showOtpForm ? (
            /* Phone Number Form */
            <Box component="form" onSubmit={handleSubmitPhone} sx={{ mt: 2, width: '100%' }}>
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
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                helperText="Enter your 10-digit mobile number"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !phoneNumber || !isPhoneValid(phoneNumber)}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </Box>
          ) : (
            /* OTP Verification Form */
            <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Enter the 6-digit code sent to {phoneNumber}
              </Typography>
              
              {/* OTP Input Fields */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  gap: 1
                }}
              >
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-input-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    inputProps={{
                      maxLength: 1,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      style: { textAlign: 'center' },
                    }}
                    variant="outlined"
                    sx={{ width: '40px' }}
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
        </Paper>
      </Container>
      
      <LoadingSpinner open={loading} fullScreen={true} />
    </Box>
  );
}

export default LoginPage;