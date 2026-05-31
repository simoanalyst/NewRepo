import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Badge, Menu, MenuItem,
  Avatar, Box, Tooltip, Chip, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, AccountCircle, Brightness4, Brightness7,
  ExitToApp, Person, Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';

interface HeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
  sidebarOpen: boolean;
}

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  FARMER: 'success', BUYER: 'info', WHOLESALER: 'primary', RETAILER: 'secondary',
  EXPORTER: 'warning', TRANSPORT_PROVIDER: 'default', ADMIN: 'warning', SUPER_ADMIN: 'warning',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            🌾 MkulimaLink
          </Typography>
          {user && (
            <Chip
              label={user.role.replace('_', ' ')}
              color={ROLE_COLORS[user.role] || 'default'}
              size="small"
              sx={{ fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              {user?.profilePhoto ? (
                <Avatar src={user.profilePhoto} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <Typography variant="body2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/dashboard'); setAnchorEl(null); }}>
            <Dashboard sx={{ mr: 1, fontSize: 18 }} /> Dashboard
          </MenuItem>
          <MenuItem onClick={() => { navigate('/farmer/profile'); setAnchorEl(null); }}>
            <Person sx={{ mr: 1, fontSize: 18 }} /> Profile
          </MenuItem>
          {isAdmin && (
            <MenuItem onClick={() => { navigate('/admin/dashboard'); setAnchorEl(null); }}>
              <Dashboard sx={{ mr: 1, fontSize: 18 }} /> Admin Panel
            </MenuItem>
          )}
          <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
            <ExitToApp sx={{ mr: 1, fontSize: 18 }} /> Logout
          </MenuItem>
        </Menu>

        <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)} sx={{ mt: 1 }}>
          <MenuItem disabled>
            <Typography variant="body2" fontWeight={600}>Notifications ({unreadCount} unread)</Typography>
          </MenuItem>
          <MenuItem onClick={() => setNotifAnchor(null)}>
            <Typography variant="body2" color="text.secondary">View all notifications</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
