import { useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableHead,
  TableRow, Chip, CircularProgress, Alert, Tabs, Tab,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../../api/market.api';
import { KENYA_COUNTIES, MarketPrice } from '../../types';
import PriceChart from '../../components/charts/PriceChart';

const PRODUCTS = ['Maize', 'Tomatoes', 'Potatoes', 'Beans', 'Kale', 'Cabbage', 'Carrots', 'Onions', 'Avocado', 'Tea', 'Coffee', 'Wheat', 'Rice'];

export default function MarketPricesPage() {
  const [county, setCounty] = useState('');
  const [product, setProduct] = useState('Maize');
  const [days, setDays] = useState('30');
  const [tab, setTab] = useState(0);

  const { data: pricesData, isLoading } = useQuery({
    queryKey: ['market-prices', county, days],
    queryFn: () => marketApi.getPrices({ county, days }).then((r) => r.data.data),
  });

  const { data: trendsData } = useQuery({
    queryKey: ['price-trends', product, county, days],
    queryFn: () => marketApi.getTrends({ product, county, days }).then((r) => r.data.data),
  });

  const { data: insightsData } = useQuery({
    queryKey: ['market-insights', county],
    queryFn: () => marketApi.getInsights(county || undefined).then((r) => r.data.data),
  });

  const chartData = (trendsData?.[`${product} (${county || 'National'})`] || trendsData?.[Object.keys(trendsData || {})[0]] || [])
    .map((d: { date: string; price: number }) => ({ date: d.date, avgPrice: d.price }));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Market Prices</Typography>
        <Typography color="text.secondary">Real-time prices across Kenya's agricultural markets</Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>County</InputLabel>
            <Select value={county} onChange={(e) => setCounty(e.target.value)} label="County">
              <MenuItem value="">All Counties</MenuItem>
              {KENYA_COUNTIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Product</InputLabel>
            <Select value={product} onChange={(e) => setProduct(e.target.value)} label="Product">
              {PRODUCTS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Period</InputLabel>
            <Select value={days} onChange={(e) => setDays(e.target.value)} label="Period">
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="14">Last 14 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Price Table" />
        <Tab label="Price Trends" />
        <Tab label="Market Insights" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            {isLoading ? <CircularProgress /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell fontWeight={700}>Product</TableCell>
                    <TableCell>County</TableCell>
                    <TableCell align="right">Price (KES)</TableCell>
                    <TableCell align="right">Min</TableCell>
                    <TableCell align="right">Max</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(pricesData || []).slice(0, 50).map((price: MarketPrice) => (
                    <TableRow key={price.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell><Typography fontWeight={600}>{price.productName}</Typography></TableCell>
                      <TableCell><Chip label={price.county} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right"><Typography fontWeight={700} color="primary">KES {price.avgPrice?.toFixed(2) || price.price.toFixed(2)}</Typography></TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{price.minPrice?.toFixed(0) || '-'}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{price.maxPrice?.toFixed(0) || '-'}</TableCell>
                      <TableCell>{price.unit}</TableCell>
                      <TableCell>{new Date(price.date).toLocaleDateString('en-KE')}</TableCell>
                      <TableCell><Chip label={price.source} size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!pricesData?.length && !isLoading && <Alert severity="info">No price data for selected filters. Add market prices through the admin panel.</Alert>}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            {chartData.length > 0 ? (
              <PriceChart data={chartData} title={`${product} Price Trend - ${county || 'National'}`} height={400} />
            ) : (
              <Alert severity="info">No trend data available for selected product and county.</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          {(insightsData?.insights || []).map((insight: { product: string; avg: number; min: number; max: number; volatility: number; trend: string }) => (
            <Grid item xs={12} sm={6} md={4} key={insight.product}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{insight.product}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {insight.trend === 'rising' ? <TrendingUp color="success" /> : insight.trend === 'falling' ? <TrendingDown color="error" /> : <TrendingFlat color="action" />}
                      <Chip label={insight.trend} size="small" color={insight.trend === 'rising' ? 'success' : insight.trend === 'falling' ? 'error' : 'default'} />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight={800} color="primary">KES {insight.avg}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Range: KES {insight.min} - {insight.max} • Volatility: {insight.volatility}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
