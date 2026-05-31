# MkulimaLink Kenya – REST API Documentation

**Base URL:** `https://api.mkulimalink.co.ke/api/v1`  
**Content-Type:** `application/json`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Products](#2-products)
3. [Orders](#3-orders)
4. [Payments (M-Pesa)](#4-payments-m-pesa)
5. [Market Prices](#5-market-prices)
6. [Forecasts](#6-forecasts)
7. [Logistics](#7-logistics)
8. [Admin](#8-admin)
9. [Error Codes](#9-error-codes)

---

## 1. Authentication

### Register

```
POST /auth/register
```

**Request body:**
```json
{
  "phone": "+254712345678",
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Kamau",
  "role": "FARMER",
  "county": "Kiambu",
  "subCounty": "Limuru",
  "ward": "Ngecha-Tigoni"
}
```

**Roles:** `FARMER`, `BUYER`, `WHOLESALER`, `RETAILER`, `EXPORTER`, `TRANSPORT_PROVIDER`, `COOPERATIVE_MANAGER`

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your phone.",
  "data": {
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "phone": "+254712345678",
    "requiresPhoneVerification": true
  }
}
```

---

### Verify Phone (OTP)

```
POST /auth/verify-phone
```

```json
{
  "phone": "+254712345678",
  "otp": "123456"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Phone verified successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "a1b2c3d4-...",
      "phone": "+254712345678",
      "firstName": "John",
      "lastName": "Kamau",
      "role": "FARMER",
      "isVerified": true
    }
  }
}
```

---

### Login

```
POST /auth/login
```

```json
{
  "phone": "+254712345678",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "a1b2c3d4-...",
      "phone": "+254712345678",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Kamau",
      "role": "FARMER",
      "county": "Kiambu",
      "isVerified": true,
      "profilePhoto": null,
      "lastLoginAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### Refresh Token

```
POST /auth/refresh
```

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

### Logout

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### Forgot Password

```
POST /auth/forgot-password
```

```json
{
  "phone": "+254712345678"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "OTP sent to your phone number."
}
```

---

### Reset Password

```
POST /auth/reset-password
```

```json
{
  "phone": "+254712345678",
  "otp": "654321",
  "newPassword": "NewSecurePass456!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

### Get Current User

```
GET /auth/me
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "phone": "+254712345678",
    "email": "farmer@example.com",
    "firstName": "John",
    "lastName": "Kamau",
    "role": "FARMER",
    "county": "Kiambu",
    "isVerified": true,
    "farmerProfile": {
      "farmSize": 5.5,
      "farmSizeUnit": "acres",
      "mainCrops": ["maize", "beans"],
      "gpsLat": -1.0988,
      "gpsLng": 36.7125
    }
  }
}
```

---

### Update Profile

```
PATCH /auth/profile
Authorization: Bearer <accessToken>
```

```json
{
  "firstName": "John",
  "lastName": "Kamau Ndegwa",
  "county": "Murang'a",
  "subCounty": "Kigumo"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { "...user object..." }
}
```

---

### Upload Profile Photo

```
POST /auth/profile/photo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| Field | Type | Required |
|-------|------|----------|
| `photo` | file (jpg/png, max 5MB) | Yes |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "profilePhoto": "https://cdn.mkulimalink.co.ke/profiles/a1b2c3d4.jpg"
  }
}
```

---

## 2. Products

### List Products

```
GET /products
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `category` | string | Category slug filter |
| `county` | string | County filter |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `search` | string | Full-text search |
| `status` | string | `ACTIVE` (default), `SOLD_OUT`, `DRAFT` |
| `organic` | boolean | Filter organic products |
| `sortBy` | string | `price_asc`, `price_desc`, `newest`, `popular` |

**Example request:**
```
GET /products?category=vegetables&county=Nairobi&minPrice=100&maxPrice=5000&page=1&limit=20
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-uuid-1",
        "name": "Fresh Tomatoes – Grade A",
        "description": "Sun-ripened tomatoes from Meru highlands.",
        "quantity": 500,
        "unit": "kg",
        "grade": "A",
        "price": 45.00,
        "minOrderQty": 10,
        "county": "Meru",
        "subCounty": "Imenti North",
        "photos": [
          "https://cdn.mkulimalink.co.ke/products/prod-uuid-1-1.jpg"
        ],
        "status": "ACTIVE",
        "organicCertified": false,
        "viewCount": 142,
        "harvestDate": "2024-01-10T00:00:00.000Z",
        "expiryDate": "2024-01-20T00:00:00.000Z",
        "farmer": {
          "id": "farmer-uuid",
          "firstName": "Mary",
          "lastName": "Mwangi",
          "profilePhoto": null,
          "rating": 4.7,
          "totalSales": 38
        },
        "category": {
          "id": "cat-uuid",
          "name": "Vegetables",
          "slug": "vegetables"
        },
        "createdAt": "2024-01-11T08:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 320,
      "page": 1,
      "limit": 20,
      "totalPages": 16,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Product by ID

```
GET /products/:id
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid-1",
    "name": "Fresh Tomatoes – Grade A",
    "quantity": 500,
    "unit": "kg",
    "price": 45.00,
    "county": "Meru",
    "gpsLat": 0.0471,
    "gpsLng": 37.6497,
    "tags": ["tomatoes", "fresh", "grade-a"],
    "farmer": {
      "id": "farmer-uuid",
      "firstName": "Mary",
      "lastName": "Mwangi",
      "phone": "+254722XXXXXX",
      "county": "Meru",
      "farmerProfile": {
        "farmSize": 3.0,
        "mainCrops": ["tomatoes", "onions"],
        "certifications": []
      },
      "rating": 4.7,
      "reviewCount": 21
    },
    "marketPrice": {
      "avgPrice": 48.00,
      "minPrice": 30.00,
      "maxPrice": 65.00
    }
  }
}
```

---

### Create Product

```
POST /products
Authorization: Bearer <accessToken>
```

Requires role: `FARMER`, `WHOLESALER`, `COOPERATIVE_MANAGER`

```json
{
  "categoryId": "cat-uuid-vegetables",
  "name": "Fresh Tomatoes – Grade A",
  "description": "Sun-ripened tomatoes from Meru highlands. No pesticides.",
  "quantity": 500,
  "unit": "kg",
  "grade": "A",
  "price": 45.00,
  "minOrderQty": 10,
  "harvestDate": "2024-01-10",
  "expiryDate": "2024-01-20",
  "county": "Meru",
  "subCounty": "Imenti North",
  "location": "Githongo Market, Meru",
  "gpsLat": 0.0471,
  "gpsLng": 37.6497,
  "organicCertified": false,
  "tags": ["tomatoes", "fresh", "meru"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Product listed successfully.",
  "data": {
    "id": "prod-new-uuid",
    "status": "ACTIVE",
    "...full product object..."
  }
}
```

---

### Upload Product Photos

```
POST /products/:id/photos
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| Field | Type | Notes |
|-------|------|-------|
| `photos` | file[] | Max 5 files, jpg/png, 10MB each |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "photos": [
      "https://cdn.mkulimalink.co.ke/products/prod-uuid-1-1.jpg",
      "https://cdn.mkulimalink.co.ke/products/prod-uuid-1-2.jpg"
    ]
  }
}
```

---

### Update Product

```
PATCH /products/:id
Authorization: Bearer <accessToken>
```

Owners only. Partial update supported.

```json
{
  "price": 42.00,
  "quantity": 350,
  "status": "ACTIVE"
}
```

---

### Delete Product

```
DELETE /products/:id
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Product removed."
}
```

---

### Get My Products

```
GET /products/my
Authorization: Bearer <accessToken>
```

Returns the authenticated farmer's listings with pagination.

---

### Get Categories

```
GET /categories
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Cereals & Grains",
      "slug": "cereals-grains",
      "icon": "🌾",
      "children": [
        { "id": "cat-1-1", "name": "Maize", "slug": "maize" },
        { "id": "cat-1-2", "name": "Wheat", "slug": "wheat" },
        { "id": "cat-1-3", "name": "Sorghum", "slug": "sorghum" }
      ]
    },
    {
      "id": "cat-2",
      "name": "Vegetables",
      "slug": "vegetables",
      "children": [
        { "id": "cat-2-1", "name": "Tomatoes", "slug": "tomatoes" },
        { "id": "cat-2-2", "name": "Onions", "slug": "onions" },
        { "id": "cat-2-3", "name": "Cabbages", "slug": "cabbages" },
        { "id": "cat-2-4", "name": "Potatoes", "slug": "potatoes" }
      ]
    }
  ]
}
```

---

## 3. Orders

### Create Order

```
POST /orders
Authorization: Bearer <accessToken>
```

Requires role: `BUYER`, `WHOLESALER`, `RETAILER`, `EXPORTER`

```json
{
  "farmerId": "farmer-uuid",
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 100,
      "unit": "kg"
    },
    {
      "productId": "prod-uuid-2",
      "quantity": 50,
      "unit": "kg"
    }
  ],
  "deliveryAddress": "Wakulima Market, Haile Selassie Avenue, Nairobi",
  "deliveryLat": -1.2854,
  "deliveryLng": 36.8217,
  "notes": "Please deliver before 8am.",
  "transportProviderId": "transport-uuid"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": "order-uuid-1",
    "status": "PENDING",
    "totalAmount": 6250.00,
    "deliveryFee": 500.00,
    "platformFee": 187.50,
    "paymentStatus": "PENDING",
    "items": [
      {
        "productId": "prod-uuid-1",
        "productName": "Fresh Tomatoes – Grade A",
        "quantity": 100,
        "unit": "kg",
        "unitPrice": 45.00,
        "totalPrice": 4500.00
      },
      {
        "productId": "prod-uuid-2",
        "productName": "Red Onions",
        "quantity": 50,
        "unit": "kg",
        "unitPrice": 35.00,
        "totalPrice": 1750.00
      }
    ],
    "expectedDeliveryDate": "2024-01-16T06:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### List Orders

