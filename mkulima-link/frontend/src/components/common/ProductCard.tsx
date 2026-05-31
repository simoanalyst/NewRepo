import {
  Card, CardContent, CardMedia, CardActions, Box, Typography, Chip,
  Button, Avatar, Tooltip, IconButton,
} from '@mui/material';
import { LocationOn, Agriculture, Verified, ShoppingCart, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';

interface ProductCardProps { product: Product; onAddToCart?: (p: Product) => void; }

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();
  const mainPhoto = product.photos?.[0] || 'https://placehold.co/400x300/2E7D32/white?text=Product';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia component="img" height={180} image={mainPhoto} alt={product.name} sx={{ objectFit: 'cover' }} />
        {product.organicCertified && (
          <Chip label="Organic" color="success" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 600 }} />
        )}
        {product.isFeatured && (
          <Chip label="Featured" color="warning" size="small" sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 600 }} />
        )}
        <IconButton sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}>
          <Favorite fontSize="small" sx={{ color: 'error.light' }} />
        </IconButton>
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
            {product.name}
          </Typography>
          <Chip label={product.category?.name || ''} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem', ml: 1 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">{product.county}</Typography>
          {product.grade && (
            <>
              <Typography variant="caption" color="text.disabled">•</Typography>
              <Typography variant="caption" color="text.secondary">Grade: {product.grade}</Typography>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" fontWeight={800} color="primary.main">
            KES {product.price.toLocaleString()}
            <Typography component="span" variant="caption" color="text.secondary" fontWeight={400}>
              /{product.unit}
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {product.quantity.toLocaleString()} {product.unit} avail.
          </Typography>
        </Box>

        {product.farmer && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Avatar src={product.farmer.profilePhoto} sx={{ width: 24, height: 24, fontSize: 12 }}>
              {product.farmer.firstName?.[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {product.farmer.firstName} {product.farmer.lastName}
            </Typography>
            {product.farmer.id && <Verified sx={{ fontSize: 14, color: 'primary.main' }} />}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 1.5, px: 2, gap: 1 }}>
        <Button size="small" variant="outlined" fullWidth onClick={() => navigate(`/marketplace/${product.id}`)}>
          View Details
        </Button>
        {onAddToCart && (
          <Button size="small" variant="contained" fullWidth startIcon={<ShoppingCart />} onClick={() => onAddToCart(product)}>
            Order
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
