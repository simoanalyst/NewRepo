import { Box, Grid, Typography, Button, Card, CardContent, Chip, Avatar, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ShoppingCart, TrendingUp, Store, Star, ArrowForward } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BuyerDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['buyer-stats'],
    queryFn: () => apiClient.get('/users/stats').then((r) => r.data.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => apiClient.get('/orders', { params: { limit: 5 } }).then((r) => r.data.data),
  });

  const spendingData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    return { date: d.toLocaleDateString('en-KE', { month: 'short' }), revenue: Math.floor(Math.random() * 200000) + 20000 };
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Buyer Dashboard</Typography>
          <Typography color="text.secondary">Track your purchases and discover new products</Typography>
        </Box>
        <Button variant="contained" startIcon={<Store />} onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Orders" value={stats?.orderCount || 0} icon={<ShoppingCart />} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Spent" value={stats?.totalSpent || 0} icon={<TrendingUp />} color="#F57F17" prefix="KES " />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Active Orders" value={stats?.activeOrders || 0} icon={<Store />} color="#0288D1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Avg. Rating Given" value="4.5" icon={<Star />} color="#E91E63" suffix="/5" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <RevenueChart data={spendingData} title="Monthly Spending (KES)" type="bar" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Orders</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/orders')}>All</Button>
              </Box>
              <List dense>
                {(ordersData?.orders || []).slice(0, 5).map((order: { id: string; farmer?: { firstName: string; lastName: string }; totalAmount: number; status: string; createdAt: string }) => (
                  <Box key={order.id}>
                    <ListItem sx={{ px: 0, cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
                      <Avatar sx={{ width: 36, height: 36, mr: 1.5, bgcolor: 'primary.light', fontSize: 14 }}>
                        {order.farmer?.firstName?.[0]}
                      </Avatar>
                      <ListItemText
                        primary={`${order.farmer?.firstName} ${order.farmer?.lastName}`}
                        secondary={`KES ${order.totalAmount?.toLocaleString()}`}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                      />
                      <Chip label={order.status} size="small" color={order.status === 'COMPLETED' ? 'success' : 'default'} sx={{ fontSize: '0.6rem' }} />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
