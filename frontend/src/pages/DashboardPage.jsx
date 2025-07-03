import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

import { fetchSales, fetchCustomers } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function DashboardPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // States
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get sales data
        const salesResponse = await fetchSales();
        const salesData = salesResponse.data;
        
        // Get customer data
        const customersResponse = await fetchCustomers();
        const customersData = customersResponse.data;
        
        // Calculate totals
        let outstanding = 0;
        let paid = 0;
        
        salesData.forEach(sale => {
          if (sale.status === 'Pending') {
            outstanding += sale.amount;
          } else {
            paid += sale.amount;
          }
        });
        
        // Set state with calculated values
        setTotalOutstanding(outstanding);
        setTotalPaid(paid);
        
        // Get recent transactions
        const recentSales = salesData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(sale => {
            // Find customer name
            const customer = customersData.find(c => c._id === (sale.customer || sale.customerId)) || {};
            return {
              ...sale,
              customerName: customer.name || 'Unknown Customer'
            };
          });
        
        setRecentTransactions(recentSales);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [showNotification]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Outstanding Card */}
        <Grid item xs={12} sm={6}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            {loading ? (
              <CardContent sx={{ height: '100%' }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={60} />
              </CardContent>
            ) : (
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Outstanding Amount</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {formatCurrency(totalOutstanding)}
                </Typography>
              </CardContent>
            )}
          </Card>
        </Grid>
        
        {/* Total Paid Card */}
        <Grid item xs={12} sm={6}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            {loading ? (
              <CardContent sx={{ height: '100%' }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={60} />
              </CardContent>
            ) : (
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingDownIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Paid Amount</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {formatCurrency(totalPaid)}
                </Typography>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions Section */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-sale')}
            sx={{ py: 2 }}
          >
            Add New Sale
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            color="primary"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/customers')}
            sx={{ py: 2 }}
          >
            Add New Customer
          </Button>
        </Grid>
      </Grid>
      
      {/* Recent Transactions Section */}
      <Typography variant="h5" gutterBottom>
        Recent Transactions
      </Typography>
      
      <Paper elevation={2}>
        {loading ? (
          <List sx={{ width: '100%' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <React.Fragment key={item}>
                <ListItem>
                  <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={<Skeleton variant="text" width="40%" />}
                  />
                  <ListItemSecondaryAction>
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </ListItemSecondaryAction>
                </ListItem>
                {item !== 5 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <List sx={{ width: '100%' }}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction._id || index}>
                  <ListItem 
                    button
                    onClick={() => navigate(`/customers/${transaction.customer || transaction.customerId}`)}
                  >
                    <ListItemText
                      primary={transaction.customerName}
                      secondary={`${formatCurrency(transaction.amount)} • ${formatDate(transaction.date)}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'Pending' ? 'warning' : 'success'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No transactions found"
                  secondary="Add a new sale to get started"
                />
              </ListItem>
            )}
          </List>
        )}
      </Paper>
      
      <LoadingSpinner open={loading} fullScreen={false} />
    </Box>
  );
}

export default DashboardPage;