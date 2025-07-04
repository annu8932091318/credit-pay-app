import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { createPaymentOrder, verifyPayment, processManualPayment, getPaymentMethods } from '../api';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentForm = ({ sale, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [notes, setNotes] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load payment methods on component mount
  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        setPaymentMethods(response.data.methods || []);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setError('Failed to load payment methods');
      } finally {
        setIsInitializing(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setError('');
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (paymentMethod === 'RAZORPAY') {
        await handleOnlinePayment();
      } else {
        await handleManualPayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed');
      setIsLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    // Check if Razorpay is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Create payment order
    const orderResponse = await createPaymentOrder(sale._id, sale.amount);
    const { order } = orderResponse.data;

    if (!order) {
      throw new Error('Failed to create payment order');
    }

    // Configure Razorpay options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Credit Pay App',
      description: `Payment for Sale #${sale._id}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          // Verify the payment
          const paymentData = {
            saleId: sale._id,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: sale.amount,
          };

          const verifyResponse = await verifyPayment(paymentData);

          if (verifyResponse.data.success) {
            onSuccess(verifyResponse.data);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setError(error.response?.data?.error || 'Payment verification failed');
        } finally {
          setIsLoading(false);
        }
      },
      prefill: {
        name: sale.customer?.name || '',
        contact: sale.customer?.phone || '',
      },
      theme: {
        color: '#3f51b5',
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleManualPayment = async () => {
    try {
      const paymentData = {
        saleId: sale._id,
        amount: sale.amount,
        paymentMethod,
        notes,
      };

      const response = await processManualPayment(paymentData);

      if (response.data.success) {
        onSuccess(response.data);
      } else {
        throw new Error('Failed to process manual payment');
      }
    } catch (error) {
      console.error('Manual payment error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography ml={2}>Loading payment options...</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Complete Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Amount: ₹{sale.amount}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          <Box my={3}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {paymentMethods.map((method) => (
                  <FormControlLabel
                    key={method.id}
                    value={method.id}
                    control={<Radio />}
                    label={method.name}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {paymentMethod !== 'RAZORPAY' && (
            <Box my={3}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add any payment details or reference numbers"
                value={notes}
                onChange={handleNotesChange}
                variant="outlined"
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Processing...' : 'Complete Payment'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentForm;
