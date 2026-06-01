import { useState } from 'react';
import { Box, Typography, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { CheckCircle, Block } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import apiClient from '../../api/client';

export default function ProductModeration() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', status],
    queryFn: () => apiClient.get('/admin/products', { params: { status, limit: 100 } }).then((r) => r.data.data),
  });

  const moderate = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      apiClient.patch(`/admin/products/${id}/moderate`, { status: newStatus }),
    onSuccess: () => { enqueueSnackbar('Product updated', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['admin-products'] }); },
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product', flex: 1 },
    { field: 'farmer', headerName: 'Farmer', width: 160, renderCell: ({ value }) => `${value?.firstName} ${value?.lastName}` },
    { field: 'county', headerName: 'County', width: 120 },
    { field: 'price', headerName: 'Price (KES)', width: 110, renderCell: ({ row }) => `${row.price}/${row.unit}` },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <Chip label={value} size="small" color={value === 'ACTIVE' ? 'success' : value === 'SUSPENDED' ? 'error' : 'default'} /> },
    { field: 'createdAt', headerName: 'Listed', width: 110, renderCell: ({ value }) => new Date(value).toLocaleDateString('en-KE') },
    { field: 'actions', headerName: 'Actions', width: 180, sortable: false, renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button size="small" color="success" startIcon={<CheckCircle />} onClick={() => moderate.mutate({ id: row.id, newStatus: 'ACTIVE' })}>Approve</Button>
        <Button size="small" color="error" startIcon={<Block />} onClick={() => moderate.mutate({ id: row.id, newStatus: 'SUSPENDED' })}>Suspend</Button>
      </Box>
    )},
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Product Moderation</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Filter by Status">
              <MenuItem value="">All</MenuItem>
              {['ACTIVE','DRAFT','SUSPENDED','SOLD_OUT','EXPIRED'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid rows={(data?.products || []).map((p: Record<string, unknown>) => ({ ...p, id: p.id }))} columns={columns} loading={isLoading}
            pageSizeOptions={[25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} sx={{ border: 0 }} />
        </Box>
      </Card>
    </Box>
  );
}
