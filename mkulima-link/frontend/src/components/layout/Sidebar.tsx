import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Dashboard, Agriculture, ShoppingCart, Store, TrendingUp, LocalShipping,
  Assessment, People, Category, WbSunny, Article, Notifications,
  AdminPanelSettings, Storefront,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps { open: boolean; onClose: () => void; drawerWidth: number; }

interface NavItem { label: string; icon: JSX.Element; path: string; roles?: string[]; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Farmer Dashboard', icon: <Dashboard />, path: '/farmer/dashboard', roles: ['FARMER'] },
  { label: 'My Products', icon: <Agriculture />, path: '/farmer/products', roles: ['FARMER'] },
  { label: 'Add Product', icon: <Store />, path: '/farmer/products/add', roles: ['FARMER'] },
  { label: 'My Profile', icon: <People />, path: '/farmer/profile', roles: ['FARMER'] },

  { label: 'Buyer Dashboard', icon: <Dashboard />, path: '/buyer/dashboard', roles: ['BUYER','WHOLESALER','RETAILER','EXPORTER'] },
  { label: 'Marketplace', icon: <Storefront />, path: '/marketplace', roles: ['BUYER','WHOLESALER','RETAILER','EXPORTER','FARMER'] },

  { label: 'My Orders', icon: <ShoppingCart />, path: '/orders' },
  { label: 'Logistics', icon: <LocalShipping />, path: '/logistics' },
  { label: 'Market Prices', icon: <TrendingUp />, path: '/market/prices' },
  { label: 'Price Forecast', icon: <Assessment />, path: '/forecast' },
  { label: 'Weather', icon: <WbSunny />, path: '/weather' },
  { label: 'Knowledge Hub', icon: <Article />, path: '/knowledge' },

  { label: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin/dashboard', roles: ['ADMIN','SUPER_ADMIN'] },
  { label: 'Users', icon: <People />, path: '/admin/users', roles: ['ADMIN','SUPER_ADMIN'] },
  { label: 'Product Moderation', icon: <Category />, path: '/admin/products', roles: ['ADMIN','SUPER_ADMIN'] },
];

export default function Sidebar({ open, onClose, drawerWidth }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 1 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="white">🌾</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>MkulimaLink</Typography>
          <Typography variant="caption" color="text.secondary">{user?.county} County</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 1 }} dense>
        {filteredItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main', color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.disabled">MkulimaLink Kenya v1.0</Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: { sm: 8 },
          height: { sm: 'calc(100% - 64px)' },
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {content}
    </Drawer>
  );
}
