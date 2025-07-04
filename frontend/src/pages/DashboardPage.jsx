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
  Avatar,
  IconButton,
  alpha,
  useTheme,
  Stack,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  ShowChart as ShowChartIcon,
  ChevronRight as ChevronRightIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptLongIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

import { fetchSales, fetchCustomers } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { commonStyles } from '../styles/commonStyles';

function DashboardPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  
  // States
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
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

  // Load dashboard data - with optimized dependencies
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Use Promise.all to fetch data in parallel
        const [salesResponse, customersResponse] = await Promise.all([
          fetchSales(),
          fetchCustomers()
        ]);
        
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        const salesData = salesResponse.data;
        const customersData = customersResponse.data;
        
        // Calculate totals
        let outstanding = 0;
        let paid = 0;
        
        salesData.forEach(sale => {
          // Handle case insensitively to be more robust
          if (sale.status && (sale.status.toUpperCase() === 'PENDING' || sale.status.toUpperCase() === 'OVERDUE')) {
            outstanding += sale.amount;
          } else {
            paid += sale.amount;
          }
        });
        
        // Set state with calculated values
        setTotalOutstanding(outstanding);
        setTotalPaid(paid);
        setCustomerCount(customersData.length);
        
        // Get recent transactions
        const recentSales = salesData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(sale => {
            // Find customer name
            const customer = customersData.find(c => c._id === (sale.customer || sale.customerId)) || {};
            return {
              ...sale,
              customerName: customer.name || 'Unknown Customer',
              customerPhone: customer.phone || '',
              customerInitial: customer.name ? customer.name.charAt(0).toUpperCase() : '?'
            };
          });
        
        setRecentTransactions(recentSales);
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Failed to load dashboard data:', error);
        let errorMessage = 'Failed to load dashboard data';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          errorMessage += `: ${error.response.data.error || error.response.statusText}`;
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += ': No response from server';
          console.error('Request:', error.request);
        } else {
          // Something happened in setting up the request
          errorMessage += `: ${error.message}`;
        }
        
        if (isMounted) {
          showNotification(errorMessage, 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadDashboardData();
    
    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - load only once when component mounts

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Business Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back! Here's your business at a glance.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DateRangeIcon />}
            sx={{ 
              borderRadius: 8,
              borderWidth: '1.5px',
              textTransform: 'none'
            }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Button>
          <IconButton size="small" sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Summary Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Outstanding Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.9)}, ${alpha(theme.palette.error.main, 0.8)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0.8)}, ${alpha(theme.palette.error.main, 0.7)})`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right top',
                opacity: 0.2,
              }}
            />
            
            {loading ? (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#fff', 0.2) }} />
                <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: alpha('#fff', 0.2) }} />
              </CardContent>
            ) : (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="500" color="white">
                    Outstanding Amount
                  </Typography>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white'
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    my: 1.5, 
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {formatCurrency(totalOutstanding)}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    icon={<ArrowUpwardIcon fontSize="small" />}
                    label="To Collect"
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
        
        {/* Total Paid Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.9)}, ${alpha(theme.palette.success.main, 0.8)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.8)}, ${alpha(theme.palette.success.main, 0.7)})`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right top',
                opacity: 0.2,
              }}
            />
            
            {loading ? (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#fff', 0.2) }} />
                <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: alpha('#fff', 0.2) }} />
              </CardContent>
            ) : (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="500" color="white">
                    Total Paid Amount
                  </Typography>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white'
                    }}
                  >
                    <TrendingDownIcon />
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    my: 1.5, 
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {formatCurrency(totalPaid)}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    icon={<ArrowDownwardIcon fontSize="small" />}
                    label="Collected"
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
        
        {/* Customer Count Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.9)}, ${alpha(theme.palette.info.main, 0.8)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.8)}, ${alpha(theme.palette.info.main, 0.7)})`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right top',
                opacity: 0.2,
              }}
            />
            
            {loading ? (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#fff', 0.2) }} />
                <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: alpha('#fff', 0.2) }} />
              </CardContent>
            ) : (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="500" color="white">
                    Total Customers
                  </Typography>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white'
                    }}
                  >
                    <PeopleIcon />
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    my: 1.5, 
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {customerCount}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    icon={<PersonIcon fontSize="small" />}
                    label="Active Accounts"
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
        
        {/* Payment Ratio Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.9)}, ${alpha(theme.palette.secondary.main, 0.8)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.8)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right top',
                opacity: 0.2,
              }}
            />
            
            {loading ? (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#fff', 0.2) }} />
                <Skeleton variant="text" width="40%" height={60} sx={{ bgcolor: alpha('#fff', 0.2) }} />
              </CardContent>
            ) : (
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="500" color="white">
                    Payment Ratio
                  </Typography>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white'
                    }}
                  >
                    <ShowChartIcon />
                  </Avatar>
                </Box>
                
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    my: 1, 
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {totalPaid + totalOutstanding > 0
                    ? `${Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)}%`
                    : '0%'}
                </Typography>
                
                <Box sx={{ mt: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={totalPaid + totalOutstanding > 0
                      ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)
                      : 0}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      backgroundColor: alpha('#fff', 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: '#fff'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2.5, 
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
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-sale')}
              sx={{ 
                py: 2,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              Add New Sale
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="primary"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/customers')}
              sx={{ 
                py: 2,
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            >
              Add New Customer
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Recent Transactions Section */}
      <Box>
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
            Recent Transactions
          </Typography>
          
          <Button
            variant="text"
            endIcon={<ChevronRightIcon />}
            onClick={() => navigate('/sales-history')}
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            View All
          </Button>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            boxShadow: theme.shadows[2]
          }}
        >
          {loading ? (
            <List sx={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <React.Fragment key={item}>
                  <ListItem sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      <Skeleton variant="rectangular" width={80} height={32} />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {item !== 5 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <List disablePadding sx={{ width: '100%' }}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction._id || index}>
                    <ListItem 
                      button
                      onClick={() => navigate(`/customers/${transaction.customer || transaction.customerId}`)}
                      sx={{ 
                        py: 1.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: transaction.status === 'Pending' 
                            ? alpha(theme.palette.warning.main, 0.2) 
                            : alpha(theme.palette.success.main, 0.2),
                          color: transaction.status === 'Pending' 
                            ? theme.palette.warning.main 
                            : theme.palette.success.main
                        }}
                      >
                        {transaction.customerInitial}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {transaction.customerName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <WalletIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="textSecondary">
                              {formatCurrency(transaction.amount)} • {formatDate(transaction.date)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={transaction.status}
                          color={transaction.status === 'Pending' ? 'warning' : 'success'}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: 1.5,
                            px: 1
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ py: 4 }}>
                  <Box sx={{ 
                    width: '100%', 
                    textAlign: 'center',
                    py: 3
                  }}>
                    <ReceiptLongIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No transactions found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add a new sale to get started with your business
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/add-sale')}
                      sx={{ mt: 3 }}
                    >
                      Add Your First Sale
                    </Button>
                  </Box>
                </ListItem>
              )}
            </List>
          )}
        </Paper>
      </Box>
      
      <LoadingSpinner open={loading} fullScreen={false} />
    </Box>
  );
}

export default DashboardPage;