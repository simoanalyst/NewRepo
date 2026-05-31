import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Divider,
  InputAdornment, IconButton, Alert, CircularProgress, Container,
} from '@mui/material';
import { Visibility, VisibilityOff, Agriculture } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from 'notistack';

interface LoginForm { identifier: string; password: string; }

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      enqueueSnackbar(`Welcome back, ${user.firstName}!`, { variant: 'success' });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)' }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Agriculture sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={800} color="primary">MkulimaLink</Typography>
          <Typography color="text.secondary">Kenya's Agricultural Marketplace</Typography>
        </Box>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Sign In</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Phone Number or Email"
                placeholder="+254712345678"
                fullWidth
                {...register('identifier', { required: 'Phone or email required' })}
                error={!!errors.identifier}
                helperText={errors.identifier?.message}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                {...register('password', { required: 'Password required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" component={Link} to="/forgot-password" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Forgot password?
                </Typography>
              </Box>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Divider>or</Divider>
              <Button variant="outlined" fullWidth size="large" onClick={() => navigate('/register')}>
                Create New Account
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          By signing in, you agree to our Terms & Privacy Policy
        </Typography>
      </Container>
    </Box>
  );
}
