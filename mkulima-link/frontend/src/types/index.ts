export type UserRole = 'FARMER' | 'BUYER' | 'WHOLESALER' | 'RETAILER' | 'EXPORTER' | 'TRANSPORT_PROVIDER' | 'COOPERATIVE_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'SUSPENDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'MPESA_STK' | 'MPESA_B2C' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
export type NotificationType = 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PRICE_ALERT' | 'WEATHER' | 'ADVISORY' | 'SYSTEM' | 'PROMOTION';

export interface User {
  id: string; email?: string; phone: string; firstName: string; lastName: string;
  role: UserRole; county: string; subCounty?: string; isVerified: boolean; isActive: boolean;
  profilePhoto?: string; createdAt: string;
  farmerProfile?: FarmerProfile; buyerProfile?: BuyerProfile; transportProvider?: TransportProvider;
}

export interface FarmerProfile {
  id: string; userId: string; farmSize?: number; farmSizeUnit?: string; farmLocation?: string;
  gpsLat?: number; gpsLng?: number; mainCrops: string[]; livestockTypes: string[];
  farmPhotos: string[]; bio?: string; irrigationType?: string; soilType?: string; certifications: string[];
}

export interface BuyerProfile {
  id: string; userId: string; businessName?: string; businessType?: string; kraPin?: string;
  businessAddress?: string; preferredProducts: string[]; monthlyBudget?: number;
}

export interface TransportProvider {
  id: string; userId: string; vehicleType: string; vehicleReg: string; capacity: number;
  capacityUnit: string; hasRefrigeration: boolean; counties: string[]; pricePerKm: number;
  available: boolean; rating: number; totalDeliveries: number;
  user?: { firstName: string; lastName: string; phone: string; profilePhoto?: string };
}

export interface Category {
  id: string; name: string; slug: string; icon?: string; description?: string;
  parentId?: string; children?: Category[]; _count?: { products: number };
}

export interface Product {
  id: string; farmerId: string; categoryId: string; category: Category; name: string;
  description?: string; quantity: number; unit: string; grade?: string; price: number;
  minOrderQty: number; harvestDate?: string; expiryDate?: string; county: string;
  subCounty?: string; location?: string; gpsLat?: number; gpsLng?: number; photos: string[];
  status: ProductStatus; organicCertified: boolean; viewCount: number; isFeatured: boolean;
  tags: string[]; createdAt: string;
  farmer?: { id: string; firstName: string; lastName: string; county: string; profilePhoto?: string; farmerProfile?: Partial<FarmerProfile> };
}

export interface OrderItem {
  id: string; productId: string; product: Partial<Product>; quantity: number;
  unitPrice: number; totalPrice: number; unit: string;
}

export interface Order {
  id: string; buyerId: string; farmerId: string; status: OrderStatus; totalAmount: number;
  notes?: string; deliveryAddress?: string; deliveryFee?: number; paymentStatus: PaymentStatus;
  createdAt: string; updatedAt: string; items: OrderItem[];
  buyer?: Partial<User>; farmer?: Partial<User>; payments?: Payment[]; delivery?: Delivery;
}

export interface Payment {
  id: string; orderId: string; userId: string; amount: number; method: PaymentMethod;
  status: PaymentStatus; mpesaReceiptNumber?: string; phoneNumber?: string; createdAt: string;
}

export interface Delivery {
  id: string; orderId: string; status: DeliveryStatus; trackingCode?: string; distance?: number;
  estimatedArrival?: string; currentLat?: number; currentLng?: number;
  trackingHistory: Array<{ status: string; timestamp: string; message?: string }>;
  transportProvider?: Partial<TransportProvider>;
}

export interface Notification {
  id: string; userId: string; title: string; message: string; type: NotificationType;
  read: boolean; data?: Record<string, unknown>; createdAt: string;
}

export interface MarketPrice {
  id: string; productName: string; category: string; county: string; price: number;
  unit: string; date: string; source: string; minPrice?: number; maxPrice?: number; avgPrice?: number;
}

export interface PriceForecast {
  productName: string; county: string;
  forecasts: Array<{ date: string; predictedPrice: number; confidence: number; trend: string; factors: Record<string, unknown> }>;
  historicalAvg: number; currentTrend: string; seasonalOutlook: string;
}

export interface WeatherData {
  county: string; temperature: number; feelsLike: number; humidity: number; rainfall: number;
  windSpeed: number; condition: string; icon: string;
  forecast: Array<{ date: string; tempMin: number; tempMax: number; condition: string; rainfall: number }>;
  recordedAt: string;
}

export interface Advisory {
  id: string; title: string; content: string; category: string; county?: string;
  severity: string; tags: string[]; publishedAt?: string; viewCount: number;
  officer: { firstName: string; lastName: string; profilePhoto?: string };
}

export interface ApiResponse<T> { success: boolean; message?: string; data: T; }

export const KENYA_COUNTIES = [
  'Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita Taveta','Garissa','Wajir','Mandera',
  'Marsabit','Isiolo','Meru','Tharaka Nithi','Embu','Kitui','Machakos','Makueni','Nyandarua',
  'Nyeri','Kirinyaga',"Murang'a",'Kiambu','Turkana','West Pokot','Samburu','Trans Nzoia',
  'Uasin Gishu','Elgeyo Marakwet','Nandi','Baringo','Laikipia','Nakuru','Narok','Kajiado',
  'Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia','Siaya','Kisumu','Homa Bay',
  'Migori','Kisii','Nyamira','Nairobi',
] as const;

export type KenyaCounty = typeof KENYA_COUNTIES[number];