```
GET /orders
Authorization: Bearer <accessToken>
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by order status |
| `role` | string | `buyer` or `farmer` (default: current user's role) |
| `page` | integer | Page number |
| `limit` | integer | Page size |
| `from` | date | Start date filter (ISO 8601) |
| `to` | date | End date filter (ISO 8601) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid-1",
        "status": "CONFIRMED",
        "totalAmount": 6250.00,
        "paymentStatus": "COMPLETED",
        "itemCount": 2,
        "buyer": { "id": "...", "firstName": "Peter", "lastName": "Njoroge" },
        "farmer": { "id": "...", "firstName": "Mary", "lastName": "Mwangi" },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
  }
}
```

---

### Get Order by ID

```
GET /orders/:id
Authorization: Bearer <accessToken>
```

Returns full order detail including items, payment, and delivery.

---

### Update Order Status

```
PATCH /orders/:id/status
Authorization: Bearer <accessToken>
```

**Status transitions:**

| Actor | From | To |
|-------|------|----|
| Farmer | `PENDING` | `CONFIRMED` or `CANCELLED` |
| Farmer | `CONFIRMED` | `PROCESSING` |
| Farmer | `PROCESSING` | `READY_FOR_PICKUP` |
| Transport | `READY_FOR_PICKUP` | `IN_TRANSIT` |
| Transport | `IN_TRANSIT` | `DELIVERED` |
| Buyer | `DELIVERED` | `COMPLETED` or `DISPUTED` |
| Buyer | Any | `CANCELLED` (with reason) |

