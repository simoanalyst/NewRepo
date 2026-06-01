import { useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Select, MenuItem, FormControl,
  InputLabel, Button, CircularProgress, Alert, Chip, LinearProgress,
} from '@mui/material';
import { Assessment, TrendingUp, TrendingDown, Info } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { forecastApi } from '../../api/forecast.api';
import { KENYA_COUNTIES, PriceForecast } from '../../types';
import PriceChart from '../../components/charts/PriceChart';

const PRODUCTS = ['Maize', 'Tomatoes', 'Potatoes', 'Beans', 'Kale', 'Cabbage', 'Carrots', 'Onions', 'Avocado', 'Wheat', 'Tea', 'Coffee'];

export default function ForecastPage() {
  const [product, setProduct] = useState('Maize');
  const [county, setCounty] = useState('Nairobi');
  const [days, setDays] = useState('30');
  const [forecast, setForecast] = useState<PriceForecast | null>(null);

  const generateForecast = useMutation({
    mutationFn: () => forecastApi.get(product, county, parseInt(days)).then((r) => r.data.data),
    onSuccess: (data) => setForecast(data),
  });

  const chartData = forecast?.forecasts.map((f) => ({
    date: f.date, predictedPrice: f.predictedPrice, price: undefined, avgPrice: undefined,
  })) || [];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>AI Price Forecast</Typography>
        <Typography color="text.secondary">Machine learning predictions for Kenyan agricultural commodities</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Generate Forecast</Typography>
          <Grid container spacing={2} alignItems="flex-end">
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
                <InputLabel>County</InputLabel>
                <Select value={county} onChange={(e) => setCounty(e.target.value)} label="County">
                  {KENYA_COUNTIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Forecast Period</InputLabel>
                <Select value={days} onChange={(e) => setDays(e.target.value)} label="Forecast Period">
                  <MenuItem value="14">14 Days</MenuItem>
                  <MenuItem value="30">30 Days</MenuItem>
                  <MenuItem value="60">60 Days</MenuItem>
                  <MenuItem value="90">90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button variant="contained" fullWidth startIcon={generateForecast.isPending ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                onClick={() => generateForecast.mutate()} disabled={generateForecast.isPending} size="medium">
                {generateForecast.isPending ? 'Generating...' : 'Generate Forecast'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {generateForecast.isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to generate forecast. Please try again.</Alert>}

      {forecast && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Historical Average</Typography>
                <Typography variant="h4" fontWeight={800} color="primary">KES {forecast.historicalAvg}</Typography>
                <Typography variant="caption" color="text.secondary">per kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Current Trend</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1 }}>
                  {forecast.currentTrend === 'Rising' ? <TrendingUp color="error" sx={{ fontSize: 36 }} /> : forecast.currentTrend === 'Falling' ? <TrendingDown color="success" sx={{ fontSize: 36 }} /> : <Info color="info" sx={{ fontSize: 36 }} />}
                  <Typography variant="h5" fontWeight={700}>{forecast.currentTrend}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Next Forecast</Typography>
                <Typography variant="h4" fontWeight={800} color="success.main">KES {forecast.forecasts[0]?.predictedPrice}</Typography>
                <Typography variant="caption" color="text.secondary">{forecast.forecasts[0]?.date}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Confidence</Typography>
                <Typography variant="h4" fontWeight={800} color="warning.main">
                  {Math.round((forecast.forecasts[0]?.confidence || 0) * 100)}%
                </Typography>
                <LinearProgress variant="determinate" value={(forecast.forecasts[0]?.confidence || 0) * 100} sx={{ mt: 1, borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <PriceChart data={chartData} title={`${product} Price Forecast - ${county}`} height={380} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Alert icon={<Info />} severity="info">
              <Typography fontWeight={600} gutterBottom>Seasonal Outlook</Typography>
              <Typography variant="body2">{forecast.seasonalOutlook}</Typography>
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Weekly Forecast Details</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {forecast.forecasts.map((f) => (
                    <Card key={f.date} variant="outlined" sx={{ p: 2, minWidth: 140, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{f.date}</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">KES {f.predictedPrice}</Typography>
                      <Chip label={f.trend} size="small" color={f.trend === 'Rising' ? 'error' : f.trend === 'Falling' ? 'success' : 'default'} sx={{ mt: 0.5 }} />
                      <LinearProgress variant="determinate" value={f.confidence * 100} sx={{ mt: 1, borderRadius: 1 }} color={f.confidence > 0.7 ? 'success' : 'warning'} />
                      <Typography variant="caption" color="text.secondary">{Math.round(f.confidence * 100)}% confidence</Typography>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {!forecast && !generateForecast.isPending && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Assessment sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Select parameters above and click Generate Forecast</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Powered by linear regression with seasonal adjustments for Kenya</Typography>
        </Box>
      )}
    </Box>
  );
}
