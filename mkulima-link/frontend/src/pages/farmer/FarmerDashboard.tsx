import { Grid, Typography, Box, Card, CardContent, Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, Button, Divider } from '@mui/material';
import { Agriculture, TrendingUp, ShoppingCart, Star, Add, ArrowForward } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning', CONFIRMED: 'primary', PROCESSING: 'primary',
  DELIVERED: 'success', COMPLETED: 'success', CANCELLED: 'error',
};

export default function FarmerDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['farmer-stats'],
    queryFn: () => apiClient.get('/users/stats').then((r) => r.data.data),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['farmer-recent-orders'],
    queryFn: () => apiClient.get('/orders', { params: { limit: 5 } }).then((r) => r.data.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['farmer-products'],
    queryFn: () => apiClient.get('/products', { params: { limit: 5, status: 'ACTIVE' } }).then((r) => r.data.data),
  });

  // Mock revenue chart data
  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 10) + 1,
    };
  });

  if (statsLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Farmer Dashboard</Typography>
          <Typography color="text.secondary">Welcome back! Here's your overview.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/farmer/products/add')}>
          Add Product
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Active Listings" value={stats?.productCount || 0} icon={<Agriculture />} color="#2E7D32" subtitle="Products for sale" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Orders" value={stats?.orderCount || 0} icon={<ShoppingCart />} color="#0288D1" subtitle="Completed orders" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Revenue" value={stats?.revenue || 0} icon={<TrendingUp />} color="#F57F17" subtitle="KES earned" prefix="KES " />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Rating" value={(stats?.avgRating || 0).toFixed(1)} icon={<Star />} color="#E91E63" subtitle="Average buyer rating" suffix="/5" />
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <RevenueChart data={revenueData} title="Revenue (Last 30 Days)" type="area" />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Orders</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/orders')}>View All</Button>
              </Box>
              {ordersLoading ? <LoadingSpinner /> : (
                <List dense>
                  {(ordersData?.orders || []).slice(0, 5).map((order: { id: string; buyer?: { firstName: string; lastName: string }; totalAmount: number; status: string }) => (
                    <Box key={order.id}>
                      <ListItem sx={{ px: 0, cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 14 }}>
                            {order.buyer?.firstName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${order.buyer?.firstName} ${order.buyer?.lastName}`}
                          secondary={`KES ${order.totalAmount?.toLocaleString()}`}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        <Chip label={order.status} size="small" color={STATUS_COLOR[order.status] || 'default'} sx={{ fontSize: '0.65rem' }} />
                      </ListItem>
                      <Divider component="li" />
                    </Box>
                  ))}
                  {!ordersData?.orders?.length && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No orders yet</Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Products */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Active Listings</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/farmer/products')}>Manage</Button>
              </Box>
              <Grid container spacing={2}>
                {(productsData?.products || []).map((product: { id: string; name: string; price: number; unit: string; quantity: number; status: string; photos: string[] }) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <Card variant="outlined" sx={{ p: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => navigate(`/marketplace/${product.id}`)}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar src={product.photos?.[0]} variant="rounded" sx={{ width: 48, height: 48 }}>
                          <Agriculture />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{product.name}</Typography>
                          <Typography variant="caption" color="primary">KES {product.price}/{product.unit}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">{product.quantity} {product.unit} left</Typography>
                        </Box>
                        <Chip label={product.status} size="small" color={product.status === 'ACTIVE' ? 'success' : 'warning'} sx={{ fontSize: '0.6rem' }} />
                      </Box>
                    </Card>
                  </Grid>
                ))}
                {!productsData?.products?.length && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary" gutterBottom>No active products</Typography>
                      <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/farmer/products/add')}>
                        Add Your First Product
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
