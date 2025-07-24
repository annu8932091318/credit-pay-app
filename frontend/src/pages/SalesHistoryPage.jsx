import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Badge,
  Fade,
  Divider,
  Zoom,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ReceiptLong as ReceiptIcon,
  WhatsApp as WhatsAppIcon,
  FilterList as FilterListIcon,
  Payment as PaymentIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  ViewList as ViewListIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as CloudDownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fetchSales, fetchCustomers, createNotification } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';
import commonStyles from '../styles/commonStyles';
import { useAuth } from '../contexts/AuthContext';

function SalesHistoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();
  const { user } = useAuth(); // Get current shopkeeper
  
  // States
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Receipt dialog
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Load sales data
  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        // Get sales data
        const salesResponse = await fetchSales();
        let salesData = salesResponse.data;

        // Filter sales by shopkeeper
        const shopkeeperId = user?._id || user?.id;
        if (shopkeeperId) {
          salesData = salesData.filter(sale => {
            // sale.shopkeeper can be string or object
            if (typeof sale.shopkeeper === 'object' && sale.shopkeeper !== null) {
              return sale.shopkeeper._id === shopkeeperId || sale.shopkeeper.id === shopkeeperId;
            }
            return sale.shopkeeper === shopkeeperId;
          });
        }

        // Get customer data
        const customersResponse = await fetchCustomers();
        const customersData = customersResponse.data;
        setCustomers(customersData);

        // Enrich sales data with customer information
        salesData = salesData.map(sale => {
          const customer = customersData.find(c => c._id === (sale.customer || sale.customerId)) || {};
          return {
            ...sale,
            customerName: customer.name || 'Unknown',
            customerPhone: customer.phone || '',
          };
        });

        // Sort by most recent
        salesData.sort((a, b) => new Date(b.date) - new Date(a.date));

        setSales(salesData);
        setFilteredSales(salesData);
      } catch (error) {
        console.error('Failed to load sales data:', error);
        showNotification('Failed to load sales data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadSalesData();
  }, [user]);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...sales];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(sale => 
        sale.customerName.toLowerCase().includes(search) ||
        sale.customerPhone.includes(search)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(sale => sale.status === statusFilter);
    }
    
    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(sale => new Date(sale.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(sale => new Date(sale.date) <= end);
    }
    
    setFilteredSales(result);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, startDate, endDate, sales]);
  
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
  
  // Handle view receipt
  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setOpenReceiptDialog(true);
  };
  
  // Handle sending receipt
  const handleSendReceipt = async () => {
    if (!selectedSale) return;
    
    try {
      // Get customer details
      const customer = customers.find(c => c._id === (selectedSale.customer || selectedSale.customerId));
      
      if (!customer) {
        showNotification('Customer information not found', 'error');
        return;
      }
      
      // Create notification in database
      await createNotification({
        customer: selectedSale.customer || selectedSale.customerId,
        type: 'RECEIPT',
        message: `Receipt for your purchase of ${formatCurrency(selectedSale.amount)} on ${formatDate(selectedSale.date)}`,
        status: 'SENT',
        channel: 'whatsapp',
      });
      
      // Mock WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Receipt sent successfully', 'success');
      setOpenReceiptDialog(false);
    } catch (error) {
      console.error('Failed to send receipt:', error);
      showNotification('Failed to send receipt', 'error');
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate(null);
    setEndDate(null);
  };
  
  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Calculate paginated data
  const paginatedSales = filteredSales.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Page Header with Gradient Background */}
      <Paper 
        elevation={0} 
        sx={{
          background: theme => theme.palette.mode === 'dark' 
            ? commonStyles.gradients.secondaryDark
            : commonStyles.gradients.secondary,
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
              Sales History
            </Typography>
            <Typography variant="subtitle1">
              View and manage all your transaction records
            </Typography>
          </Box>
          
          {isMobile && (
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'contained' : 'outlined'}
              sx={{
                bgcolor: showFilters ? 'white' : 'rgba(255,255,255,0.2)',
                color: showFilters ? 'secondary.main' : 'white',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: showFilters ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                },
                boxShadow: theme => commonStyles.customShadows.button(theme.palette.mode === 'dark')
              }}
            >
              Filters {showFilters ? 'On' : 'Off'}
            </Button>
          )}
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Download report" arrow>
                <Button
                  variant="contained"
                  startIcon={<CloudDownloadIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Export
                </Button>
              </Tooltip>
              <Tooltip title="Print report" arrow>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Print
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Filters */}
      {showFilters && (
        <Paper elevation={2} sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={12}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FilterListIcon sx={{ mr: 1 }} />
                Filter Sales Records
              </Typography>
            </Grid>
            
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Customer"
                placeholder="Name or phone number"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{ 
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.1)',
                          }
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5
                  }
                }}
              />
            </Grid>
            
            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.15)' 
                        : 'rgba(0,0,0,0.1)'
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <PaymentIcon 
                        color={
                          statusFilter === 'Paid' 
                            ? 'success' 
                            : statusFilter === 'Pending' 
                              ? 'warning' 
                              : 'action'
                        } 
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Date Range Filters */}
            <Grid item xs={6} md={2}>
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: { 
                    variant: 'outlined', 
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      )
                    },
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: { 
                    variant: 'outlined', 
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      )
                    },
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }
                  }
                }}
              />
            </Grid>
            
            {/* Clear Filters */}
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
                disabled={!searchTerm && statusFilter === 'all' && !startDate && !endDate}
                startIcon={<ClearIcon />}
                sx={{
                  borderRadius: 1.5,
                  height: '56px',
                  borderColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(0,0,0,0.1)',
                  '&.Mui-disabled': {
                    borderColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Results Summary */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {filteredSales.length} transactions found
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            icon={<ViewListIcon sx={{ fontSize: '1rem' }} />} 
            label="Newest first" 
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              borderColor: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.15)' 
                : 'rgba(0,0,0,0.1)'
            }}
          />
          
          {(searchTerm || statusFilter !== 'all' || startDate || endDate) && (
            <Chip 
              label="Filters applied" 
              size="small"
              color="secondary"
              onDelete={handleResetFilters}
              sx={{
                borderRadius: 1.5
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Sales Data */}
      {loading ? (
        <LoadingSpinner open={true} />
      ) : (
        <>
          {!isMobile ? (
            /* Table View for Desktop */
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark')
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)' 
                    }}>
                      <TableCell width="30%">
                        <Typography variant="subtitle2" fontWeight={600}>Customer</Typography>
                      </TableCell>
                      <TableCell width="20%">
                        <Typography variant="subtitle2" fontWeight={600}>Date</Typography>
                      </TableCell>
                      <TableCell width="20%">
                        <Typography variant="subtitle2" fontWeight={600}>Amount</Typography>
                      </TableCell>
                      <TableCell width="15%">
                        <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                      </TableCell>
                      <TableCell align="right" width="15%">
                        <Typography variant="subtitle2" fontWeight={600}>Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.length > 0 ? (
                      paginatedSales.map((sale) => (
                        <TableRow 
                          key={sale._id} 
                          hover
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.05)' 
                                : 'rgba(0,0,0,0.02)'
                            }
                          }}
                          onClick={() => handleViewReceipt(sale)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  fontSize: '0.9rem',
                                  bgcolor: theme => theme.palette.secondary.main,
                                }}
                              >
                                {sale.customerName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={500}>
                                  {sale.customerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {sale.customerPhone}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography>{formatDate(sale.date)}</Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography fontWeight={600} color="primary.main">
                              {formatCurrency(sale.amount)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={sale.status}
                              color={sale.status === 'Pending' ? 'warning' : 'success'}
                              size="small"
                              variant="filled"
                              sx={{
                                ...commonStyles.statusChip,
                                fontWeight: 600,
                                px: 1
                              }}
                            />
                          </TableCell>
                          
                          <TableCell align="right">
                            <Tooltip title="View receipt details" arrow>
                              <IconButton
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewReceipt(sale);
                                }}
                                size="small"
                                sx={{ 
                                  bgcolor: theme => theme.palette.mode === 'dark' 
                                    ? 'rgba(25, 118, 210, 0.12)' 
                                    : 'rgba(25, 118, 210, 0.08)',
                                  mr: 1
                                }}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Send receipt via WhatsApp" arrow>
                              <IconButton
                                color="success"
                                size="small"
                                sx={{ 
                                  bgcolor: theme => theme.palette.mode === 'dark' 
                                    ? 'rgba(46, 125, 50, 0.12)' 
                                    : 'rgba(46, 125, 50, 0.08)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSale(sale);
                                  handleSendReceipt();
                                }}
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No sales records found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Try adjusting your filters or search criteria
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={handleResetFilters}
                              disabled={!searchTerm && statusFilter === 'all' && !startDate && !endDate}
                            >
                              Clear All Filters
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                px: 2,
                borderTop: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {Math.min(paginatedSales.length, rowsPerPage)} of {filteredSales.length} records
                </Typography>
                <TablePagination
                  component="div"
                  count={filteredSales.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </Paper>
          ) : (
            /* Card View for Mobile */
            <Box>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => (
                  <Card 
                    key={sale._id} 
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark'),
                      ...commonStyles.cardWithHover
                    }}
                    onClick={() => handleViewReceipt(sale)}
                    elevation={2}
                  >
                    <Box sx={{ 
                      height: 6, 
                      bgcolor: sale.status === 'Pending' 
                        ? theme => theme.palette.warning.main
                        : theme => theme.palette.success.main
                    }} />
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              mr: 1.5,
                              fontSize: '0.9rem',
                              bgcolor: theme => theme.palette.secondary.main,
                            }}
                          >
                            {sale.customerName.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {sale.customerName}
                          </Typography>
                        </Box>
                        <Chip
                          label={sale.status}
                          color={sale.status === 'Pending' ? 'warning' : 'success'}
                          size="small"
                          variant="filled"
                          sx={{
                            ...commonStyles.statusChip,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ mb: 1.5 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Amount
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                            {formatCurrency(sale.amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Date
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDate(sale.date)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Divider />
                    <Box 
                      sx={{ 
                        px: 2, 
                        py: 1, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.01)' 
                          : 'rgba(0,0,0,0.01)'
                      }}
                    >
                      <Button
                        startIcon={<ReceiptIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReceipt(sale);
                        }}
                        size="small"
                        color="primary"
                      >
                        View
                      </Button>
                      <IconButton
                        color="success"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSale(sale);
                          handleSendReceipt();
                        }}
                        sx={{ 
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(46, 125, 50, 0.12)' 
                            : 'rgba(46, 125, 50, 0.08)'
                        }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                ))
              ) : (
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  boxShadow: theme => commonStyles.customShadows.card(theme.palette.mode === 'dark') 
                }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No sales records found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try adjusting your filters or search criteria
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    disabled={!searchTerm && statusFilter === 'all' && !startDate && !endDate}
                  >
                    Clear All Filters
                  </Button>
                </Paper>
              )}
              
              {/* Mobile Pagination */}
              {paginatedSales.length > 0 && (
                <Box sx={{ 
                  mt: 2,
                  backgroundColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}>
                  <TablePagination
                    component="div"
                    count={filteredSales.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
      
      {/* Receipt Dialog */}
      <Dialog
        open={openReceiptDialog}
        onClose={() => setOpenReceiptDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme => commonStyles.customShadows.dialog(theme.palette.mode === 'dark'),
            overflow: 'hidden'
          }
        }}
      >
        {selectedSale && (
          <>
            <Box sx={{ 
              background: theme => selectedSale.status === 'Paid' 
                ? (theme.palette.mode === 'dark' ? commonStyles.gradients.successDark : commonStyles.gradients.success)
                : (theme.palette.mode === 'dark' ? commonStyles.gradients.warningDark : commonStyles.gradients.warning),
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'white'
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 48, 
                height: 48 
              }}>
                <ReceiptIcon />
              </Avatar>
              
              <Box>
                <DialogTitle sx={{ p: 0, color: 'inherit', fontWeight: 600 }}>
                  Sale Receipt
                </DialogTitle>
                <Typography variant="body2">
                  Transaction ID: #{selectedSale._id?.substring(0, 8) || 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <DialogContent sx={{ px: 3, py: 4 }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  border: theme => `1px dashed ${
                    theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.2)' 
                      : 'rgba(0,0,0,0.1)'
                  }`,
                  borderRadius: 1.5,
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  AMOUNT
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {formatCurrency(selectedSale.amount)}
                </Typography>
                
                <Chip
                  label={selectedSale.status}
                  color={selectedSale.status === 'Pending' ? 'warning' : 'success'}
                  sx={{
                    ...commonStyles.statusChip,
                    fontWeight: 600,
                    mt: 1
                  }}
                />
              </Paper>
              
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      mr: 1.5,
                      bgcolor: theme => theme.palette.secondary.main
                    }}>
                      {selectedSale.customerName?.charAt(0) || 'C'}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedSale.customerName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                    <WhatsAppIcon sx={{ fontSize: 16, mr: 1, color: '#25D366' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSale.customerPhone}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Transaction Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(selectedSale.date)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalAtmIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={500}>
                      Cash
                    </Typography>
                  </Box>
                </Grid>
                
                {selectedSale.notes && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        borderRadius: 1.5,
                        borderStyle: 'dashed',
                        bgcolor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.02)' 
                          : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <EventNoteIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <Divider />
            
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={() => setOpenReceiptDialog(false)}
                variant="outlined"
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                }}
              >
                Close
              </Button>
              
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
                color="info"
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  mr: 1
                }}
              >
                Share
              </Button>
              
              <Button
                startIcon={<WhatsAppIcon />}
                variant="contained"
                color="success"
                onClick={handleSendReceipt}
                disableElevation
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  px: 3
                }}
              >
                Send Receipt
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default SalesHistoryPage;