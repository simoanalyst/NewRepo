import { useState } from 'react';
import { Box, Grid, Typography, Button, Chip, IconButton, Card, CardContent, TextField, InputAdornment, CircularProgress, Menu, MenuItem } from '@mui/material';
import { Add, Search, MoreVert, Edit, Delete, Visibility, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { productsApi } from '../../api/products.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Product } from '../../types';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', DRAFT: 'default', SOLD_OUT: 'warning', EXPIRED: 'error', SUSPENDED: 'error',
};

export default function MyProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products', search],
    queryFn: () => productsApi.list({ limit: 50, search }).then((r) => r.data.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { enqueueSnackbar('Product deleted', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['my-products'] }); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => productsApi.updateStatus(id, status),
    onSuccess: () => { enqueueSnackbar('Status updated', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['my-products'] }); },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>My Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/farmer/products/add')}>Add Product</Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <TextField
            placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 300 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {(data?.products || []).map((product: Product) => (
          <Grid item xs={12} sm={6} lg={4} key={product.id}>
            <Card sx={{ transition: '0.2s', '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                <img src={product.photos?.[0] || 'https://placehold.co/400x200/2E7D32/white?text=Product'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Chip label={product.status} color={STATUS_COLOR[product.status] || 'default'} size="small" sx={{ position: 'absolute', top: 8, left: 8 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
                    <Typography color="primary.main" fontWeight={700}>KES {product.price}/{product.unit}</Typography>
                    <Typography variant="caption" color="text.secondary">{product.quantity} {product.unit} available</Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedProduct(product.id); }}>
                    <MoreVert />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip label={product.category?.name} size="small" variant="outlined" />
                  <Chip label={product.county} size="small" variant="outlined" color="primary" />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                    <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{product.viewCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!data?.products?.length && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No products yet</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/farmer/products/add')}>Add Your First Product</Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { navigate(`/marketplace/${selectedProduct}`); setAnchorEl(null); }}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { updateStatus.mutate({ id: selectedProduct!, status: 'ACTIVE' }); setAnchorEl(null); }}>
          <CheckCircle sx={{ mr: 1, fontSize: 18 }} /> Set Active
        </MenuItem>
        <MenuItem onClick={() => { deleteProduct.mutate(selectedProduct!); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
