export interface ProductImage {
  url: string;
  altText: string;
  is360?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  material: string;
  gemstone?: string;
  color?: string;
  ringSize?: string;
  priceKes: number;
  compareAtPriceKes?: number;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  isPersonalizable?: boolean;
  collection?: string;
  certification?: string;
  warrantyMonths: number;
  avgRating: number;
  reviewCount: number;
  images: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatarUrl: string;
  productName?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  county: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
  isFlagship: boolean;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  photoUrls: string[];
  createdAt: string;
}
