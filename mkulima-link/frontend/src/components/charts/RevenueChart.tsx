import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orders?: number }>;
  title?: string;
  type?: 'area' | 'bar';
  height?: number;
}

export default function RevenueChart({ data, title, type = 'area', height = 300 }: RevenueChartProps) {
  const theme = useTheme();

  return (
    <Box>
      {title && <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `KES ${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8 }} />
            <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} name="Revenue (KES)" />
            {data[0]?.orders !== undefined && <Bar dataKey="orders" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} name="Orders" />}
          </BarChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}
