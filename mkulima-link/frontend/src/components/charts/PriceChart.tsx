import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface PriceChartProps {
  data: Array<{ date: string; price: number; predictedPrice?: number; avgPrice?: number }>;
  title?: string;
  height?: number;
}

export default function PriceChart({ data, title, height = 300 }: PriceChartProps) {
  const theme = useTheme();
  return (
    <Box>
      {title && <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `KES ${v}`} />
          <Tooltip
            formatter={(value: number, name: string) => [`KES ${value.toFixed(2)}`, name]}
            contentStyle={{ borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
          />
          <Legend />
          {data[0]?.price !== undefined && (
            <Line type="monotone" dataKey="price" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} name="Actual Price" />
          )}
          {data[0]?.avgPrice !== undefined && (
            <Line type="monotone" dataKey="avgPrice" stroke={theme.palette.info.main} strokeWidth={2} dot={false} name="Average Price" />
          )}
          {data[0]?.predictedPrice !== undefined && (
            <Line type="monotone" dataKey="predictedPrice" stroke={theme.palette.warning.main} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
