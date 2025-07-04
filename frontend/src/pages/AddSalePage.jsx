import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Notes as NotesIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import { fetchCustomers, createSale } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import commonStyles from '../styles/commonStyles';

function AddSalePage() {
  const navigate = useNavigate();
  const theme = React.useContext('ThemeContext');
  const { showNotification } = useNotification();
  
  // States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // Load customers data
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetchCustomers();
        setCustomers(response.data || []);
      } catch (error) {
        console.error('Failed to load customers:', error);
        showNotification('Failed to load customers data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, [showNotification]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    
    if (!selectedCustomer) {
      errors.customer = 'Please select a customer';
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSaving(true);
    
    try {
      // Create sale
      const saleData = {
        customer: selectedCustomer._id,
        amount: parseFloat(amount),
        status: paymentStatus,
        notes: notes.trim(),
        date: new Date().toISOString(),
      };
      
      await createSale(saleData);
      
      // Show success state
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setSelectedCustomer(null);
        setAmount('');
        setPaymentStatus('Pending');
        setNotes('');
        setFormErrors({});
        setShowSuccess(false);
      }, 3000);
      
      showNotification('Sale added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add sale:', error);
      showNotification('Failed to add sale. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle amount change with validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      
      if (formErrors.amount) {
        setFormErrors(prev => ({ ...prev, amount: undefined }));
      }
    }
  };

  return (
    <Box>
      {/* Page Header with Gradient Background */}
      <Paper 
        elevation={0} 
        sx={{
          background: theme => theme.palette.mode === 'dark' 
            ? commonStyles.gradients.successDark
            : commonStyles.gradients.success,
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
            Add New Sale
          </Typography>
          <Typography variant="subtitle1">
            Record a new transaction or credit for a customer
          </Typography>
        </Box>
      </Paper>
      
      {loading ? (
        <LoadingSpinner open={true} />
      ) : showSuccess ? (
        <Card 
          elevation={3} 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'success.main', 
                mx: 'auto',
                mb: 2
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Sale Added Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The transaction has been recorded and the customer's account has been updated.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 1.5 }}
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCustomer(null);
                setAmount('');
                setPaymentStatus('Pending');
                setNotes('');
                setFormErrors({});
                setShowSuccess(false);
              }}
              disableElevation
              sx={{ borderRadius: 1.5 }}
            >
              Add Another Sale
            </Button>
          </Box>
        </Card>
      ) : (
        <Card 
          elevation={3} 
          sx={{ 
            maxWidth: 800, 
            mx: 'auto',
            borderRadius: 2,
            boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Sale Information
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Customer Selection */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.name} (${option.phone})`}
                    value={selectedCustomer}
                    onChange={(event, newValue) => {
                      setSelectedCustomer(newValue);
                      if (formErrors.customer) {
                        setFormErrors(prev => ({ ...prev, customer: undefined }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Customer"
                        variant="outlined"
                        error={!!formErrors.customer}
                        helperText={formErrors.customer}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <PersonIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: 'primary.main', 
                            fontSize: '0.8rem',
                            mr: 1
                          }}
                        >
                          {option.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.phone}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText="No customers found"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }}
                  />
                  <Alert severity="info" sx={{ mt: 1, borderRadius: 1.5 }}>
                    <Typography variant="body2">
                      Can't find the customer? <Button 
                        size="small" 
                        onClick={() => navigate('/customers')}
                        sx={{ fontWeight: 'bold', py: 0 }}
                      >
                        Add a new customer
                      </Button>
                    </Typography>
                  </Alert>
                </Grid>
                
                {/* Amount */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    value={amount}
                    onChange={handleAmountChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
                    placeholder="0.00"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }}
                  />
                </Grid>
                
                {/* Date - Disabled, uses current date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    value={new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Today's date will be used"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }}
                  />
                </Grid>
                
                {/* Payment Status */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2,
                      borderRadius: 1.5,
                      borderColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Payment Status
                    </Typography>
                    
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        name="paymentStatus"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <FormControlLabel 
                          value="Paid" 
                          control={
                            <Radio color="success" />
                          } 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography fontWeight={500}>Paid</Typography>
                            </Box>
                          }
                          sx={{ mr: 4 }}
                        />
                        <FormControlLabel 
                          value="Pending" 
                          control={
                            <Radio color="warning" />
                          } 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MoneyIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography fontWeight={500}>Credit (Pay Later)</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Paper>
                </Grid>
                
                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional information about this sale"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <NotesIcon color="action" />
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
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate(-1)}
                      sx={{ borderRadius: 1.5 }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={saving}
                      disableElevation
                      sx={{ 
                        borderRadius: 1.5, 
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Sale'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default AddSalePage;