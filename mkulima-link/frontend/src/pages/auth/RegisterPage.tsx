import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, MenuItem, Select,
  FormControl, InputLabel, Stepper, Step, StepLabel, Alert, CircularProgress,
  Container, Grid, Chip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Agriculture, ShoppingCart, LocalShipping, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';
import { KENYA_COUNTIES } from '../../types';

const ROLES = [
  { value: 'FARMER', label: 'Farmer', icon: <Agriculture />, desc: 'Sell your farm produce directly' },
  { value: 'BUYER', label: 'Buyer', icon: <ShoppingCart />, desc: 'Buy fresh produce from farmers' },
  { value: 'WHOLESALER', label: 'Wholesaler', icon: <Business />, desc: 'Buy in bulk from multiple farmers' },
  { value: 'RETAILER', label: 'Retailer', icon: <Business />, desc: 'Retail agricultural products' },
  { value: 'EXPORTER', label: 'Exporter', icon: <Business />, desc: 'Export Kenyan produce internationally' },
  { value: 'TRANSPORT_PROVIDER', label: 'Transporter', icon: <LocalShipping />, desc: 'Provide delivery services' },
];

const STEPS = ['Select Role', 'Personal Info', 'Account Setup'];

interface RegisterForm {
  role: string; firstName: string; lastName: string; phone: string;
  email: string; password: string; confirmPassword: string; county: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: '', county: '' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({ phone: data.phone, password: data.password, firstName: data.firstName, lastName: data.lastName, role: data.role, county: data.county, email: data.email || undefined });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={800} color="primary">🌾 Join MkulimaLink</Typography>
          <Typography color="text.secondary">Kenya's Agricultural Marketplace</Typography>
        </Box>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Step 0: Role Selection */}
              {step === 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>What is your role?</Typography>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Please select a role' }}
                    render={({ field }) => (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {ROLES.map((role) => (
                          <Grid item xs={12} sm={6} md={4} key={role.value}>
                            <Card
                              onClick={() => field.onChange(role.value)}
                              sx={{
                                cursor: 'pointer', p: 1.5, textAlign: 'center', border: '2px solid',
                                borderColor: field.value === role.value ? 'primary.main' : 'divider',
                                bgcolor: field.value === role.value ? 'primary.50' : 'background.paper',
                                transition: 'all 0.2s', '&:hover': { borderColor: 'primary.light' },
                              }}
                            >
                              <Box sx={{ color: field.value === role.value ? 'primary.main' : 'text.secondary', mb: 1 }}>{role.icon}</Box>
                              <Typography variant="subtitle2" fontWeight={700}>{role.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{role.desc}</Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  />
                  {errors.role && <Typography color="error" variant="caption">{errors.role.message}</Typography>}
                  <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={!selectedRole} onClick={() => selectedRole && setStep(1)}>
                    Continue
                  </Button>
                </Box>
              )}

              {/* Step 1: Personal Info */}
              {step === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Personal Information</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="First Name" fullWidth {...register('firstName', { required: 'Required' })} error={!!errors.firstName} helperText={errors.firstName?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Last Name" fullWidth {...register('lastName', { required: 'Required' })} error={!!errors.lastName} helperText={errors.lastName?.message} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Phone Number" placeholder="+254712345678" fullWidth {...register('phone', { required: 'Required', pattern: { value: /^(\+254|0)[17]\d{8}$/, message: 'Invalid Kenyan phone' } })} error={!!errors.phone} helperText={errors.phone?.message || 'Format: +254712345678 or 0712345678'} />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="county"
                        control={control}
                        rules={{ required: 'County is required' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.county}>
                            <InputLabel>County</InputLabel>
                            <Select {...field} label="County">
                              {KENYA_COUNTIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button fullWidth variant="outlined" onClick={() => setStep(0)}>Back</Button>
                    <Button fullWidth variant="contained" size="large" onClick={() => setStep(2)}>Continue</Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Account Setup */}
              {step === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Create Password</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField label="Email (Optional)" type="email" fullWidth {...register('email')} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Password" type="password" fullWidth {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} error={!!errors.password} helperText={errors.password?.message} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Confirm Password" type="password" fullWidth {...register('confirmPassword', { required: 'Required' })} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button fullWidth variant="outlined" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
              Already have an account? <Typography component="span" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>Sign In</Typography>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
