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
} from '@mui/material';

import { fetchCustomers, createSale } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function AddSalePage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Pending');
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetchCustomers();
        setCustomers(response.data);
      } catch (error) {
        console.error('Failed to load customers:', error);
        showNotification('Failed to load customers', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, [showNotification]);
  
  // Handle amount input change - ensure it's a valid number
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (value === '' || /^[0-9]+(\.[0-9]{0,2})?$/.test(value)) {
      setAmount(value);
      
      // Clear error if it exists
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: null }));
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create sale object
      const saleData = {
        customer: selectedCustomer._id, // Using 'customer' field to match backend model
        amount: parseFloat(amount),
        notes: notes.trim() || null,
        status,
        date: new Date().toISOString(),
      };
      
      // Call API to create sale
      await createSale(saleData);
      
      // Mock WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success notification and navigate back to dashboard
      showNotification('Sale logged and message sent to customer', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create sale:', error);
      showNotification('Failed to create sale', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Add New Sale
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.name} (${option.phone})`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    error={!!errors.customer}
                    helperText={errors.customer}
                    required
                  />
                )}
                value={selectedCustomer}
                onChange={(event, newValue) => {
                  setSelectedCustomer(newValue);
                  // Clear error if it exists
                  if (errors.customer) {
                    setErrors(prev => ({ ...prev, customer: null }));
                  }
                }}
                loading={loading}
                fullWidth
              />
            </Grid>
            
            {/* Amount Input */}
            <Grid item xs={12}>
              <TextField
                label="Sale Amount"
                variant="outlined"
                fullWidth
                required
                value={amount}
                onChange={handleAmountChange}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                inputProps={{ inputMode: 'decimal' }}
              />
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this sale..."
              />
            </Grid>
            
            {/* Payment Status */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Status
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <FormControlLabel 
                    value="Paid" 
                    control={<Radio />} 
                    label="Paid" 
                  />
                  <FormControlLabel 
                    value="Pending" 
                    control={<Radio />} 
                    label="Pending" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !selectedCustomer || !amount}
                >
                  {status === 'Paid' ? 'Log Paid Sale' : 'Log Credit Sale'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <LoadingSpinner open={submitting} fullScreen={true} message="Saving sale..." />
    </Box>
  );
}

export default AddSalePage; 