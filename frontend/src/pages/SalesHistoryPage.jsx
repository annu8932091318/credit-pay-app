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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ReceiptLong as ReceiptIcon,
  WhatsApp as WhatsAppIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fetchSales, fetchCustomers, createNotification } from '../api';
import { useNotification } from '../components/NotificationSnackbar';
import LoadingSpinner from '../components/LoadingSpinner';

function SalesHistoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();
  
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
  }, [showNotification]);
  
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sales History</Typography>
        {isMobile && (
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'contained' : 'outlined'}
          >
            Filters
          </Button>
        )}
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Customer"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
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
                >
                  <MenuItem value="all">All</MenuItem>
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
                  textField: { variant: 'outlined', fullWidth: true }
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: { variant: 'outlined', fullWidth: true }
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
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredSales.length} results found
        </Typography>
      </Box>
      
      {/* Sales Data */}
      {loading ? (
        <LoadingSpinner open={true} />
      ) : (
        <>
          {!isMobile ? (
            /* Table View for Desktop */
            <Paper elevation={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.length > 0 ? (
                      paginatedSales.map((sale) => (
                        <TableRow key={sale._id} hover>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>{formatCurrency(sale.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={sale.status}
                              color={sale.status === 'Pending' ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewReceipt(sale)}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No sales found matching the filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredSales.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          ) : (
            /* Card View for Mobile */
            <Box>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => (
                  <Card key={sale._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {sale.customerName}
                        </Typography>
                        <Chip
                          label={sale.status}
                          color={sale.status === 'Pending' ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Amount
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(sale.amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(sale.date)}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewReceipt(sale)}
                          size="small"
                        >
                          View Receipt
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>No sales found matching the filters</Typography>
                </Paper>
              )}
              
              {/* Mobile Pagination */}
              <Box sx={{ mt: 2 }}>
                <TablePagination
                  component="div"
                  count={filteredSales.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
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
      >
        <DialogTitle>Sale Receipt</DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {formatCurrency(selectedSale.amount)}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedSale.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedSale.status}
                    color={selectedSale.status === 'Pending' ? 'warning' : 'success'}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.customerName} ({selectedSale.customerPhone})
                  </Typography>
                </Grid>
                
                {selectedSale.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedSale.notes}
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
            startIcon={<WhatsAppIcon />}
            variant="contained"
            color="success"
            onClick={handleSendReceipt}
          >
            Send Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalesHistoryPage; 