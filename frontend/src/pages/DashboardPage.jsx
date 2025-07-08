import React, { useState, useEffect, useRef } from 'react';
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
  AccountBalanceWallet as WalletIcon,
  CreditCard as CreditCardIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as ShoppingCartIcon,
  Loyalty as LoyaltyIcon,
  Payments as PaymentsIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { fetchSales, fetchCustomers } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { commonStyles } from '../styles/commonStyles';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

function DashboardPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const { user } = useAuth(); // Get the current user from AuthContext
  
  // States
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);

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

  // Animation for auto-scrolling
  useEffect(() => {
    let animationId;
    const scrollContainer = scrollContainerRef.current;
    
    const autoScroll = () => {
      if (scrollContainer && !isHovered) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          // Reset scroll position when reached end
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by a small amount
          scrollContainer.scrollBy({ left: 1, behavior: 'auto' });
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };
    
    animationId = requestAnimationFrame(autoScroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isHovered]);

  // Create card data for Netflix-style carousel
  const cardData = [
    {
      id: 'outstanding',
      title: 'Outstanding Amount',
      value: formatCurrency(totalOutstanding),
      icon: <TrendingUpIcon />,
      chipIcon: <ArrowUpwardIcon fontSize="small" />,
      chipText: 'To Collect',
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.9)}, ${alpha(theme.palette.error.main, 0.8)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.error.dark, 0.8)}, ${alpha(theme.palette.error.main, 0.7)})`,
    },
    {
      id: 'paid',
      title: 'Total Paid Amount',
      value: formatCurrency(totalPaid),
      icon: <TrendingDownIcon />,
      chipIcon: <ArrowDownwardIcon fontSize="small" />,
      chipText: 'Collected',
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.9)}, ${alpha(theme.palette.success.main, 0.8)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.8)}, ${alpha(theme.palette.success.main, 0.7)})`,
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: customerCount.toString(),
      icon: <PeopleIcon />,
      chipIcon: <PersonIcon fontSize="small" />,
      chipText: 'Active Accounts',
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.9)}, ${alpha(theme.palette.info.main, 0.8)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.8)}, ${alpha(theme.palette.info.main, 0.7)})`,
    },
    {
      id: 'ratio',
      title: 'Payment Ratio',
      value: totalPaid + totalOutstanding > 0
        ? `${Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)}%`
        : '0%',
      icon: <ShowChartIcon />,
      progress: totalPaid + totalOutstanding > 0
        ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)
        : 0,
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.9)}, ${alpha(theme.palette.secondary.main, 0.8)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.8)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
    },
    // Adding more cards for demonstration
    {
      id: 'pending',
      title: 'Pending Approvals',
      value: '12',
      icon: <ReceiptLongIcon />,
      chipIcon: <DateRangeIcon fontSize="small" />,
      chipText: 'This Month',
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.9)}, ${alpha(theme.palette.warning.main, 0.8)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.8)}, ${alpha(theme.palette.warning.main, 0.7)})`,
    },
    {
      id: 'wallet',
      title: 'Total Revenue',
      value: formatCurrency(totalPaid * 1.25), // Example value
      icon: <WalletIcon />,
      chipIcon: <TrendingUpIcon fontSize="small" />,
      chipText: 'Increasing',
      bgGradient: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${alpha('#9c27b0', 0.9)}, ${alpha('#7b1fa2', 0.8)})`
        : `linear-gradient(135deg, ${alpha('#9c27b0', 0.8)}, ${alpha('#7b1fa2', 0.7)})`,
    },
  ];

  // Card rendering function
  const renderCard = (card) => (
    <Card 
      elevation={0} 
      key={card.id}
      sx={{ 
        width: 280,
        height: 180,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[10],
        },
        background: card.bgGradient,
        mr: 2,
        flex: '0 0 auto',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'/%3E%3C/path%3E%3C/svg%3E")`,
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
              {card.title}
            </Typography>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: alpha('#fff', 0.2),
                color: 'white'
              }}
            >
              {card.icon}
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
            {card.value}
          </Typography>
          
          {card.progress !== undefined ? (
            <Box sx={{ mt: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={card.progress}
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
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={card.chipIcon}
                label={card.chipText}
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
          )}
        </CardContent>
      )}
    </Card>
  );

  // Promotional banner data - now showing business metrics
  const bannerData = [
    {
      id: 'banner1',
      title: 'Outstanding Amount',
      value: formatCurrency(totalOutstanding),
      description: 'Amount to be collected from customers',
      icon: <TrendingUpIcon />,
      bgColor: '#e74c3c',
      textColor: '#fff'
    },
    {
      id: 'banner2',
      title: 'Total Paid',
      value: formatCurrency(totalPaid),
      description: 'Total amount collected so far',
      icon: <TrendingDownIcon />,
      bgColor: '#27ae60',
      textColor: '#fff'
    },
    {
      id: 'banner3',
      title: 'Total Customers',
      value: customerCount.toString(),
      description: 'Active customer accounts',
      icon: <PeopleIcon />,
      bgColor: '#3498db',
      textColor: '#fff'
    },
    {
      id: 'banner4',
      title: 'Payment Ratio',
      value: totalPaid + totalOutstanding > 0
        ? `${Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)}%`
        : '0%',
      description: 'Collection efficiency percentage',
      icon: <ShowChartIcon />,
      bgColor: '#9b59b6',
      textColor: '#fff',
      progress: totalPaid + totalOutstanding > 0
        ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100)
        : 0
    }
  ];

  // Service category data
  const serviceCategories = [
    {
      id: 'category1',
      title: 'Add Sale',
      icon: <ShoppingCartIcon />,
      link: '/add-sale',
      color: '#ff6b6b'
    },
    {
      id: 'category2',
      title: 'Add Customer',
      icon: <PersonIcon />,
      link: '/customers',
      color: '#4ecdc4'
    },
    {
      id: 'category3',
      title: 'View Sales',
      icon: <HistoryIcon />,
      link: '/sales-history',
      color: '#1a535c'
    },
    {
      id: 'category4',
      title: 'Payments',
      icon: <PaymentsIcon />,
      link: '/payments',
      color: '#3d5a80'
    },
    {
      id: 'category5',
      title: 'Offers',
      icon: <OfferIcon />,
      link: '/dashboard',
      color: '#f77f00'
    },
    {
      id: 'category6',
      title: 'QR Code',
      icon: <CreditCardIcon />,
      link: '/profile',
      color: '#7b2cbf'
    },
    {
      id: 'category7',
      title: 'Store',
      icon: <StoreIcon />,
      link: '/dashboard',
      color: '#2a9d8f'
    },
    {
      id: 'category8',
      title: 'Settings',
      icon: <SettingsIcon />,
      link: '/profile',
      color: '#457b9d'
    }
  ];

  // Banner rendering function
  const renderBanner = (banner) => (
    <Box
      key={banner.id}
      sx={{
        width: { xs: '100%', sm: '100%' },
        height: { xs: 150, sm: 170, md: 190 },
        borderRadius: { xs: 3, sm: 4 },
        overflow: 'hidden',
        position: 'relative',
        flex: '0 0 100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        background: `linear-gradient(135deg, ${banner.bgColor}, ${alpha(banner.bgColor, 0.8)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 3, sm: 3.5, md: 4.5 },
      }}
    >
      {/* Left content */}
      <Box 
        sx={{ 
          flex: 1,
          zIndex: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha('#fff', 0.2),
              color: '#fff',
              width: { xs: 44, sm: 48, md: 52 },
              height: { xs: 44, sm: 48, md: 52 },
              mr: { xs: 1.5, sm: 2, md: 2.5 },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' }
              }
            }}
          >
            {banner.icon}
          </Avatar>
          <Typography 
            variant={{ xs: "subtitle1", sm: "h6" }}
            sx={{ 
              color: '#fff',
              fontWeight: 600,
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.3rem' },
              lineHeight: 1.2
            }}
          >
            {banner.title}
          </Typography>
        </Box>
        
        <Typography 
          variant={{ xs: "h6", sm: "h5", md: "h3" }}
          sx={{ 
            color: '#fff',
            fontWeight: 700,
            mb: { xs: 1, sm: 1.2, md: 1.5 },
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2.2rem' },
            lineHeight: 1.1
          }}
        >
          {loading ? (
            <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#fff', 0.2) }} />
          ) : (
            banner.value
          )}
        </Typography>
        
        <Typography 
          variant={{ xs: "caption", sm: "body2" }}
          sx={{ 
            color: '#fff',
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            lineHeight: 1.3
          }}
        >
          {banner.description}
        </Typography>
        
        {banner.progress !== undefined && (
          <Box sx={{ mt: { xs: 1.8, sm: 2.2, md: 2.5 } }}>
            <LinearProgress
              variant="determinate"
              value={banner.progress}
              sx={{
                height: { xs: 7, sm: 9, md: 10 },
                borderRadius: 5,
                backgroundColor: alpha('#fff', 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </Box>
  );

  // Service category rendering function
  const renderCategory = (category) => (
    <Grid item xs={3} sm={3} md={3} key={category.id}>
      <Box
        onClick={() => navigate(category.link)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          p: { xs: 1.2, sm: 1.8, md: 2 },
          borderRadius: { xs: 2, sm: 2.5 },
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          minHeight: { xs: 90, sm: 110, md: 120 },
          height: '100%',
          '&:hover': {
            transform: 'scale(1.08)',
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          },
          '&:active': {
            transform: 'scale(0.96)'
          }
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#ffffff',
            color: category.color,
            width: { xs: 44, sm: 52, md: 56 },
            height: { xs: 44, sm: 52, md: 56 },
            mb: { xs: 0.8, sm: 1.2, md: 1.5 },
            boxShadow: `0 4px 12px ${alpha(category.color, 0.2)}`,
            border: `2px solid ${alpha(category.color, 0.15)}`,
            flexShrink: 0,
            transition: 'all 0.2s ease',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' }
            }
          }}
        >
          {category.icon}
        </Avatar>
        <Typography 
          variant="caption" 
          align="center"
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
            lineHeight: 1.3,
            textAlign: 'center',
            wordBreak: 'break-word',
            hyphens: 'auto',
            maxWidth: '100%',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: { xs: '2.6em', sm: '2.6em', md: '2.6em' }
          }}
        >
          {category.title}
        </Typography>
      </Box>
    </Grid>
  );

  // Handle automatic banner sliding
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      if (!isHovered) {
        setCurrentBannerIndex(prevIndex => 
          prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000); // Change banner every 5 seconds

    return () => {
      if (bannerTimerRef.current) {
        clearInterval(bannerTimerRef.current);
      }
    };
  }, [isHovered, bannerData.length]);

  // Calculate transform for the sliding effect
  const bannerTransform = `translateX(-${currentBannerIndex * 100}%)`;
  
  return (
    <Box sx={{ 
      pb: { xs: 3, sm: 4, md: 5 },
      px: { xs: 0, sm: 1, md: 2, lg: 3, xl: 4 },
      maxWidth: { xs: '100%', sm: '100%', md: '1200px', lg: '1400px' },
      mx: 'auto',
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <Box sx={{ 
        mb: { xs: 2.5, sm: 3, md: 3.5 }, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: { xs: 3, sm: 2, md: 0 },
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant={{ xs: "h6", sm: "h5" }}
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.5rem' },
              lineHeight: 1.2
            }}
          >
            Hello, {user?.name || 'User'}
          </Typography>
          {user?.shopName && (
            <Typography 
              variant="body2"
              color="primary"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
                fontWeight: 500
              }}
            >
              {user.shopName}
            </Typography>
          )}
          <Typography 
            variant={{ xs: "caption", sm: "body2" }} 
            color="textSecondary"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: 0.8
            }}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        
        <IconButton 
          size="small" 
          sx={{ 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            flexShrink: 0,
            ml: { xs: 1, sm: 1.5 },
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              transform: 'scale(1.05)'
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* Business Metrics Sliding Banner */}
      <Box 
        sx={{ 
          position: 'relative',
          mb: { xs: 3, sm: 4, md: 4.5 },
          overflow: 'hidden',
          borderRadius: { xs: 3, sm: 4 },
          height: { xs: 150, sm: 170, md: 190 },
          mx: { xs: 3, sm: 2, md: 0 },
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          sx={{
            display: 'flex',
            transition: 'transform 0.5s ease-in-out',
            transform: bannerTransform,
            height: '100%'
          }}
        >
          {bannerData.map(banner => renderBanner(banner))}
        </Box>
        
        {/* Banner navigation dots */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: { xs: 8, sm: 10 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            zIndex: 10
          }}
        >
          {bannerData.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              sx={{
                width: { xs: 6, sm: 8 },
                height: { xs: 6, sm: 8 },
                borderRadius: '50%',
                bgcolor: index === currentBannerIndex ? '#ffffff' : alpha('#ffffff', 0.5),
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Service Categories (PayTM-style) */}
      <Box sx={{ mb: { xs: 3.5, sm: 4.5, md: 5 }, mx: { xs: 3, sm: 2, md: 0 }, boxSizing: 'border-box' }}>
        <Box sx={{ mb: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant={{ xs: "body1", sm: "subtitle1" }}
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              color: theme.palette.text.primary
            }}
          >
            Recharges & Bill Payments
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 3.5 }, 
            borderRadius: { xs: 3, sm: 4 },
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            boxSizing: 'border-box',
            bgcolor: theme.palette.background.paper
          }}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ justifyContent: 'center', alignItems: 'stretch' }}>
            {serviceCategories.map(category => renderCategory(category))}
          </Grid>
        </Paper>
      </Box>
      
      {/* Quick Actions Section */}
      <Box sx={{ mb: { xs: 3.5, sm: 4.5, md: 5 }, mx: { xs: 3, sm: 2, md: 0 }, boxSizing: 'border-box' }}>
        <Typography 
          variant={{ xs: "h6", sm: "h5" }}
          sx={{ 
            mb: { xs: 2.5, sm: 3, md: 3.5 }, 
            fontWeight: 600,
            position: 'relative',
            fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.4rem' },
            color: theme.palette.text.primary,
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: { xs: -10, sm: -12 },
              left: 0,
              width: { xs: 45, sm: 65, md: 75 },
              height: { xs: 3, sm: 4 },
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`
            }
          }}
        >
          Quick Actions
        </Typography>
        
        <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5 }}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-sale')}
              sx={{ 
                py: { xs: 1.8, sm: 2.2, md: 2.5 },
                px: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                },
                '&:active': {
                  transform: 'translateY(-2px)'
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
                py: { xs: 1.8, sm: 2.2, md: 2.5 },
                px: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                fontWeight: 600,
                borderWidth: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '&:active': {
                  transform: 'translateY(0px)'
                }
              }}
            >
              Add New Customer
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Recent Transactions Section */}
      <Box sx={{ mx: { xs: 3, sm: 2, md: 0 }, boxSizing: 'border-box' }}>
        <Box sx={{ 
          mb: { xs: 2.5, sm: 3, md: 3.5 }, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography 
            variant={{ xs: "h6", sm: "h5" }}
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.4rem' },
              position: 'relative',
              color: theme.palette.text.primary,
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: { xs: -10, sm: -12 },
                left: 0,
                width: { xs: 45, sm: 65, md: 75 },
                height: { xs: 3, sm: 4 },
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`
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
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
              color: theme.palette.primary.main,
              borderRadius: { xs: 1.5, sm: 2 },
              px: { xs: 1.5, sm: 2 },
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(2px)'
              }
            }}
          >
            View All
          </Button>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: { xs: 3, sm: 4 },
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            bgcolor: theme.palette.background.paper
          }}
        >
          {loading ? (
            <List sx={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <React.Fragment key={item}>
                  <ListItem sx={{ py: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </ListItem>
                  {item < 5 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction._id || index}>
                    <ListItem 
                      sx={{ 
                        py: { xs: 1.5, sm: 1.8, md: 2 },
                        px: { xs: 2.5, sm: 3, md: 3.5 },
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        },
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 2, sm: 2.5, md: 3 },
                        boxSizing: 'border-box',
                        minHeight: { xs: 70, sm: 80, md: 90 }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                          fontWeight: 600,
                          flexShrink: 0,
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}
                      >
                        {transaction.customerInitial}
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 1, sm: 1.5 } }}>
                        <Typography 
                          variant={{ xs: "body2", sm: "subtitle1" }}
                          component="div" 
                          fontWeight={600}
                          sx={{ 
                            fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.palette.text.primary,
                            lineHeight: 1.2,
                            mb: 0.2
                          }}
                        >
                          {transaction.customerName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            opacity: 0.8,
                            lineHeight: 1.2
                          }}
                        >
                          {formatDate(transaction.date)}
                          {transaction.customerPhone && window.innerWidth > 480 && ` • ${transaction.customerPhone}`}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: { xs: '80px', sm: '90px', md: '100px' } }}>
                        <Typography 
                          variant={{ xs: "body2", sm: "subtitle2" }}
                          fontWeight={700}
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                            color: 
                              transaction.status?.toUpperCase() === 'PAID' 
                                ? 'success.main' 
                                : transaction.status?.toUpperCase() === 'OVERDUE' 
                                  ? 'error.main' 
                                  : 'text.primary',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.2,
                            mb: 0.5
                          }}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                        
                        <Chip
                          label={transaction.status || 'Pending'}
                          size="small"
                          sx={{ 
                            height: { xs: 22, sm: 26, md: 28 },
                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                            fontWeight: 600,
                            mt: 0.2,
                            maxWidth: { xs: '80px', sm: '90px', md: '100px' },
                            bgcolor: 
                              transaction.status?.toUpperCase() === 'PAID' 
                                ? alpha(theme.palette.success.main, 0.12)
                                : transaction.status?.toUpperCase() === 'OVERDUE' 
                                  ? alpha(theme.palette.error.main, 0.12)
                                  : alpha(theme.palette.warning.main, 0.12),
                            color: 
                              transaction.status?.toUpperCase() === 'PAID' 
                                ? theme.palette.success.main
                                : transaction.status?.toUpperCase() === 'OVERDUE' 
                                  ? theme.palette.error.main
                                  : theme.palette.warning.main,
                            border: `1px solid ${
                              transaction.status?.toUpperCase() === 'PAID' 
                                ? alpha(theme.palette.success.main, 0.2)
                                : transaction.status?.toUpperCase() === 'OVERDUE' 
                                  ? alpha(theme.palette.error.main, 0.2)
                                  : alpha(theme.palette.warning.main, 0.2)
                            }`,
                            '& .MuiChip-label': {
                              px: { xs: 0.8, sm: 1.2 },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      </Box>
                    </ListItem>
                    {index < recentTransactions.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ py: 4 }}>
                  <ListItemText 
                    primary="No recent transactions found" 
                    primaryTypographyProps={{ 
                      align: 'center', 
                      color: 'textSecondary' 
                    }} 
                  />
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
