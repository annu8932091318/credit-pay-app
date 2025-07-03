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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  WhatsApp as WhatsAppIcon,
  Receipt as ReceiptIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

import { fetchCustomer, fetchSales, createNotification } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          edge="start" 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Customer Details</Typography>
      </Box>
      
      {/* Customer Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">{customer.name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {customer.phone}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <Typography variant="body2" color="text.secondary">
              Total Outstanding
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: customer.totalOwed > 0 ? 'error.main' : 'success.main',
                mb: 2
              }}
            >
              {formatCurrency(customer.totalOwed || 0)}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleSendReminder}
              disabled={sendingReminder || customer.totalOwed <= 0}
              fullWidth
            >
              {sendingReminder ? 'Sending...' : 'Send Payment Reminder'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions List */}
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      
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