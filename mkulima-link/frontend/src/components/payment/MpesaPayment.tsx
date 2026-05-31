import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Box, CircularProgress, Alert, Stepper, Step, StepLabel,
} from '@mui/material';
import { PhoneAndroid, CheckCircle } from '@mui/icons-material';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface MpesaPaymentProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onSuccess?: () => void;
}

const STEPS = ['Enter Phone', 'Awaiting Payment', 'Complete'];

export default function MpesaPayment({ open, onClose, orderId, amount, onSuccess }: MpesaPaymentProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [polling, setPolling] = useState(false);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/payments/mpesa/stk-push', { orderId, phoneNumber: phone });
      setCheckoutRequestId(data.data.checkoutRequestId);
      setStep(1);
      startPolling(data.data.checkoutRequestId);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to initiate payment';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (reqId: string) => {
    setPolling(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 15) { clearInterval(interval); setPolling(false); return; }
      try {
        const { data } = await apiClient.get(`/payments/mpesa/status/${reqId}`);
        if (data.data?.ResultCode === 0) {
          clearInterval(interval);
          setPolling(false);
          setStep(2);
          onSuccess?.();
        } else if (data.data?.ResultCode !== undefined && data.data.ResultCode !== 0) {
          clearInterval(interval);
          setPolling(false);
          setError(`Payment failed: ${data.data.ResultDesc}`);
          setStep(0);
        }
      } catch { /* continue polling */ }
    }, 4000);
  };

  const handleClose = () => {
    if (step !== 1) { setStep(0); setError(''); onClose(); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PhoneAndroid color="success" />
        M-Pesa Payment
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Amount to pay: <strong>KES {amount.toLocaleString()}</strong>
            </Typography>
            <TextField
              fullWidth label="M-Pesa Phone Number" value={phone}
              onChange={(e) => setPhone(e.target.value)} sx={{ mt: 2 }}
              placeholder="+254712345678"
              helperText="Enter the phone number registered with M-Pesa"
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        )}

        {step === 1 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>Check Your Phone</Typography>
            <Typography color="text.secondary">
              An M-Pesa STK Push has been sent to <strong>{phone}</strong>.
              Enter your PIN to complete payment of <strong>KES {amount.toLocaleString()}</strong>.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
              Waiting for payment confirmation...
            </Typography>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>Payment Successful!</Typography>
            <Typography color="text.secondary">
              Your payment of KES {amount.toLocaleString()} has been received.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleInitiatePayment} disabled={loading || !phone}>
              {loading ? <CircularProgress size={20} /> : 'Pay Now'}
            </Button>
          </>
        )}
        {step === 2 && (
          <Button variant="contained" onClick={() => { setStep(0); onClose(); }}>Done</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
