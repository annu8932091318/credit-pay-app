import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Divider,
  Avatar,
  Badge,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccountBalanceWallet as WalletIcon,
  Save as SaveIcon,
  QrCode as QrCodeIcon,
  EditOutlined as EditIcon,
  WhatsApp as WhatsAppIcon,
  Store as StoreIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

import { fetchShopkeeper, updateShopkeeper } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import commonStyles from '../styles/commonStyles';

function ProfilePage() {
  const { showNotification } = useNotification();
  
  // States
  const [profile, setProfile] = useState({
    shopName: '',
    phone: '',
    upiId: '',
    enableWhatsApp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Mock shopkeeper ID - in real app would come from auth context
        const shopkeeperId = '12345';
        const response = await fetchShopkeeper(shopkeeperId);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        showNotification('Failed to load profile data', 'error');
        
        // Set default data for demo
        setProfile({
          _id: '12345',
          shopName: 'My Shop',
          phone: '9876543210',
          upiId: 'myshop@upi',
          enableWhatsApp: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [showNotification]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'enableWhatsApp' ? checked : value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await updateShopkeeper(profile._id, profile);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate UPI QR code URL
  const getUpiQrUrl = () => {
    if (!profile.upiId) return '';
    
    // This is a placeholder - in a real app you'd use a proper UPI QR code generator
    const upiUrl = `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(profile.shopName)}`;
    return `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(upiUrl)}`;
  };

  if (loading) {
    return <LoadingSpinner open={true} fullScreen={true} />;
  }

  return (
    <Box>
      {/* Page Header with Gradient Background */}
      <Paper 
        elevation={0} 
        sx={{
          background: theme => theme.palette.mode === 'dark' 
            ? commonStyles.gradients.primaryDark
            : commonStyles.gradients.primary,
          p: 3,
          mb: 4,
          borderRadius: 2,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          transform: 'translate(30%, -30%)',
        }} />
        
        <Box sx={{
          position: 'relative',
          zIndex: 1,
        }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '0px 2px 3px rgba(0,0,0,0.2)' }}>
            Profile Settings
          </Typography>
          <Typography variant="subtitle1">
            Manage your store profile and payment information
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Left Column - Profile Photo and Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ 
            height: '100%',
            borderRadius: 2,
            boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 4,
              textAlign: 'center'
            }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title="Change photo" arrow>
                      <IconButton 
                        sx={{ 
                          bgcolor: theme => theme.palette.primary.main,
                          color: 'white',
                          '&:hover': { 
                            bgcolor: theme => theme.palette.primary.dark
                          },
                          width: 36,
                          height: 36
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120,
                      fontSize: '3rem',
                      bgcolor: theme => theme.palette.secondary.main,
                      boxShadow: theme => commonStyles.customShadows.button(theme.palette.mode === 'dark')
                    }}
                  >
                    {profile.shopName?.charAt(0) || 'S'}
                  </Avatar>
                </Badge>
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {profile.shopName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    {profile.phone}
                  </Typography>
                  <Tooltip title="Verified" arrow>
                    <VerifiedUserIcon sx={{ 
                      fontSize: 14, 
                      ml: 1, 
                      color: 'success.main' 
                    }} />
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WalletIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {profile.upiId || 'No UPI ID set'}
                  </Typography>
                </Box>
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  width: '100%',
                  borderRadius: 2,
                  bgcolor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.02)',
                  borderColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Account Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Business Account
                  </Typography>
                  <Chip
                    label="Active"
                    color="success"
                    size="small"
                    sx={{
                      ml: 1,
                      ...commonStyles.statusChip,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Form */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ 
            borderRadius: 2,
            boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ mr: 1 }} />
                Edit Profile
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {/* Shop Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Shop Name"
                      name="shopName"
                      value={profile.shopName}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <StoreIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                    />
                  </Grid>
                  
                  {/* Email (added as example) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value="business@example.com"
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Contact support to update your email"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                    />
                  </Grid>
                  
                  {/* Phone Number (disabled) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profile.phone}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Contact support to update your phone number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                    />
                  </Grid>
                  
                  {/* UPI ID */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="UPI ID"
                      name="upiId"
                      value={profile.upiId}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WalletIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              onClick={() => setShowQR(!showQR)}
                              startIcon={<QrCodeIcon />}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: 1.5,
                                textTransform: 'none'
                              }}
                            >
                              {showQR ? 'Hide QR' : 'Show QR'}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Your UPI ID for receiving payments"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                    />
                  </Grid>
                  
                  {/* UPI QR Code */}
                  <Grid item xs={12}>
                    <Fade in={showQR && !!profile.upiId}>
                      <Box sx={{ width: '100%', display: showQR && profile.upiId ? 'flex' : 'none' }}>
                        <Paper 
                          elevation={0} 
                          variant="outlined"
                          sx={{ 
                            p: 3, 
                            width: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            borderRadius: 2,
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.1)',
                            bgcolor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.05)' 
                              : 'rgba(0,0,0,0.02)',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Payment QR Code
                          </Typography>
                          <Box
                            component="img"
                            src={getUpiQrUrl()}
                            alt="UPI QR Code"
                            sx={{ 
                              width: 180, 
                              height: 180, 
                              my: 2,
                              p: 2,
                              bgcolor: 'white',
                              borderRadius: 1,
                              boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Scan with any UPI app to pay
                          </Typography>
                        </Paper>
                      </Box>
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  {/* Notifications Settings */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Notification Settings
                    </Typography>
                    
                    <Paper 
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        borderColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.enableWhatsApp}
                            onChange={handleChange}
                            name="enableWhatsApp"
                            color="success"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
                            <Typography fontWeight={500}>
                              Enable WhatsApp Notifications
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4.5 }}>
                        Send automatic receipts and payment reminders via WhatsApp to your customers
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {/* Privacy Settings */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Privacy Settings
                    </Typography>
                    
                    <Paper 
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        borderColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={true}
                            color="info"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LockIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography fontWeight={500}>
                              Enhanced Privacy Protection
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4.5 }}>
                        Enable additional privacy features to protect your customer data
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disableElevation
                        sx={{
                          borderRadius: 1.5,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage; 