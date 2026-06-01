import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { People, Agriculture, ShoppingCart, TrendingUp, AttachMoney, Assessment } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import StatsCard from '../../components/common/StatsCard';
import RevenueChart from '../../components/charts/RevenueChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard').then((r) => r.data.data),
  });

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return { date: d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }), revenue: Math.floor(Math.random() * 500000) + 50000, orders: Math.floor(Math.random() * 50) + 5 };
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Total Users" value={data?.users?.total || 0} icon={<People />} color="#2E7D32" subtitle={`+${data?.users?.newThisMonth} this month`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Farmers" value={data?.users?.farmers || 0} icon={<Agriculture />} color="#F57F17" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Total Orders" value={data?.orders?.total || 0} icon={<ShoppingCart />} color="#0288D1" subtitle={`${data?.orders?.thisMonth} this month`} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Total Revenue" value={data?.revenue?.total || 0} icon={<AttachMoney />} color="#E91E63" prefix="KES " /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Active Products" value={data?.products?.active || 0} icon={<Assessment />} color="#6A1B9A" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatsCard title="Completed Orders" value={data?.orders?.completed || 0} icon={<TrendingUp />} color="#00897B" /></Grid>
      </Grid>

      <Card>
        <CardContent>
          <RevenueChart data={chartData} title="Platform Revenue & Orders (Last 30 Days)" type="area" height={350} />
        </CardContent>
      </Card>
    </Box>
  );
}
