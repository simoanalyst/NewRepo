import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Button, Chip, Avatar, Dialog, DialogTitle, DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search, PersonOff, PersonAdd, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import apiClient from '../../api/client';

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [confirmUser, setConfirmUser] = useState<{ id: string; isActive: boolean; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role],
    queryFn: () => apiClient.get('/admin/users', { params: { search, role, limit: 100 } }).then((r) => r.data.data),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.patch(`/admin/users/${id}/status`, { isActive, reason: 'Admin action' }),
    onSuccess: () => { enqueueSnackbar('User status updated', { variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmUser(null); },
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'User', flex: 1, renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={row.profilePhoto} sx={{ width: 32, height: 32, fontSize: 13 }}>{row.firstName?.[0]}</Avatar>
        <Box><Typography variant="body2" fontWeight={600}>{row.firstName} {row.lastName}</Typography><Typography variant="caption" color="text.secondary">{row.phone}</Typography></Box>
      </Box>
    )},
    { field: 'role', headerName: 'Role', width: 140, renderCell: ({ value }) => <Chip label={value} size="small" color="primary" /> },
    { field: 'county', headerName: 'County', width: 120 },
    { field: 'isVerified', headerName: 'Verified', width: 90, renderCell: ({ value }) => <Chip label={value ? 'Yes' : 'No'} size="small" color={value ? 'success' : 'warning'} /> },
    { field: 'isActive', headerName: 'Status', width: 90, renderCell: ({ value }) => <Chip label={value ? 'Active' : 'Suspended'} size="small" color={value ? 'success' : 'error'} /> },
    { field: 'createdAt', headerName: 'Joined', width: 110, renderCell: ({ value }) => new Date(value).toLocaleDateString('en-KE') },
    { field: 'actions', headerName: 'Actions', width: 120, sortable: false, renderCell: ({ row }) => (
      <Button size="small" color={row.isActive ? 'error' : 'success'} startIcon={row.isActive ? <PersonOff /> : <PersonAdd />}
        onClick={() => setConfirmUser({ id: row.id, isActive: !row.isActive, name: `${row.firstName} ${row.lastName}` })}>
        {row.isActive ? 'Suspend' : 'Activate'}
      </Button>
    )},
  ];

  const rows = (data?.users || []).map((u: Record<string, unknown>) => ({ ...u, id: u.id }));

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Users Management</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, pb: '16px !important' }}>
          <TextField placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} sx={{ flex: 1 }} size="small" />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
              <MenuItem value="">All Roles</MenuItem>
              {['FARMER','BUYER','WHOLESALER','RETAILER','EXPORTER','TRANSPORT_PROVIDER','ADMIN'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 600 }}>
          <DataGrid rows={rows} columns={columns} loading={isLoading} pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{ border: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }} />
        </Box>
      </Card>

      <Dialog open={!!confirmUser} onClose={() => setConfirmUser(null)}>
        <DialogTitle>{confirmUser?.isActive ? 'Activate' : 'Suspend'} User: {confirmUser?.name}?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmUser(null)}>Cancel</Button>
          <Button variant="contained" color={confirmUser?.isActive ? 'success' : 'error'}
            onClick={() => confirmUser && toggleStatus.mutate({ id: confirmUser.id, isActive: confirmUser.isActive })}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