```json
{
  "status": "CONFIRMED",
  "note": "Will prepare by tomorrow morning."
}
```

---

### Cancel Order

```
POST /orders/:id/cancel
Authorization: Bearer <accessToken>
```

```json
{
  "reason": "Product no longer available in required quantity."
}
```

---

### Submit Review

```
POST /orders/:id/review
Authorization: Bearer <accessToken>
```

```json
{
  "rating": 5,
  "comment": "Excellent quality tomatoes, delivered on time.",
  "type": "BUYER_TO_FARMER"
}
```

---

## 4. Payments (M-Pesa)

### Initiate STK Push

Triggers an M-Pesa Lipa Na M-Pesa (STK) push to the buyer's phone.

```
POST /payments/mpesa/stk-push
Authorization: Bearer <accessToken>
```

```json
{
  "orderId": "order-uuid-1",
  "phoneNumber": "+254712345678",
  "amount": 6937.50
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "STK push sent. Enter your M-Pesa PIN to complete payment.",
  "data": {
    "paymentId": "pay-uuid-1",
    "checkoutRequestId": "ws_CO_150120241000000001234567890",
    "merchantRequestId": "29115-34620561-1",
    "responseDescription": "Success. Request accepted for processing."
  }
}
```

---

### Check Payment Status

```
GET /payments/:paymentId/status
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay-uuid-1",
    "orderId": "order-uuid-1",
    "status": "COMPLETED",
    "amount": 6937.50,
    "method": "MPESA_STK",
    "mpesaReceiptNumber": "PGH57WLKOB",
    "mpesaTransactionId": "PGH57WLKOB",
    "completedAt": "2024-01-15T10:02:35.000Z"
  }
}
```

