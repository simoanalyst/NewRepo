import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuthStore } from './store/authStore';
import { lightTheme, darkTheme } from './theme';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProfile from './pages/farmer/FarmerProfile';
import AddProduct from './pages/farmer/AddProduct';
import MyProducts from './pages/farmer/MyProducts';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ProductDetailPage from './pages/marketplace/ProductDetailPage';
import MarketPricesPage from './pages/market/MarketPricesPage';
import ForecastPage from './pages/market/ForecastPage';
import LogisticsPage from './pages/logistics/LogisticsPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ProductModeration from './pages/admin/ProductModeration';
import KnowledgeHub from './pages/knowledge/KnowledgeHub';
import WeatherPage from './pages/weather/WeatherPage';

function PrivateRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
  if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/buyer/dashboard" replace />;
}

export default function App() {
  const { isDarkMode } = useAuthStore();
  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<ProductDetailPage />} />
        <Route path="/market/prices" element={<MarketPricesPage />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />

        {/* Authenticated */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          {/* Farmer */}
          <Route path="/farmer/dashboard" element={<PrivateRoute roles={['FARMER']}><FarmerDashboard /></PrivateRoute>} />
          <Route path="/farmer/profile" element={<PrivateRoute roles={['FARMER']}><FarmerProfile /></PrivateRoute>} />
          <Route path="/farmer/products/add" element={<PrivateRoute roles={['FARMER']}><AddProduct /></PrivateRoute>} />
          <Route path="/farmer/products" element={<PrivateRoute roles={['FARMER']}><MyProducts /></PrivateRoute>} />

          {/* Buyer */}
          <Route path="/buyer/dashboard" element={<PrivateRoute roles={['BUYER','WHOLESALER','RETAILER','EXPORTER']}><BuyerDashboard /></PrivateRoute>} />

          {/* Shared */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/weather" element={<WeatherPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN','SUPER_ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN','SUPER_ADMIN']}><UsersManagement /></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute roles={['ADMIN','SUPER_ADMIN']}><ProductModeration /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
