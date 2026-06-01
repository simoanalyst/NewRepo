import { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, TextField, Button, MenuItem, Select,
  FormControl, InputLabel, Typography, Chip, Switch, FormControlLabel,
  CircularProgress, Alert, Autocomplete,
} from '@mui/material';
import { CloudUpload, Agriculture } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { productsApi } from '../../api/products.api';
import { KENYA_COUNTIES } from '../../types';

const UNITS = ['kg', 'g', 'tonne', 'bag (90kg)', 'bag (50kg)', 'crate', 'dozen', 'litre', 'piece', 'bunch', 'carton'];
const GRADES = ['Grade A', 'Grade B', 'Grade C', 'Premium', 'Export Quality', 'Local Market'];

export default function AddProduct() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { county: '', unit: 'kg', organicCertified: false },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories().then((r) => r.data.data),
  });

  const createProduct = useMutation({
    mutationFn: (formData: FormData) => productsApi.create(formData),
    onSuccess: () => { enqueueSnackbar('Product listed successfully!', { variant: 'success' }); navigate('/farmer/products'); },
    onError: (err: { response?: { data?: { message?: string } } }) => enqueueSnackbar(err?.response?.data?.message || 'Failed to list product', { variant: 'error' }),
  });

  const onDrop = useCallback((accepted: File[]) => {
    const all = [...photos, ...accepted].slice(0, 8);
    setPhotos(all);
    setPreviews(all.map((f) => URL.createObjectURL(f)));
  }, [photos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 8, maxSize: 5 * 1024 * 1024,
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, String(v));
    });
    photos.forEach((photo) => formData.append('photos', photo));
    createProduct.mutate(formData);
  };

  const allCategories = categoriesData?.flatMap((c: { name: string; id: string; children?: { name: string; id: string }[] }) => [
    { id: c.id, name: c.name },
    ...(c.children?.map((ch: { id: string; name: string }) => ({ id: ch.id, name: `${c.name} > ${ch.name}` })) || []),
  ]) || [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>List New Product</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Fill in the details to list your produce on the marketplace</Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Product Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Product Name" fullWidth {...register('name', { required: 'Required' })} error={!!errors.name} helperText={errors.name?.message} placeholder="e.g., Fresh Tomatoes Grade A" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="categoryId" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                      <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel>Category</InputLabel>
                        <Select {...field} label="Category" value={field.value || ''}>
                          {allCategories.map((c: { id: string; name: string }) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="grade" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Grade</InputLabel>
                        <Select {...field} label="Grade" value={field.value || ''}>
                          {GRADES.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Description" multiline rows={3} fullWidth {...register('description')} placeholder="Describe your product quality, growing conditions, etc." />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Available Quantity" type="number" fullWidth {...register('quantity', { required: 'Required', min: 0.1 })} error={!!errors.quantity} inputProps={{ step: '0.1' }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="unit" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Unit</InputLabel>
                        <Select {...field} label="Unit">
                          {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Minimum Order Qty" type="number" fullWidth {...register('minOrderQty')} inputProps={{ step: '0.1', min: '0.1' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Price per Unit (KES)" type="number" fullWidth {...register('price', { required: 'Required', min: 0.01 })} error={!!errors.price} inputProps={{ step: '0.01' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="county" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                      <Autocomplete options={[...KENYA_COUNTIES]} value={field.value || ''} onChange={(_, v) => field.onChange(v || '')}
                        renderInput={(params) => <TextField {...params} label="County *" error={!!errors.county} />} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Location Details" fullWidth {...register('location')} placeholder="e.g., Ol Kalou, along Nakuru Road" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Harvest Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('harvestDate')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Best Before Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('expiryDate')} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="organicCertified" control={control} render={({ field }) => (
                      <FormControlLabel control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} color="success" />} label="Organically Certified" />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Product Photos</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>Upload up to 8 photos (max 5MB each)</Typography>
                <Box {...getRootProps()} sx={{
                  border: '2px dashed', borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: isDragActive ? 'primary.50' : 'background.default',
                  mb: 2, transition: 'all 0.2s',
                }}>
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {isDragActive ? 'Drop photos here...' : 'Drag & drop or click to upload'}
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {previews.map((src, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ position: 'relative', paddingTop: '75%', borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
                        <img src={src} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && <Chip label="Main" size="small" color="primary" sx={{ position: 'absolute', top: 4, left: 4 }} />}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" fullWidth size="large" startIcon={createProduct.isPending ? <CircularProgress size={20} color="inherit" /> : <Agriculture />} disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Listing...' : 'List Product'}
              </Button>
              <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/farmer/products')}>Cancel</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
