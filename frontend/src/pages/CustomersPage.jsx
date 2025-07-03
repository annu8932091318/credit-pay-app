import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import { fetchCustomers, createCustomer, fetchSales, sendOTP, verifyOTP } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

function CustomersPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showNotification } = useNotification();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // States
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Load customers data
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        // Get customers
        const customersResponse = await fetchCustomers();
        // Extract data from the response
        console.log("Customers response:", customersResponse);
        let customersData = customersResponse.data.data || customersResponse.data;
        
        // Get sales data to calculate total owed
        const salesResponse = await fetchSales();
        console.log("Sales response:", salesResponse);
        const salesData = salesResponse.data.data || salesResponse.data;
        
        // Calculate total owed and last transaction for each customer
        console.log("Processing customers data:", customersData);
        customersData = customersData.map(customer => {
          console.log("Processing customer:", customer);
          const customerSales = salesData.filter(sale => 
            (sale.customer === customer._id) || 
            (sale.customerId === customer._id) || 
            (sale.customer && sale.customer._id === customer._id)
          );
          
          console.log(`Found ${customerSales.length} sales for customer ${customer.name}`);
          
          // Calculate total owed (pending sales)
          const totalOwed = customerSales
            .filter(sale => sale.status === 'Pending')
            .reduce((sum, sale) => sum + sale.amount, 0);
          
          // Find last transaction date
          let lastTransactionDate = null;
          if (customerSales.length > 0) {
            lastTransactionDate = new Date(
              Math.max(...customerSales.map(sale => new Date(sale.date)))
            );
          }
          
          return {
            ...customer,
            totalOwed,
            lastTransactionDate,
          };
        });
        
        // Sort by most recent transaction
        customersData.sort((a, b) => {
          if (!a.lastTransactionDate) return 1;
          if (!b.lastTransactionDate) return -1;
          return b.lastTransactionDate - a.lastTransactionDate;
        });
        
        console.log("Final processed customers data:", customersData);
        
        // Ensure all required properties exist
        customersData = customersData.map(customer => ({
          ...customer,
          _id: customer._id || customer.id, // Handle both _id and id
          totalOwed: customer.totalOwed || 0,
          lastTransactionDate: customer.lastTransactionDate || null,
        }));
        
        setCustomers(customersData);
        setFilteredCustomers(customersData);
      } catch (error) {
        console.error('Failed to load customers data:', error);
        showNotification('Failed to load customers data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, [showNotification]);
  
  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercaseSearch) ||
      customer.phone.includes(searchTerm)
    );
    
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'No transactions yet';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Handle new customer input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate phone number
  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };
  
  // Handle send OTP
  const handleSendOTP = async () => {
    // Validate phone
    if (!validatePhone(newCustomer.phone)) {
      setFormErrors({
        ...formErrors,
        phone: 'Enter a valid 10-digit phone number'
      });
      return;
    }
    
    setVerifying(true);
    
    try {
      // Send OTP
      await sendOTP(newCustomer.phone);
      
      setOtpSent(true);
      showNotification('OTP sent to your phone number', 'success');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      showNotification('Failed to send OTP. Please try again.', 'error');
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP');
      return;
    }
    
    setVerifying(true);
    
    try {
      // Verify OTP
      await verifyOTP(newCustomer.phone, otp);
      
      // If verification successful, proceed with customer creation
      await handleAddCustomerAfterVerification();
    } catch (error) {
      console.error('OTP verification failed:', error);
      setOtpError('Invalid OTP. Please try again.');
      showNotification('OTP verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle add customer form submission
  const handleAddCustomerAfterVerification = async () => {
    // Validate form
    const errors = {};
    
    if (!newCustomer.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Create customer
      const response = await createCustomer(newCustomer);
      const createdCustomer = response.data;
      
      // Add to state with default values
      const customerWithDefaults = {
        ...createdCustomer,
        totalOwed: 0,
        lastTransactionDate: null,
      };
      
      setCustomers(prev => [customerWithDefaults, ...prev]);
      setFilteredCustomers(prev => [customerWithDefaults, ...prev]);
      
      showNotification('Customer added successfully!', 'success');
      setOpenAddDialog(false);
      
      // Reset form
      setNewCustomer({
        name: '',
        phone: '',
      });
      setOtpSent(false);
      setOtp('');
      
    } catch (error) {
      console.error('Failed to add customer:', error);
      showNotification('Failed to add customer', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle add customer (initial step)
  const handleAddCustomer = () => {
    if (!otpSent) {
      handleSendOTP();
    } else {
      handleVerifyOTP();
    }
  };
  
  // Handle customer deletion
  const handleDeleteCustomer = (id) => {
    setSelectedCustomerId(id);
    setOpenConfirmDialog(true);
  };
  
  // Confirm customer deletion
  const confirmDeleteCustomer = async () => {
    // In a real app, this would make an API call to delete the customer
    // For this demo, we'll just remove it from state
    
    try {
      setCustomers(prev => prev.filter(customer => customer._id !== selectedCustomerId));
      setFilteredCustomers(prev => prev.filter(customer => customer._id !== selectedCustomerId));
      showNotification('Customer deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete customer', 'error');
    } finally {
      setOpenConfirmDialog(false);
      setSelectedCustomerId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add New Customer
        </Button>
      </Box>
      
      {/* Search Box */}
      <TextField
        fullWidth
        placeholder="Search by name or phone number"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* Customers List */}
      {loading ? (
        <LoadingSpinner open={true} />
      ) : (
        <>
          {isDesktop ? (
            // Table view for desktop
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Total Owed</TableCell>
                    <TableCell>Last Transaction</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer._id} hover>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          {formatCurrency(customer.totalOwed || 0)}
                        </TableCell>
                        <TableCell>
                          {formatDate(customer.lastTransactionDate)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/customers/${customer._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No customers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Card view for mobile
            <Grid container spacing={2}>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Grid item xs={12} key={customer._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {customer.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Owed
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(customer.totalOwed || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Last Transaction
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(customer.lastTransactionDate)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/customers/${customer._id}`)}
                        >
                          View Details
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography>No customers found</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </>
      )}
      
      {/* Add Customer Dialog */}
      <Dialog open={openAddDialog} onClose={() => {
        setOpenAddDialog(false);
        setOtpSent(false);
        setOtp('');
        setOtpError('');
        setFormErrors({});
      }}>
        <DialogTitle>{otpSent ? 'Verify Phone Number' : 'Add New Customer'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus={!otpSent}
            margin="dense"
            name="name"
            label="Customer Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={newCustomer.phone}
            onChange={handleInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
            inputProps={{
              maxLength: 10,
            }}
            disabled={otpSent}
          />
          
          {otpSent && (
            <TextField
              autoFocus
              margin="dense"
              label="Enter OTP"
              type="text"
              fullWidth
              variant="outlined"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (otpError) setOtpError('');
              }}
              error={!!otpError}
              helperText={otpError || "A 4-digit OTP has been sent to your phone"}
              inputProps={{
                maxLength: 4,
              }}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAddDialog(false);
            setOtpSent(false);
            setOtp('');
            setOtpError('');
            setFormErrors({});
          }}>Cancel</Button>
          
          {otpSent && (
            <Button 
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setOtpError('');
              }}
            >
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleAddCustomer} 
            variant="contained" 
            disabled={verifying}
          >
            {verifying ? 'Processing...' : otpSent ? 'Verify OTP' : 'Send OTP'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setOpenConfirmDialog(false)}
        severity="error"
      />
    </Box>
  );
}

export default CustomersPage; 