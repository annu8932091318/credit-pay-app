import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  WhatsApp as WhatsAppIcon,
  Receipt as ReceiptIcon,
  Share as ShareIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import { fetchCustomer, fetchSales, createNotification } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  
  // States
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Load customer and transaction data
  useEffect(() => {
    const loadCustomerData = async () => {
      setLoading(true);
      try {
        // Get customer details
        const customerResponse = await fetchCustomer(id);
        setCustomer(customerResponse.data);
        
        // Get customer's transactions
        const salesResponse = await fetchSales();
        const customerSales = salesResponse.data
          .filter(sale => (sale.customer === id || sale.customerId === id))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(customerSales);
        
        // Calculate total owed
        const totalOwed = customerSales
          .filter(sale => sale.status === 'Pending')
          .reduce((sum, sale) => sum + sale.amount, 0);
        
        setCustomer(prev => ({
          ...prev,
          totalOwed,
        }));
      } catch (error) {
        console.error('Failed to load customer data:', error);
        showNotification('Failed to load customer data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadCustomerData();
    }
  }, [id, showNotification]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Handle sending payment reminder via WhatsApp
  const handleSendReminder = async () => {
    if (!customer || !customer.totalOwed) return;
    
    setSendingReminder(true);
    try {
      // Create notification in database
      await createNotification({
        customer: customer._id,
        type: 'PAYMENT_REMINDER',
        message: `Reminder: You have an outstanding balance of ${formatCurrency(customer.totalOwed)}`,
        status: 'SENT',
        channel: 'whatsapp',
      });
      
      // Mock WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Payment reminder sent successfully', 'success');
    } catch (error) {
      console.error('Failed to send reminder:', error);
      showNotification('Failed to send payment reminder', 'error');
    } finally {
      setSendingReminder(false);
    }
  };
  
  // Handle viewing transaction receipt
  const handleViewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenReceiptDialog(true);
  };
  
  // Handle resending receipt
  const handleResendReceipt = async () => {
    if (!selectedTransaction) return;
    
    try {
      // Create notification in database
      await createNotification({
        customer: customer._id,
        type: 'RECEIPT',
        message: `Receipt for your purchase of ${formatCurrency(selectedTransaction.amount)} on ${formatDate(selectedTransaction.date)}`,
        status: 'SENT',
        channel: 'whatsapp',
      });
      
      // Mock WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Receipt resent successfully', 'success');
      setOpenReceiptDialog(false);
    } catch (error) {
      console.error('Failed to resend receipt:', error);
      showNotification('Failed to resend receipt', 'error');
    }
  };

  if (loading || !customer) {
    return <LoadingSpinner open={true} fullScreen={true} />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2, 
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Customer Profile
            </Typography>
            <Typography variant="body1" color="textSecondary">
              View and manage customer details and transactions
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Customer Summary */}
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          boxShadow: theme.shadows[3],
          mb: 4
        }}
      >
        <Box
          sx={{
            p: 3,
            background: theme.palette.mode === 'light'
              ? `linear-gradient(120deg, ${alpha(theme.palette.info.light, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`
              : `linear-gradient(120deg, ${alpha(theme.palette.info.dark, 0.2)}, ${theme.palette.background.paper})`,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
              width: 60,
              height: 60,
              mr: 3,
              fontSize: '2rem',
              fontWeight: 700
            }}
          >
            {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {customer.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <IconButton 
                size="small" 
                sx={{ 
                  mr: 1, 
                  color: theme.palette.success.main, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                  } 
                }}
                onClick={() => window.open(`https://wa.me/${customer.phone}`, '_blank')}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
              <Typography variant="body1" color="textSecondary">
                {customer.phone}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  background: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Customer Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1">
                      {customer._id ? customer._id.substring(0, 8).toUpperCase() : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Joined On
                    </Typography>
                    <Typography variant="body1">
                      {customer.createdAt ? formatDate(customer.createdAt) : 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="body1">
                      {transactions.length}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  background: customer.totalOwed > 0 
                    ? alpha(theme.palette.error.main, 0.05)
                    : alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${customer.totalOwed > 0 
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  color={customer.totalOwed > 0 ? 'error.main' : 'success.main'}
                  gutterBottom
                >
                  Outstanding Balance
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{ 
                    color: customer.totalOwed > 0 ? 'error.main' : 'success.main',
                    mt: 2
                  }}
                >
                  {formatCurrency(customer.totalOwed || 0)}
                </Typography>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleSendReminder}
                  disabled={sendingReminder || customer.totalOwed <= 0}
                  fullWidth
                  sx={{ 
                    mt: 3,
                    borderRadius: 8,
                    py: 1.5,
                    boxShadow: theme.shadows[4],
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6,
                      background: theme.palette.action.disabledBackground
                    }
                  }}
                >
                  {sendingReminder ? 'Sending...' : 'Send Payment Reminder'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Transactions List */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main
            }
          }}
        >
          Transaction History
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-sale', { state: { customerId: customer._id } })}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            borderWidth: '1.5px'
          }}
        >
          Add Transaction
        </Button>
      </Box>
      
      <Paper elevation={1}>
        {transactions.length > 0 ? (
          <List>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction._id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.date)}
                        </Typography>
                        {transaction.notes && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Note: {transaction.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={transaction.status}
                      color={transaction.status === 'Pending' ? 'warning' : 'success'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleViewReceipt(transaction)}
                    >
                      <ReceiptIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No transactions found for this customer
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Receipt Dialog */}
      <Dialog
        open={openReceiptDialog}
        onClose={() => setOpenReceiptDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Receipt</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {formatCurrency(selectedTransaction.amount)}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedTransaction.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedTransaction.status}
                    color={selectedTransaction.status === 'Pending' ? 'warning' : 'success'}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">
                    {customer.name} ({customer.phone})
                  </Typography>
                </Grid>
                
                {selectedTransaction.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedTransaction.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiptDialog(false)}>Close</Button>
          <Button 
            startIcon={<ShareIcon />} 
            variant="contained" 
            onClick={handleResendReceipt}
          >
            Resend Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomerDetailPage; 