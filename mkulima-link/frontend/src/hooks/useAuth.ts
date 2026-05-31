import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useSnackbar } from 'notistack';

export function useAuth() {
  const { user, isAuthenticated, accessToken, login, logout: storeLogout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    storeLogout();
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };

  const isFarmer = user?.role === 'FARMER';
  const isBuyer = ['BUYER', 'WHOLESALER', 'RETAILER', 'EXPORTER'].includes(user?.role || '');
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '');
  const isTransportProvider = user?.role === 'TRANSPORT_PROVIDER';

  return {
    user, isAuthenticated, accessToken, login, logout, updateUser,
    isFarmer, isBuyer, isAdmin, isTransportProvider,
  };
}
