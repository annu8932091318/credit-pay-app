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
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccountBalanceWallet as WalletIcon,
  Save as SaveIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';

import { fetchShopkeeper, updateShopkeeper } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

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
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
                      <PersonIcon />
                    </InputAdornment>
                  ),
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
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Contact support to update your phone number"
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
                      <WalletIcon />
                    </InputAdornment>
                  ),
                  endAdornment: profile.upiId && (
                    <InputAdornment position="end">
                      <Button
                        onClick={() => setShowQR(!showQR)}
                        startIcon={<QrCodeIcon />}
                        size="small"
                      >
                        {showQR ? 'Hide QR' : 'Show QR'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
                helperText="Your UPI ID for receiving payments"
              />
            </Grid>
            
            {/* UPI QR Code */}
            {showQR && profile.upiId && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={getUpiQrUrl()}
                  alt="UPI QR Code"
                  sx={{ width: 200, height: 200, my: 2 }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* WhatsApp Notifications Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.enableWhatsApp}
                    onChange={handleChange}
                    name="enableWhatsApp"
                    color="primary"
                  />
                }
                label="Enable WhatsApp Notifications"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Send automatic receipts and payment reminders via WhatsApp
              </Typography>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default ProfilePage; 