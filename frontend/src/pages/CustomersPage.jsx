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
  Avatar,
  Tooltip,
  Badge,
  Fade,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
  SortByAlpha as SortIcon,
  WhatsApp as WhatsAppIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

import { fetchCustomers, createCustomer, fetchSales, sendOTP, verifyOTP } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import commonStyles from '../styles/commonStyles';

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
        let customersData =
          Array.isArray(customersResponse.data?.data)
            ? customersResponse.data.data
            : Array.isArray(customersResponse.data?.data?.data)
              ? customersResponse.data.data.data
              : Array.isArray(customersResponse.data)
                ? customersResponse.data
                : [];

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
  }, []);
  
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '0px 2px 3px rgba(0,0,0,0.2)' }}>
              Customers
            </Typography>
            <Typography variant="subtitle1">
              Manage your customer database and view credit details
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: 'white',
              color: theme => theme.palette.primary.main,
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
              boxShadow: theme => commonStyles.customShadows.button(theme.palette.mode === 'dark')
            }}
          >
            Add New Customer
          </Button>
        </Box>
      </Paper>
      
      {/* Search and Filters Box */}
      <Paper elevation={2} sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name or phone number"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Fade in={true}>
                        <Badge color="error" variant="dot">
                          <FilterListIcon fontSize="small" />
                        </Badge>
                      </Fade>
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(0,0,0,0.1)'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Sort by name" arrow>
                <Button 
                  variant="outlined"
                  startIcon={<SortIcon />}
                  size="medium"
                  sx={{ 
                    borderRadius: 1.5,
                    borderColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(0,0,0,0.1)'
                  }}
                >
                  Sort
                </Button>
              </Tooltip>
              
              <Tooltip title="Filter results" arrow>
                <Button 
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  size="medium"
                  sx={{ 
                    borderRadius: 1.5,
                    borderColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(0,0,0,0.1)'
                  }}
                >
                  Filter
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Customers Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredCustomers.length} customers found
        </Typography>
        <Chip 
          icon={<InfoIcon fontSize="small" />} 
          label="Click on a customer to view details" 
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            fontSize: '0.75rem',
            borderColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.15)' 
              : 'rgba(0,0,0,0.1)'
          }}
        />
      </Box>
      
      {/* Customers List */}
      {loading ? (
        <LoadingSpinner open={true} />
      ) : (
        <>
          {isDesktop ? (
            // Table view for desktop
            <Paper elevation={2} sx={{
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)' 
                    }}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>Name</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>Phone</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>Total Owed</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>Last Transaction</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow 
                          key={customer._id} 
                          hover 
                          onClick={() => navigate(`/customers/${customer._id}`)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.05)' 
                                : 'rgba(0,0,0,0.02)'
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 2, 
                                  bgcolor: theme => theme.palette.primary.main,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {customer.name.charAt(0)}
                              </Avatar>
                              <Typography fontWeight={500}>{customer.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WhatsAppIcon 
                                sx={{ 
                                  mr: 1, 
                                  fontSize: 16, 
                                  color: '#25D366' 
                                }} 
                              />
                              {customer.phone}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatCurrency(customer.totalOwed || 0)}
                              variant={customer.totalOwed > 0 ? "filled" : "outlined"}
                              color={customer.totalOwed > 0 ? "primary" : "default"}
                              size="small"
                              icon={<CreditCardIcon />}
                              sx={{
                                ...commonStyles.statusChip,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(customer.lastTransactionDate)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit customer" arrow>
                              <IconButton
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/customers/${customer._id}`);
                                }}
                                sx={{ 
                                  bgcolor: theme => theme.palette.mode === 'dark' 
                                    ? 'rgba(25, 118, 210, 0.12)' 
                                    : 'rgba(25, 118, 210, 0.08)',
                                  mr: 1
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete customer" arrow>
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomer(customer._id);
                                }}
                                sx={{ 
                                  bgcolor: theme => theme.palette.mode === 'dark' 
                                    ? 'rgba(211, 47, 47, 0.12)' 
                                    : 'rgba(211, 47, 47, 0.08)'
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No customers found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try adjusting your search or add a new customer
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            // Card view for mobile
            <Box>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Card 
                    key={customer._id} 
                    elevation={2} 
                    sx={{
                      mb: 2, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark'),
                      ...commonStyles.cardWithHover
                    }}
                    onClick={() => navigate(`/customers/${customer._id}`)}
                  >
                    <Box sx={{ 
                      height: 8, 
                      bgcolor: customer.totalOwed > 0 
                        ? theme => theme.palette.primary.main 
                        : 'success.main'
                    }} />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2, 
                            bgcolor: theme => theme.palette.primary.main
                          }}
                        >
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="div" fontWeight={600}>
                            {customer.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WhatsAppIcon sx={{ fontSize: 16, mr: 0.5, color: '#25D366' }} />
                            <Typography variant="body2" color="text.secondary">
                              {customer.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Owed
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            color={customer.totalOwed > 0 ? 'primary.main' : 'success.main'}
                          >
                            {formatCurrency(customer.totalOwed || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Last Transaction
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDate(customer.lastTransactionDate)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ px: 2, py: 1 }}>
                      <Button 
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${customer._id}`);
                        }}
                        startIcon={<EditIcon />}
                      >
                        Details
                      </Button>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer._id);
                        }}
                        sx={{ 
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(211, 47, 47, 0.12)' 
                            : 'rgba(211, 47, 47, 0.08)'
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
                }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No customers found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try adjusting your search or add a new customer
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenAddDialog(true)}
                  >
                    Add New Customer
                  </Button>
                </Paper>
              )}
            </Box>
          )}
        </>
      )}
      
      {/* Add Customer Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => {
          setOpenAddDialog(false);
          setOtpSent(false);
          setOtp('');
          setOtpError('');
          setFormErrors({});
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme => commonStyles.customShadows.dialog(theme.palette.mode === 'dark'),
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <Box sx={{ 
          background: theme => theme.palette.mode === 'dark' 
            ? commonStyles.gradients.primaryDark
            : commonStyles.gradients.primary,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: 'white'
        }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 42, 
              height: 42 
            }}
          >
            {otpSent ? <PhoneIcon /> : <PersonAddIcon />}
          </Avatar>
          <Box>
            <DialogTitle sx={{ p: 0, color: 'inherit' }}>
              {otpSent ? 'Verify Phone Number' : 'Add New Customer'}
            </DialogTitle>
            <Typography variant="body2">
              {otpSent 
                ? 'Enter the OTP sent to your phone' 
                : 'Add a new customer to your database'}
            </Typography>
          </Box>
        </Box>
        
        <DialogContent sx={{ mt: 2 }}>
          <TextField
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
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
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
            helperText={formErrors.phone || "Enter a 10-digit mobile number"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color={otpSent ? "disabled" : "primary"} />
                </InputAdornment>
              ),
              endAdornment: !otpSent && newCustomer.phone.length === 10 && (
                <InputAdornment position="end">
                  <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                </InputAdornment>
              ),
            }}
            inputProps={{
              maxLength: 10,
            }}
            disabled={otpSent}
            sx={{ 
              mb: otpSent ? 2 : 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
          
          {otpSent && (
            <Fade in={otpSent}>
              <Box>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(0,0,0,0.2)' 
                      : 'rgba(0,0,0,0.02)',
                    borderRadius: 1.5
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    A 4-digit OTP has been sent to your phone number:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {newCustomer.phone}
                  </Typography>
                </Paper>
                
                <TextField
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
                  helperText={otpError}
                  inputProps={{
                    maxLength: 4,
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              </Box>
            </Fade>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => {
              setOpenAddDialog(false);
              setOtpSent(false);
              setOtp('');
              setOtpError('');
              setFormErrors({});
            }}
            variant="outlined"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              mr: 1
            }}
          >
            Cancel
          </Button>
          
          {otpSent && (
            <Button 
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setOtpError('');
              }}
              variant="outlined"
              color="info"
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                mr: 1
              }}
            >
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleAddCustomer} 
            variant="contained" 
            disabled={verifying}
            disableElevation
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              px: 3
            }}
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