---

### M-Pesa STK Callback (Webhook)

This endpoint is called by Safaricom's Daraja API. Do not call directly.

```
POST /payments/mpesa/callback
```

**Daraja STK callback body (success):**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_150120241000000001234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 6937.50 },
          { "Name": "MpesaReceiptNumber", "Value": "PGH57WLKOB" },
          { "Name": "TransactionDate", "Value": 20240115100235 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

---

### M-Pesa B2C Payout (Farmer Disbursement)

```
POST /payments/mpesa/b2c
Authorization: Bearer <accessToken>
```

Requires role: `ADMIN`, `SUPER_ADMIN`

```json
{
  "orderId": "order-uuid-1",
  "farmerPhone": "+254722987654",
  "amount": 6250.00,
  "remarks": "Payment for order order-uuid-1"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "B2C payout initiated.",
  "data": {
    "conversationId": "AG_20240115_123456789abcdef",
    "originatorConversationId": "10571-7910404-1"
  }
}
```

---

### Get Payment History

```
GET /payments
Authorization: Bearer <accessToken>
```

Returns the authenticated user's payment transactions.

---

## 5. Market Prices

### Get Market Prices

```
GET /market-prices
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `product` | string | Product name (partial match) |
| `county` | string | County name |
| `category` | string | Category filter |
| `from` | date | Start date (ISO 8601) |
| `to` | date | End date (ISO 8601) |
| `page` | integer | Page number |
| `limit` | integer | Page size |

**Example:**
```
GET /market-prices?product=maize&county=Uasin+Gishu&from=2024-01-01&to=2024-01-15
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "prices": [
      {
        "id": "mp-uuid-1",
        "productName": "Maize",
        "category": "cereals",
        "county": "Uasin Gishu",
        "price": 35.00,
        "minPrice": 30.00,
        "maxPrice": 42.00,
        "avgPrice": 36.50,
        "unit": "kg",
        "date": "2024-01-15",
        "source": "KACE"
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

---

### Get Price Summary by County

```
GET /market-prices/summary
```

**Query parameters:** `product` (required), `date` (default: today)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "product": "Maize",
    "date": "2024-01-15",
    "counties": [
      {
        "county": "Uasin Gishu",
        "avgPrice": 36.50,
        "minPrice": 30.00,
        "maxPrice": 42.00,
        "unit": "kg"
      },
      {
        "county": "Trans Nzoia",
        "avgPrice": 34.00,
        "minPrice": 28.00,
        "maxPrice": 40.00,
        "unit": "kg"
      }
    ],
    "national": {
      "avgPrice": 38.20,
      "minPrice": 28.00,
      "maxPrice": 55.00
    }
  }
}
```

---

### Get Price Trends

```
GET /market-prices/trends
```

**Query parameters:** `product` (required), `county`, `days` (default: 30)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "product": "Tomatoes",
    "county": "Meru",
    "period": "30 days",
    "trend": "rising",
    "changePercent": 12.5,
    "dataPoints": [
      { "date": "2023-12-16", "avgPrice": 38.00 },
      { "date": "2023-12-23", "avgPrice": 40.00 },
      { "date": "2023-12-30", "avgPrice": 42.00 },
      { "date": "2024-01-07", "avgPrice": 45.00 },
      { "date": "2024-01-15", "avgPrice": 47.50 }
    ]
  }
}
```

---

### Create Market Price (Admin/Data Entry)

```
POST /market-prices
Authorization: Bearer <accessToken>
```

Requires role: `ADMIN`, `SUPER_ADMIN`

```json
{
  "productName": "Maize",
  "category": "cereals",
  "county": "Uasin Gishu",
  "price": 35.00,
  "minPrice": 30.00,
  "maxPrice": 42.00,
  "avgPrice": 36.50,
  "unit": "kg",
  "date": "2024-01-15",
  "source": "KACE"
}
```

---

### Set Price Alert

```
POST /market-prices/alerts
Authorization: Bearer <accessToken>
```

```json
{
  "productName": "Maize",
  "county": "Uasin Gishu",
  "targetPrice": 50.00,
  "condition": "above"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Price alert created. You will be notified when maize price rises above KES 50/kg in Uasin Gishu.",
  "data": {
    "alertId": "alert-uuid-1",
    "productName": "Maize",
    "county": "Uasin Gishu",
    "targetPrice": 50.00,
    "condition": "above",
    "isActive": true
  }
}
```

---

## 6. Forecasts

### Get Price Forecast

```
GET /forecasts/prices
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `product` | string | Product name (required) |
| `county` | string | County name |
| `days` | integer | Forecast horizon in days (default: 14, max: 90) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "product": "Potatoes",
    "county": "Nyandarua",
    "model": "linear_regression",
    "generatedAt": "2024-01-15T06:00:00.000Z",
    "forecasts": [
      {
        "date": "2024-01-16",
        "predictedPrice": 28.50,
        "confidence": 0.82,
        "factors": {
          "seasonalIndex": 0.95,
          "rainfallImpact": "positive",
          "marketSupply": "high"
        }
      },
      {
        "date": "2024-01-17",
        "predictedPrice": 27.80,
        "confidence": 0.79,
        "factors": {}
      }
    ],
    "recommendation": "Prices expected to decline slightly over the next 2 weeks due to harvest season. Consider selling soon."
  }
}
```

---

### Get Weather Data

```
GET /weather
```

**Query parameters:** `county` (required)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "county": "Kisumu",
    "current": {
      "temperature": 28.5,
      "humidity": 72,
      "rainfall": 0,
      "windSpeed": 12.4,
      "condition": "Partly Cloudy",
      "recordedAt": "2024-01-15T10:00:00.000Z"
    },
    "forecast": [
      {
        "date": "2024-01-16",
        "minTemp": 19.0,
        "maxTemp": 30.5,
        "rainfall": 5.2,
        "condition": "Light Rain",
        "humidity": 80
      },
      {
        "date": "2024-01-17",
        "minTemp": 20.0,
        "maxTemp": 29.0,
        "rainfall": 12.5,
        "condition": "Moderate Rain",
        "humidity": 85
      }
    ],
    "alert": {
      "severity": "WATCH",
      "message": "Heavy rainfall expected on Jan 18-19. Plan harvest activities accordingly."
    }
  }
}
```

---

### Get Knowledge Articles

```
GET /knowledge
```

**Query parameters:** `category`, `search`, `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article-uuid",
        "title": "Managing Tomato Blight in Kenya's Highlands",
        "summary": "Practical steps to identify and control early and late blight in tomatoes.",
        "category": "pest_management",
        "tags": ["tomatoes", "blight", "fungicide", "highlands"],
        "viewCount": 1243,
        "publishedAt": "2024-01-05T00:00:00.000Z",
        "author": { "firstName": "Dr. Esther", "lastName": "Wanjiku" }
      }
    ],
    "pagination": { "total": 87, "page": 1, "limit": 20, "totalPages": 5 }
  }
}
```

---

### Get Article by ID

```
GET /knowledge/:id
```

Returns full article content with media URLs.

---

## 7. Logistics

### Find Transport Providers

```
GET /logistics/transport
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `county` | string | Service county |
| `vehicleType` | string | `pickup`, `lorry`, `van`, `refrigerated_truck` |
| `capacity` | number | Minimum capacity in tonnes |
| `refrigeration` | boolean | Requires refrigeration |
| `available` | boolean | Available now (default: true) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "tp-uuid-1",
        "vehicleType": "lorry",
        "vehicleReg": "KDA 123A",
        "capacity": 5.0,
        "capacityUnit": "tonnes",
        "hasRefrigeration": false,
        "counties": ["Meru", "Nyeri", "Nairobi"],
        "pricePerKm": 85.00,
        "rating": 4.5,
        "totalDeliveries": 127,
        "available": true,
        "user": {
          "firstName": "James",
          "lastName": "Kariuki",
          "phone": "+254733XXXXXX",
          "county": "Meru"
        }
      }
    ]
  }
}
```

---

### Get Delivery Quote

```
POST /logistics/quote
Authorization: Bearer <accessToken>
```

```json
{
  "pickupCounty": "Meru",
  "pickupLat": 0.0471,
  "pickupLng": 37.6497,
  "deliveryLat": -1.2854,
  "deliveryLng": 36.8217,
  "weight": 100,
  "weightUnit": "kg",
  "requiresRefrigeration": false
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "distance": 247.3,
    "distanceUnit": "km",
    "estimatedDuration": "4h 30m",
    "quotes": [
      {
        "providerId": "tp-uuid-1",
        "providerName": "James Kariuki",
        "vehicleType": "lorry",
        "estimatedCost": 21020.50,
        "currency": "KES",
        "rating": 4.5,
        "eta": "2024-01-16T06:00:00.000Z"
      }
    ]
  }
}
```

---

### Track Delivery

```
GET /logistics/deliveries/:trackingCode
```

Public endpoint – no auth required.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "trackingCode": "ML-TRK-20240115-001",
    "status": "IN_TRANSIT",
    "order": {
      "id": "order-uuid-1",
      "items": ["Fresh Tomatoes (100kg)", "Red Onions (50kg)"]
    },
    "driver": {
      "firstName": "James",
      "vehicle": "KDA 123A – Lorry"
    },
    "pickupAddress": "Githongo Market, Meru",
    "deliveryAddress": "Wakulima Market, Nairobi",
    "estimatedArrival": "2024-01-16T06:00:00.000Z",
    "currentLocation": {
      "lat": -0.3031,
      "lng": 36.8012,
      "updatedAt": "2024-01-15T14:30:00.000Z"
    },
    "trackingHistory": [
      {
        "status": "PICKED_UP",
        "location": "Githongo Market, Meru",
        "timestamp": "2024-01-15T06:00:00.000Z"
      },
      {
        "status": "IN_TRANSIT",
        "location": "Karatina, Nyeri",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### List Warehouses

```
GET /logistics/warehouses
```

**Query parameters:** `county`, `minCapacity`, `available`, `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "warehouses": [
      {
        "id": "wh-uuid-1",
        "name": "Eldoret Cold Storage",
        "county": "Uasin Gishu",
        "location": "Industrial Area, Eldoret",
        "capacity": 500,
        "capacityUnit": "tonnes",
        "usedCapacity": 310,
        "availableCapacity": 190,
        "pricePerUnit": 1500.00,
        "pricePeriod": "per_month",
        "facilities": ["cold_storage", "security", "loading_dock", "fumigation"],
        "rating": 4.3,
        "photos": ["https://cdn.mkulimalink.co.ke/warehouses/wh-uuid-1.jpg"]
      }
    ]
  }
}
```

---

## 8. Admin

All admin endpoints require role: `ADMIN` or `SUPER_ADMIN`.

### Dashboard Statistics

```
GET /admin/stats
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 12450,
      "farmers": 8320,
      "buyers": 3100,
      "transportProviders": 540,
      "newThisMonth": 234,
      "activeToday": 1205
    },
    "orders": {
      "total": 45230,
      "thisMonth": 3420,
      "pending": 142,
      "inTransit": 87,
      "completedThisMonth": 3180,
      "cancelledThisMonth": 98
    },
    "revenue": {
      "totalGMV": 287450000,
      "thisMonthGMV": 18430000,
      "platformFees": 8623500,
      "thisMonthFees": 552900
    },
    "products": {
      "total": 8943,
      "active": 7201,
      "newThisMonth": 412
    }
  }
}
```

---

### List Users

```
GET /admin/users
Authorization: Bearer <accessToken>
```

**Query parameters:** `role`, `county`, `isVerified`, `isActive`, `search`, `page`, `limit`

---

### Get User Detail

```
GET /admin/users/:id
Authorization: Bearer <accessToken>
```

Returns full user profile including orders, payments, and activity.

---

### Suspend / Activate User

```
PATCH /admin/users/:id/status
Authorization: Bearer <accessToken>
```

```json
{
  "isActive": false,
  "reason": "Violation of platform terms – fraudulent listings."
}
```

---

### Verify User

```
POST /admin/users/:id/verify
Authorization: Bearer <accessToken>
```

Manually marks a user as verified (e.g., after KYC document review).

---

### Moderate Product

```
PATCH /admin/products/:id/moderate
Authorization: Bearer <accessToken>
```

```json
{
  "status": "SUSPENDED",
  "reason": "Price manipulation detected."
}
```

---

### Resolve Dispute

```
POST /admin/orders/:id/resolve-dispute
Authorization: Bearer <accessToken>
```

```json
{
  "resolution": "REFUND",
  "amount": 4500.00,
  "notes": "Product quality did not match listing. Full refund approved."
}
```

---

### List Reports

```
GET /admin/reports
Authorization: Bearer <accessToken>
```

**Query parameters:** `type` (`revenue`, `orders`, `users`, `products`), `from`, `to`, `county`, `format` (`json`, `csv`)

---

### Broadcast Notification

```
POST /admin/notifications/broadcast
Authorization: Bearer <accessToken>
```

```json
{
  "title": "Platform Maintenance",
  "message": "MkulimaLink will be unavailable on Jan 20 from 2am–4am EAT for scheduled maintenance.",
  "type": "SYSTEM",
  "targetRoles": ["FARMER", "BUYER"],
  "targetCounties": []
}
```

---

### Publish Advisory

```
POST /admin/advisories
Authorization: Bearer <accessToken>
```

```json
{
  "title": "Fall Armyworm Alert – Rift Valley",
  "content": "Fall armyworm infestations reported across maize farms in Uasin Gishu, Trans Nzoia, and Nandi counties. Farmers are advised to...",
  "category": "pest_disease",
  "county": "Uasin Gishu",
  "severity": "WARNING",
  "tags": ["fall-armyworm", "maize", "rift-valley"],
  "isPublished": true
}
```

---

## 9. Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK – Request succeeded |
| `201` | Created – Resource created |
| `400` | Bad Request – Validation error or malformed request |
| `401` | Unauthorized – Missing or invalid token |
| `403` | Forbidden – Authenticated but insufficient permissions |
| `404` | Not Found – Resource does not exist |
| `409` | Conflict – Duplicate resource (e.g., phone already registered) |
| `422` | Unprocessable Entity – Business rule violation |
| `429` | Too Many Requests – Rate limit exceeded |
| `500` | Internal Server Error – Unexpected server error |
| `503` | Service Unavailable – Downstream service failure |

### Application Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Account not verified |
| `AUTH_003` | Account suspended |
| `AUTH_004` | Token expired |
| `AUTH_005` | Invalid or expired OTP |
| `AUTH_006` | Phone number already registered |
| `PRODUCT_001` | Product not found |
| `PRODUCT_002` | Insufficient stock |
| `PRODUCT_003` | Product not available in this county |
| `ORDER_001` | Order not found |
| `ORDER_002` | Invalid order status transition |
| `ORDER_003` | Order already cancelled |
| `ORDER_004` | Minimum order quantity not met |
| `PAYMENT_001` | Payment not found |
| `PAYMENT_002` | STK push failed (M-Pesa error) |
| `PAYMENT_003` | Payment already completed |
| `PAYMENT_004` | Insufficient M-Pesa balance |
| `PAYMENT_005` | M-Pesa timeout – transaction not completed |
| `LOGISTICS_001` | Transport provider not available |
| `LOGISTICS_002` | Delivery route not serviceable |
| `UPLOAD_001` | File too large (max 10MB) |
| `UPLOAD_002` | Unsupported file type |
| `RATE_001` | Rate limit exceeded – try again in 15 minutes |

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ORDER_002",
    "message": "Cannot transition order from PENDING to DELIVERED.",
    "details": {
      "currentStatus": "PENDING",
      "requestedStatus": "DELIVERED",
      "allowedTransitions": ["CONFIRMED", "CANCELLED"]
    }
  }
}
```

### Validation Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "phone": "Phone number must be in the format +254XXXXXXXXX",
      "price": "Price must be a positive number",
      "quantity": "Quantity cannot exceed available stock"
    }
  }
}
```

---

## Pagination

All list endpoints return a consistent pagination object:

```json
{
  "pagination": {
    "total": 320,
    "page": 1,
    "limit": 20,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Rate Limiting

| Endpoint Group | Limit |
|----------------|-------|
| Authentication | 10 requests / 15 min per IP |
| General API | 100 requests / 15 min per user |
| File uploads | 20 requests / hour per user |
| M-Pesa STK push | 5 requests / minute per user |
| Admin endpoints | 200 requests / 15 min per admin |

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705315200
```
