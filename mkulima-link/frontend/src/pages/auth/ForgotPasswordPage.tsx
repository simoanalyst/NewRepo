import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Container } from '@mui/material';
import { Agriculture } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(identifier);
      setSent(true);
    } catch { setError('Failed to send reset code'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)' }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Agriculture sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={800} color="primary">MkulimaLink</Typography>
        </Box>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>Reset Password</Typography>
            {!sent ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                <Typography color="text.secondary" variant="body2">Enter your phone number or email to receive a reset code.</Typography>
                <TextField label="Phone or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} fullWidth />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                </Button>
                <Button onClick={() => navigate('/login')} fullWidth>Back to Login</Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>Reset code sent! Check your phone or email.</Alert>
                <Button variant="contained" fullWidth onClick={() => navigate('/login')}>Back to Login</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
