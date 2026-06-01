import { useState } from 'react';
import {
  Box, Grid, Typography, Button, Chip, Avatar, Card, CardContent, Divider,
  TextField, Rating, Tab, Tabs, CircularProgress, Alert,
} from '@mui/material';
import { LocationOn, Verified, Agriculture, ShoppingCart, Phone, Share, Favorite } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { productsApi } from '../../api/products.api';
import { ordersApi } from '../../api/orders.api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MpesaPayment from '../../components/payment/MpesaPayment';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, isFarmer } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [quantity, setQuantity] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [tab, setTab] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const createOrder = useMutation({
    mutationFn: (data: Record<string, unknown>) => ordersApi.create(data),
    onSuccess: (res) => {
      const order = res.data.data;
      setCreatedOrderId(order.id);
      setPaymentOpen(true);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => enqueueSnackbar(err?.response?.data?.message || 'Order failed', { variant: 'error' }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <Alert severity="error">Product not found</Alert>;

  const handleOrder = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    createOrder.mutate({
      farmerId: product.farmerId,
      items: [{ productId: product.id, quantity }],
    });
  };

  const totalPrice = product.price * quantity;
  const photos = product.photos?.length > 0 ? product.photos : ['https://placehold.co/600x400/2E7D32/white?text=Product'];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Grid container spacing={4}>
        {/* Photos */}
        <Grid item xs={12} md={7}>
          <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 2, aspectRatio: '4/3' }}>
            <img src={photos[selectedPhoto]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          {photos.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {photos.map((photo: string, i: number) => (
                <Box key={i} onClick={() => setSelectedPhoto(i)}
                  sx={{ width: 70, height: 70, borderRadius: 1, overflow: 'hidden', border: '2px solid', borderColor: i === selectedPhoto ? 'primary.main' : 'transparent', cursor: 'pointer' }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip label={product.category?.name} color="primary" size="small" />
            {product.organicCertified && <Chip label="Organic Certified" color="success" size="small" icon={<Verified />} />}
            <Chip label={product.status} color={product.status === 'ACTIVE' ? 'success' : 'warning'} size="small" />
          </Box>

          <Typography variant="h4" fontWeight={800} gutterBottom>{product.name}</Typography>

          {product.grade && <Typography color="text.secondary" gutterBottom>Grade: {product.grade}</Typography>}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography color="text.secondary">{product.county}{product.subCounty ? `, ${product.subCounty}` : ''}</Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} color="primary.main">
            KES {product.price.toLocaleString()}
            <Typography component="span" variant="h6" color="text.secondary" fontWeight={400">/{product.unit}</Typography>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            {product.quantity.toLocaleString()} {product.unit} available • Min order: {product.minOrderQty} {product.unit}
          </Typography>

          {/* Farmer */}
          {product.farmer && (
            <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={product.farmer.profilePhoto} sx={{ width: 48, height: 48 }}>{product.farmer.firstName?.[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{product.farmer.firstName} {product.farmer.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{product.farmer.county} County</Typography>
                </Box>
                <Button size="small" startIcon={<Phone />} variant="outlined">Contact</Button>
              </Box>
            </Card>
          )}

          {!isFarmer && product.status === 'ACTIVE' && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  type="number" label="Quantity" value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minOrderQty, parseFloat(e.target.value) || product.minOrderQty))}
                  inputProps={{ min: product.minOrderQty, step: product.minOrderQty }}
                  sx={{ width: 120 }}
                />
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary">KES {totalPrice.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">Total ({quantity} {product.unit})</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" size="large" fullWidth startIcon={<ShoppingCart />}
                  onClick={handleOrder} disabled={createOrder.isPending}>
                  {createOrder.isPending ? <CircularProgress size={20} color="inherit" /> : 'Place Order'}
                </Button>
                <Button variant="outlined" size="large"><Favorite /></Button>
              </Box>
            </Box>
          )}
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Description" />
            <Tab label="Reviews" />
            {product.farmer?.farmerProfile && <Tab label="Farmer Info" />}
          </Tabs>

          {tab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>{product.description || 'No description provided.'}</Typography>
                {product.harvestDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Harvest Date: {new Date(product.harvestDate).toLocaleDateString('en-KE')}
                  </Typography>
                )}
                {product.expiryDate && (
                  <Typography variant="body2" color="text.secondary">
                    Best Before: {new Date(product.expiryDate).toLocaleDateString('en-KE')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 1 && (
            <Card>
              <CardContent>
                {(product.farmer?.receivedReviews || []).length === 0 ? (
                  <Typography color="text.secondary">No reviews yet</Typography>
                ) : (
                  (product.farmer?.receivedReviews || []).map((review: { id: string; rating: number; comment: string; reviewer: { firstName: string; lastName: string; profilePhoto?: string }; createdAt: string }) => (
                    <Box key={review.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Avatar src={review.reviewer?.profilePhoto} sx={{ width: 40, height: 40 }}>{review.reviewer?.firstName?.[0]}</Avatar>
                        <Box>
                          <Typography fontWeight={600}>{review.reviewer?.firstName} {review.reviewer?.lastName}</Typography>
                          <Rating value={review.rating} size="small" readOnly />
                          <Typography variant="body2">{review.comment}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {createdOrderId && (
        <MpesaPayment
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          orderId={createdOrderId}
          amount={totalPrice}
          onSuccess={() => { setPaymentOpen(false); navigate(`/orders/${createdOrderId}`); }}
        />
      )}
    </Box>
  );
}
