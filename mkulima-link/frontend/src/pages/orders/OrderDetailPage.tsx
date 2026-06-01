import { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Chip, Button, Stepper, Step, StepLabel, Avatar, Divider, Alert } from '@mui/material';
import { Phone, LocationOn, LocalShipping, Payment, Cancel } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { ordersApi } from '../../api/orders.api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MpesaPayment from '../../components/payment/MpesaPayment';
import { Order } from '../../types';

const ORDER_STEPS = ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'In Transit', 'Delivered', 'Completed'];
const ORDER_STEP_MAP: Record<string, number> = { PENDING: 0, CONFIRMED: 1, PROCESSING: 2, READY_FOR_PICKUP: 3, IN_TRANSIT: 4, DELIVERED: 5, COMPLETED: 6 };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isFarmer } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!).then((r) => r.data.data) as Promise<Order>,
    enabled: !!id,
  });

  const cancelOrder = useMutation({
    mutationFn: () => ordersApi.cancel(id!, 'Cancelled by user'),
    onSuccess: () => { enqueueSnackbar('Order cancelled', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['order', id] }); },
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => ordersApi.updateStatus(id!, status),
    onSuccess: () => { enqueueSnackbar('Order updated', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['order', id] }); },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!order) return <Alert severity="error">Order not found</Alert>;

  const currentStep = ORDER_STEP_MAP[order.status] || 0;
  const isBuyer = order.buyerId === user?.id;
  const canPay = isBuyer && order.paymentStatus !== 'COMPLETED' && !['CANCELLED','REFUNDED'].includes(order.status);
  const canCancel = ['PENDING','CONFIRMED'].includes(order.status);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Order #{order.id.slice(0, 8).toUpperCase()}</Typography>
          <Typography color="text.secondary">{new Date(order.createdAt).toLocaleString('en-KE')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canPay && <Button variant="contained" startIcon={<Payment />} onClick={() => setPaymentOpen(true)}>Pay Now</Button>}
          {canCancel && <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => cancelOrder.mutate()}>Cancel</Button>}
        </Box>
      </Box>

      {/* Status Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ flexWrap: 'wrap' }}>
            {ORDER_STEPS.map((label) => (
              <Step key={label}><StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Items</Typography>
              {order.items?.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  <Avatar src={(item.product?.photos as string[])?.[0]} variant="rounded" sx={{ width: 56, height: 56 }}>
                    {item.product?.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{item.product?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity} {item.unit} × KES {item.unitPrice.toLocaleString()} = KES {item.totalPrice.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" fontWeight={800} color="primary">KES {order.totalAmount.toLocaleString()}</Typography>
              </Box>
              {order.deliveryFee ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                  <Typography variant="body2">KES {order.deliveryFee.toLocaleString()}</Typography>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        {/* Parties & Status */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Farmer</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={order.farmer?.profilePhoto} sx={{ width: 48, height: 48 }}>{order.farmer?.firstName?.[0]}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{order.farmer?.firstName} {order.farmer?.lastName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption">{order.farmer?.phone}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Payment Status</Typography>
              <Chip label={order.paymentStatus} color={order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'} sx={{ fontWeight: 600, mb: 1 }} />
              {order.payments?.map((p) => (
                <Box key={p.id} sx={{ mt: 1 }}>
                  <Typography variant="body2">Method: {p.method.replace('_', ' ')}</Typography>
                  {p.mpesaReceiptNumber && <Typography variant="body2">Receipt: {p.mpesaReceiptNumber}</Typography>}
                </Box>
              ))}
            </CardContent>
          </Card>

          {order.delivery && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Delivery</Typography>
                <Chip label={order.delivery.status} color="primary" sx={{ mb: 1 }} />
                {order.delivery.trackingCode && (
                  <Typography variant="body2">Tracking: <strong>{order.delivery.trackingCode}</strong></Typography>
                )}
                {order.delivery.estimatedArrival && (
                  <Typography variant="body2">ETA: {new Date(order.delivery.estimatedArrival).toLocaleString('en-KE')}</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {isFarmer && ['PENDING','CONFIRMED'].includes(order.status) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Update Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {order.status === 'PENDING' && <Button variant="contained" size="small" onClick={() => updateStatus.mutate('CONFIRMED')}>Confirm</Button>}
                  {order.status === 'CONFIRMED' && <Button variant="contained" size="small" onClick={() => updateStatus.mutate('READY_FOR_PICKUP')}>Ready for Pickup</Button>}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {canPay && (
        <MpesaPayment open={paymentOpen} onClose={() => setPaymentOpen(false)} orderId={order.id} amount={order.totalAmount}
          onSuccess={() => { setPaymentOpen(false); queryClient.invalidateQueries({ queryKey: ['order', id] }); }} />
      )}
    </Box>
  );
}
