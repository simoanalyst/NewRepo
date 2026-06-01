import { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Avatar, Pagination } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Order } from '../../types';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  PENDING: 'warning', CONFIRMED: 'primary', PROCESSING: 'primary',
  IN_TRANSIT: 'primary', DELIVERED: 'success', COMPLETED: 'success',
  CANCELLED: 'error', REFUNDED: 'error',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status, page],
    queryFn: () => ordersApi.list({ status, page, limit: 20 }).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>My Orders</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} label="Status">
            <MenuItem value="">All</MenuItem>
            {['PENDING','CONFIRMED','IN_TRANSIT','DELIVERED','COMPLETED','CANCELLED'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Counterparty</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.orders || []).map((order: Order) => (
                <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell><Typography variant="body2" fontWeight={600}>#{order.id.slice(0, 8).toUpperCase()}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>{(order.farmer?.firstName || order.buyer?.firstName)?.[0]}</Avatar>
                      <Typography variant="body2">{order.farmer?.firstName || order.buyer?.firstName} {order.farmer?.lastName || order.buyer?.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography fontWeight={700} color="primary">KES {order.totalAmount.toLocaleString()}</Typography></TableCell>
                  <TableCell><Chip label={order.status} size="small" color={STATUS_COLOR[order.status] || 'default'} /></TableCell>
                  <TableCell><Chip label={order.paymentStatus} size="small" color={order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'} /></TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('en-KE')}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/orders/${order.id}`)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!data?.orders?.length && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">No orders found</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {data?.pagination?.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={data.pagination.pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
