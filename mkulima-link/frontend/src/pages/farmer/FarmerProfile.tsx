import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Autocomplete, Chip, Avatar, Alert, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { KENYA_COUNTIES } from '../../types';

const CROPS = ['Maize', 'Wheat', 'Rice', 'Sorghum', 'Tomatoes', 'Kale', 'Cabbage', 'Carrots', 'Onions', 'Potatoes', 'Beans', 'Avocado', 'Mango', 'Banana', 'Tea', 'Coffee', 'Sugarcane'];

export default function FarmerProfile() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<'profile' | 'farm'>('profile');

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/users/profile').then((r) => r.data.data),
  });

  const { register, handleSubmit, control } = useForm({ values: data });

  const updateProfile = useMutation({
    mutationFn: (formData: Record<string, unknown>) => apiClient.put('/users/profile', formData),
    onSuccess: () => { enqueueSnackbar('Profile updated!', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['user-profile'] }); },
    onError: () => enqueueSnackbar('Update failed', { variant: 'error' }),
  });

  const updateFarmerProfile = useMutation({
    mutationFn: (formData: Record<string, unknown>) => apiClient.put('/users/farmer-profile', formData),
    onSuccess: () => { enqueueSnackbar('Farm details updated!', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['user-profile'] }); },
    onError: () => enqueueSnackbar('Update failed', { variant: 'error' }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>My Profile</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {(['profile', 'farm'] as const).map((t) => (
          <Chip key={t} label={t === 'profile' ? 'Personal Info' : 'Farm Details'} onClick={() => setTab(t)} color={tab === t ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
        ))}
      </Box>

      {tab === 'profile' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar src={data?.profilePhoto} sx={{ width: 80, height: 80, fontSize: 28 }}>
                {data?.firstName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{data?.firstName} {data?.lastName}</Typography>
                <Typography color="text.secondary">{data?.phone}</Typography>
                <Chip label={data?.isVerified ? 'Verified' : 'Unverified'} size="small" color={data?.isVerified ? 'success' : 'warning'} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            <Box component="form" onSubmit={handleSubmit((d) => updateProfile.mutate(d))}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="First Name" fullWidth {...register('firstName')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Last Name" fullWidth {...register('lastName')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Email" type="email" fullWidth {...register('email')} /></Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name="county" control={control} render={({ field }) => (
                    <Autocomplete options={[...KENYA_COUNTIES]} value={field.value || ''} onChange={(_, v) => field.onChange(v)}
                      renderInput={(params) => <TextField {...params} label="County" />} />
                  )} />
                </Grid>
                <Grid item xs={12} sm={6}><TextField label="Sub-County" fullWidth {...register('subCounty')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Ward" fullWidth {...register('ward')} /></Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {tab === 'farm' && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Farm Details</Typography>
            <Box component="form" onSubmit={handleSubmit((d) => updateFarmerProfile.mutate(d.farmerProfile || d))}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="Farm Size" type="number" fullWidth defaultValue={data?.farmerProfile?.farmSize} {...register('farmSize')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Size Unit (acres/hectares)" fullWidth defaultValue={data?.farmerProfile?.farmSizeUnit || 'acres'} {...register('farmSizeUnit')} /></Grid>
                <Grid item xs={12}><TextField label="Farm Location Description" fullWidth multiline rows={2} defaultValue={data?.farmerProfile?.farmLocation} {...register('farmLocation')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="GPS Latitude" type="number" fullWidth defaultValue={data?.farmerProfile?.gpsLat} {...register('gpsLat')} inputProps={{ step: 'any' }} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="GPS Longitude" type="number" fullWidth defaultValue={data?.farmerProfile?.gpsLng} {...register('gpsLng')} inputProps={{ step: 'any' }} /></Grid>
                <Grid item xs={12}>
                  <Controller name="mainCrops" control={control} defaultValue={data?.farmerProfile?.mainCrops || []} render={({ field }) => (
                    <Autocomplete multiple options={CROPS} value={field.value || []} onChange={(_, v) => field.onChange(v)}
                      renderInput={(params) => <TextField {...params} label="Main Crops" />}
                      renderTags={(value, getTagProps) => value.map((opt, idx) => <Chip label={opt} {...getTagProps({ index: idx })} color="success" size="small" />)} />
                  )} />
                </Grid>
                <Grid item xs={12}><TextField label="Bio / Farm Description" multiline rows={3} fullWidth defaultValue={data?.farmerProfile?.bio} {...register('bio')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Irrigation Type" fullWidth defaultValue={data?.farmerProfile?.irrigationType} {...register('irrigationType')} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Soil Type" fullWidth defaultValue={data?.farmerProfile?.soilType} {...register('soilType')} /></Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={updateFarmerProfile.isPending}>
                {updateFarmerProfile.isPending ? <CircularProgress size={20} /> : 'Save Farm Details'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
