import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Chip, Paper, useTheme } from '@mui/material';
import { Agriculture, TrendingUp, LocalShipping, Security, Groups, WbSunny, ArrowForward, CheckCircle, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: <Agriculture sx={{ fontSize: 40 }} />, title: 'Fresh Farm Products', desc: 'Direct from over 10,000 verified Kenyan farmers. No middlemen, better prices.', color: '#2E7D32' },
  { icon: <TrendingUp sx={{ fontSize: 40 }} />, title: 'Live Market Prices', desc: 'Real-time prices from all 47 counties. AI-powered forecasts to maximize profits.', color: '#F57F17' },
  { icon: <LocalShipping sx={{ fontSize: 40 }} />, title: 'Reliable Logistics', desc: 'Vetted transport providers with GPS tracking. Cold chain available.', color: '#0288D1' },
  { icon: <Phone sx={{ fontSize: 40 }} />, title: 'M-Pesa Payments', desc: 'Secure mobile payments. Instant transfers to farmers upon delivery.', color: '#388E3C' },
  { icon: <WbSunny sx={{ fontSize: 40 }} />, title: 'Weather & Advisory', desc: 'County-specific forecasts and agricultural advisories from experts.', color: '#E64A19' },
  { icon: <Security sx={{ fontSize: 40 }} />, title: 'Verified & Trusted', desc: 'KYC-verified farmers and buyers. Dispute resolution and escrow protection.', color: '#6A1B9A' },
];

const STATS = [
  { value: '47', label: 'Counties Covered', suffix: '' },
  { value: '10K+', label: 'Verified Farmers', suffix: '' },
  { value: 'KES 2B+', label: 'Transactions Processed', suffix: '' },
  { value: '95%', label: 'On-time Delivery', suffix: '' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Register', desc: 'Sign up as a farmer, buyer, or transport provider. Verify your identity.', role: 'All Users' },
  { step: '2', title: 'List or Browse', desc: 'Farmers list products with photos. Buyers search by county, crop, and price.', role: 'Farmers & Buyers' },
  { step: '3', title: 'Order & Pay', desc: 'Place orders and pay securely via M-Pesa STK Push.', role: 'Buyers' },
  { step: '4', title: 'Deliver & Earn', desc: 'Transport providers collect and deliver. Farmers get paid instantly.', role: 'Farmers' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box>
      {/* Navigation */}
      <Box sx={{ bgcolor: 'primary.main', px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="white" fontWeight={800}>🌾 MkulimaLink Kenya</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" sx={{ color: 'white' }} onClick={() => navigate('/marketplace')}>Marketplace</Button>
          <Button color="inherit" sx={{ color: 'white' }} onClick={() => navigate('/market/prices')}>Prices</Button>
          <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/login')}>Login</Button>
          <Button variant="contained" sx={{ bgcolor: '#F57F17', '&:hover': { bgcolor: '#E65100' } }} onClick={() => navigate('/register')}>Get Started</Button>
        </Box>
      </Box>

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #4CAF50 100%)',
        color: 'white', py: { xs: 8, md: 14 }, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip label="Kenya's #1 AgriTech Platform" sx={{ bgcolor: '#F57F17', color: 'white', fontWeight: 600, mb: 2 }} />
              <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.1, mb: 2 }}>
                Connecting Kenyan<br />
                <Box component="span" sx={{ color: '#A5D6A7' }}>Farmers</Box> to Markets
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400, maxWidth: 500 }}>
                Buy and sell fresh agricultural products across all 47 counties. Real-time prices, M-Pesa payments, and trusted logistics.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" endIcon={<ArrowForward />}
                  sx={{ bgcolor: '#F57F17', '&:hover': { bgcolor: '#E65100' }, px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
                  onClick={() => navigate('/register')}>
                  Start Selling
                </Button>
                <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', px: 4, py: 1.5, fontSize: '1.1rem' }}
                  onClick={() => navigate('/marketplace')}>
                  Browse Products
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                {[{ icon: <CheckCircle sx={{ fontSize: 18 }} />, text: 'No registration fees' }, { icon: <CheckCircle sx={{ fontSize: 18 }} />, text: 'M-Pesa payments' }, { icon: <CheckCircle sx={{ fontSize: 18 }} />, text: 'GPS delivery tracking' }].map((item) => (
                  <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ color: '#A5D6A7' }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
              <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 360, width: '100%', bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>Today's Prices</Typography>
                {[
                  { crop: 'Maize', county: 'Nakuru', price: 45, trend: '+2%' },
                  { crop: 'Tomatoes', county: 'Meru', price: 65, trend: '-5%' },
                  { crop: 'Potatoes', county: 'Nyandarua', price: 50, trend: '+8%' },
                  { crop: 'Avocado', county: 'Murang\'a', price: 70, trend: '+12%' },
                ].map((item) => (
                  <Box key={item.crop} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">{item.crop}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.county}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={700} color="primary">KES {item.price}/kg</Typography>
                      <Typography variant="caption" color={item.trend.startsWith('+') ? 'success.main' : 'error.main'}>{item.trend}</Typography>
                    </Box>
                  </Box>
                ))}
                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/market/prices')}>View All Prices</Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: 'primary.dark', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {STATS.map((stat) => (
              <Grid key={stat.label} item xs={6} md={3} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="white">{stat.value}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Platform Features" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h3" fontWeight={800} gutterBottom>Everything You Need</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>Built for Kenya's agricultural ecosystem</Typography>
        </Box>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid key={f.title} item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', p: 1, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Avatar sx={{ bgcolor: f.color, mb: 2, width: 60, height: 60 }}>{f.icon}</Avatar>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it Works */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>How It Works</Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>Get started in minutes</Typography>
          </Box>
          <Grid container spacing={4}>
            {HOW_IT_WORKS.map((step) => (
              <Grid key={step.step} item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Typography variant="h5" color="white" fontWeight={800}>{step.step}</Typography>
                  </Box>
                  <Chip label={step.role} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', py: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Groups sx={{ fontSize: 60, color: '#A5D6A7', mb: 2 }} />
          <Typography variant="h3" fontWeight={800} color="white" gutterBottom>
            Join 10,000+ Kenyan Farmers
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontWeight: 400 }}>
            Start selling your produce directly to buyers across Kenya today
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" sx={{ bgcolor: '#F57F17', '&:hover': { bgcolor: '#E65100' }, px: 5, py: 1.5, fontWeight: 700 }}
              onClick={() => navigate('/register?role=FARMER')}>
              I'm a Farmer
            </Button>
            <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', px: 5, py: 1.5 }}
              onClick={() => navigate('/register?role=BUYER')}>
              I'm a Buyer
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0A1A0A', color: 'rgba(255,255,255,0.6)', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">© 2024 MkulimaLink Kenya. All rights reserved. | Nairobi, Kenya</Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Connecting Farmers to Markets across all 47 Counties</Typography>
      </Box>
    </Box>
  );
}
