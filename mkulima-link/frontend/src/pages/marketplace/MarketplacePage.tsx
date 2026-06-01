import { useState } from 'react';
import {
  Box, Grid, Typography, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Slider, Chip, Button, Pagination, CircularProgress,
  Drawer, IconButton, useMediaQuery, useTheme, Badge,
} from '@mui/material';
import { Search, FilterList, Close, Tune } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products.api';
import { KENYA_COUNTIES, Product } from '../../types';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MarketplacePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = useState({ search: '', county: '', category: '', minPrice: 0, maxPrice: 10000, organic: false, sort: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => productsApi.categories().then((r) => r.data.data) });

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', filters, page],
    queryFn: () => productsApi.list({ ...filters, page, limit: 20 }).then((r) => r.data.data),
  });

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    const count = Object.values({ ...filters, [key]: value }).filter((v) => v && v !== '' && v !== false && v !== 0).length;
    setActiveFilters(count);
  };

  const clearFilters = () => { setFilters({ search: '', county: '', category: '', minPrice: 0, maxPrice: 10000, organic: false, sort: 'createdAt', order: 'desc' }); setActiveFilters(0); };

  const FiltersPanel = () => (
    <Box sx={{ p: 2, minWidth: isMobile ? 'auto' : 260 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        {isMobile && <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>}
        {activeFilters > 0 && <Button size="small" onClick={clearFilters} color="error">Clear All</Button>}
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>County</InputLabel>
        <Select value={filters.county} onChange={(e) => handleFilterChange('county', e.target.value)} label="County">
          <MenuItem value="">All Counties</MenuItem>
          {KENYA_COUNTIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} label="Category">
          <MenuItem value="">All Categories</MenuItem>
          {(categoriesData || []).map((c: { id: string; name: string }) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Typography variant="body2" fontWeight={600} gutterBottom>Price Range (KES/unit)</Typography>
      <Slider
        value={[filters.minPrice, filters.maxPrice]}
        onChange={(_, v) => { const [min, max] = v as number[]; handleFilterChange('minPrice', min); handleFilterChange('maxPrice', max); }}
        min={0} max={10000} step={50} valueLabelDisplay="auto"
        valueLabelFormat={(v) => `KES ${v}`}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} label="Sort By">
          <MenuItem value="createdAt">Newest First</MenuItem>
          <MenuItem value="price">Price: Low to High</MenuItem>
          <MenuItem value="viewCount">Most Viewed</MenuItem>
        </Select>
      </FormControl>

      <Chip
        label="Organic Only"
        onClick={() => handleFilterChange('organic', !filters.organic)}
        color={filters.organic ? 'success' : 'default'}
        variant={filters.organic ? 'filled' : 'outlined'}
        sx={{ fontWeight: 600 }}
      />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Search Header */}
      <Box sx={{ bgcolor: 'primary.main', py: 4, px: 3 }}>
        <Typography variant="h4" fontWeight={800} color="white" gutterBottom>Marketplace</Typography>
        <Typography color="rgba(255,255,255,0.8)" gutterBottom>Fresh produce from across Kenya's 47 counties</Typography>
        <Box sx={{ display: 'flex', gap: 2, maxWidth: 700 }}>
          <TextField
            fullWidth
            placeholder="Search products, crops, farmers..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment>,
              sx: { bgcolor: 'white', borderRadius: 2 },
            }}
            size="medium"
          />
          <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', minWidth: 120, display: { xs: 'flex', md: 'none' } }}
            startIcon={<Badge badgeContent={activeFilters} color="error"><FilterList /></Badge>}
            onClick={() => setDrawerOpen(true)}>
            Filters
          </Button>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['Maize', 'Tomatoes', 'Avocado', 'Potatoes', 'Beans', 'Kale'].map((crop) => (
            <Chip key={crop} label={crop} size="small" onClick={() => handleFilterChange('search', crop)}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }} />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', maxWidth: 1400, mx: 'auto', px: 2, py: 3 }}>
        {/* Desktop Filters */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0, mr: 3 }}>
          <Box sx={{ position: 'sticky', top: 80, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <FiltersPanel />
          </Box>
        </Box>

        {/* Products */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {isLoading ? 'Searching...' : `${data?.pagination?.total || 0} products found`}
            </Typography>
            <Button size="small" startIcon={<Tune />} onClick={() => setDrawerOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }}>Filters</Button>
          </Box>

          {isLoading ? (
            <LoadingSpinner message="Loading products..." />
          ) : (
            <>
              <Grid container spacing={2.5}>
                {(data?.products || []).map((product: Product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
              {!data?.products?.length && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">No products found</Typography>
                  <Button sx={{ mt: 2 }} onClick={clearFilters}>Clear Filters</Button>
                </Box>
              )}
              {data?.pagination?.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination count={data.pagination.pages} page={page} onChange={(_, p) => { setPage(p); window.scrollTo(0, 0); }} color="primary" size="large" />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Mobile Filters Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}><FiltersPanel /></Box>
      </Drawer>
    </Box>
  );
}
