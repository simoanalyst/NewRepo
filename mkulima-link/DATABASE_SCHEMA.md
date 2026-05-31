# MkulimaLink Kenya – Database Schema Documentation

**Database:** PostgreSQL 15  
**ORM:** Prisma 5.x  
**Schema file:** `backend/prisma/schema.prisma`

---

## Table of Contents

1. [ER Diagram](#1-er-diagram)
2. [Table Descriptions](#2-table-descriptions)
3. [Relationships](#3-relationships)
4. [Indexes](#4-indexes)
5. [Constraints](#5-constraints)
6. [Enumerations](#6-enumerations)

---

## 1. ER Diagram

```
┌─────────────────────────┐
│          users          │
│─────────────────────────│
│ id (PK)                 │
│ email (UQ)              │
│ phone (UQ)              │
│ password_hash           │
│ role                    │
│ first_name              │
│ last_name               │
│ national_id (UQ)        │
│ county                  │
│ sub_county              │
│ ward                    │
│ is_verified             │
│ is_active               │
│ profile_photo           │
│ last_login_at           │
│ created_at              │
│ updated_at              │
└─────────┬───────────────┘
          │ 1
          │
    ┌─────┴─────────────────────────────────────────────────────┐
    │                                                           │
    │ 0..1                                                 0..1 │
    ▼                                                           ▼
┌───────────────┐                                   ┌───────────────────┐
│ farmer_       │                                   │  buyer_profiles   │
│ profiles      │                                   │───────────────────│
│───────────────│                                   │ id (PK)           │
│ id (PK)       │                                   │ user_id (FK, UQ)  │
│ user_id(FK,UQ)│                                   │ business_name     │
│ farm_size     │                                   │ business_type     │
│ farm_location │                                   │ kra_pin           │
│ gps_lat       │                                   │ monthly_budget    │
│ gps_lng       │                                   └───────────────────┘
│ main_crops[]  │
│ certifications│
└───────────────┘

          │ (users)
          │ 1
          │
    ┌─────┴──────────┬──────────────────────────────────────────────────────────┐
    │                │                                                          │
  0..N            0..1                                                       0..N
    ▼                ▼                                                          ▼
┌──────────┐  ┌───────────────────┐                              ┌──────────────────────┐
│ products │  │ transport_        │                              │  notifications       │
│──────────│  │ providers         │                              │──────────────────────│
│ id (PK)  │  │───────────────────│                              │ id (PK)              │
│ farmer_id│  │ id (PK)           │                              │ user_id (FK)         │
│ category_│  │ user_id (FK, UQ)  │                              │ title                │
│ id (FK)  │  │ vehicle_type      │                              │ message              │
│ name     │  │ vehicle_reg (UQ)  │                              │ type                 │
│ quantity │  │ capacity          │                              │ read                 │
│ unit     │  │ price_per_km      │                              │ data (JSON)          │
│ price    │  │ counties[]        │                              └──────────────────────┘
│ county   │  │ rating            │
│ status   │  └────────┬──────────┘
│ photos[] │           │
└────┬─────┘         0..N
     │                 │
  0..N                 ▼
     │          ┌────────────┐
     ▼          │ deliveries │
┌─────────────┐ │────────────│
│ order_items │ │ id (PK)    │
│─────────────│ │ order_id   │
│ id (PK)     │ │ (FK, UQ)   │
│ order_id(FK)│ │ transport_ │
│ product_id  │ │ provider_id│
│ (FK)        │ │ driver_id  │
│ quantity    │ │ status     │
│ unit_price  │ │ tracking_  │
│ total_price │ │ code (UQ)  │
└─────────────┘ │ tracking_  │
                │ history[]  │
                └─────┬──────┘
                      │ 1..1
                      │
┌─────────────────────▼──────────────────────────────────────────────────────┐
│                              orders                                         │
│────────────────────────────────────────────────────────────────────────────│
│ id (PK)                                                                    │
│ buyer_id (FK) ──────────────────────────────────────────────► users        │
│ farmer_id (FK) ─────────────────────────────────────────────► users        │
│ transport_provider_id (FK, nullable) ──────────────────────► transport_    │
│                                                               providers    │
│ status                                                                     │
│ total_amount                                                               │
│ delivery_fee                                                               │
│ platform_fee                                                               │
│ payment_status                                                             │
│ delivery_address                                                           │
│ expected_delivery_date                                                     │
│ created_at / updated_at                                                    │
└─────────────────────┬──────────────────────────────────────────────────────┘
                      │
          ┌───────────┼────────────┐
        0..N        0..N         0..N
          ▼           ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ payments │ │ reviews  │ │order_    │
    │──────────│ │──────────│ │items     │
    │ id (PK)  │ │ id (PK)  │ │(see above│
    │ order_id │ │ reviewer │ │          │
    │ user_id  │ │ _id (FK) │ └──────────┘
    │ amount   │ │ reviewee │
    │ method   │ │ _id (FK) │
    │ status   │ │ rating   │
    │ mpesa_   │ │ type     │
    │ receipt_ │ │ comment  │
    │ number   │ └──────────┘
    └──────────┘

┌────────────────┐         ┌───────────────────┐
│  categories    │         │  market_prices    │
│────────────────│         │───────────────────│
│ id (PK)        │         │ id (PK)           │
│ name (UQ)      │         │ product_name      │
│ slug (UQ)      │         │ category          │
│ icon           │         │ county            │
│ parent_id (FK) │◄────┐   │ price             │
│ (self-ref)     │     │   │ min_price         │
└────────┬───────┘     │   │ max_price         │
         │             │   │ avg_price         │
       0..N            │   │ unit              │
         │             │   │ date              │
         ▼             │   │ source            │
    (products)         │   └───────────────────┘
                       │
                  (categories)   ┌───────────────────┐
                  self-ref       │  price_forecasts  │
                                 │───────────────────│
                                 │ id (PK)           │
                                 │ product_name      │
                                 │ county            │
                                 │ predicted_price   │
                                 │ forecast_date     │
                                 │ confidence        │
                                 │ model             │
                                 └───────────────────┘

┌─────────────────────────┐    ┌──────────────────────────┐
│  cooperative_societies  │    │   cooperative_members    │
│─────────────────────────│    │──────────────────────────│
│ id (PK)                 │◄───│ cooperative_id (FK)      │
│ name                    │    │ user_id (FK) ───► users  │
│ registration_no (UQ)    │    │ membership_no            │
│ county                  │    │ joined_at                │
│ manager_id (FK,UQ)►users│    │ is_active                │
│ description             │    │ UQ(cooperative_id,user_id│
└─────────────────────────┘    └──────────────────────────┘

┌───────────────────┐    ┌──────────────────────────┐
│   warehouses      │    │   knowledge_articles     │
│───────────────────│    │──────────────────────────│
│ id (PK)           │    │ id (PK)                  │
│ owner_id (FK)     │    │ author_id (FK) ──► users │
│ name              │    │ title                    │
│ county            │    │ content                  │
│ capacity          │    │ category                 │
│ used_capacity     │    │ tags[]                   │
│ price_per_unit    │    │ is_published             │
│ facilities[]      │    │ view_count               │
└───────────────────┘    └──────────────────────────┘

┌───────────────────┐    ┌───────────────┐    ┌──────────────┐
│   advisories      │    │ weather_data  │    │ price_alerts │
│───────────────────│    │───────────────│    │──────────────│
│ id (PK)           │    │ id (PK)       │    │ id (PK)      │
│ officer_id (FK)   │    │ county        │    │ user_id      │
│ title             │    │ temperature   │    │ product_name │
│ content           │    │ humidity      │    │ county       │
│ severity          │    │ rainfall      │    │ target_price │
│ county            │    │ condition     │    │ condition    │
│ is_published      │    │ forecast(JSON)│    │ is_active    │
└───────────────────┘    └───────────────┘    └──────────────┘

┌────────────────┐
│   otp_tokens   │
│────────────────│
│ id (PK)        │
│ user_id (FK)   │
│ token          │
│ type           │
│ expires_at     │
│ used           │
└────────────────┘
```

---

## 2. Table Descriptions

### users

Central identity table. Every person on the platform – farmers, buyers, transport providers, admins – has exactly one row here.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | No | Primary key (uuid v4) |
| `email` | VARCHAR | Yes | Optional email address |
| `phone` | VARCHAR | No | Kenyan phone number, unique |
| `password_hash` | VARCHAR | No | bcrypt hash of password |
| `role` | UserRole (enum) | No | User's primary role on the platform |
| `first_name` | VARCHAR | No | Given name |
| `last_name` | VARCHAR | No | Family name |
| `national_id` | VARCHAR | Yes | Kenya National ID number |
| `county` | VARCHAR | No | One of Kenya's 47 counties |
| `sub_county` | VARCHAR | Yes | Sub-county within the county |
| `ward` | VARCHAR | Yes | Administrative ward |
| `is_verified` | BOOLEAN | No | True after phone/KYC verification |
| `is_active` | BOOLEAN | No | False = suspended account |
| `profile_photo` | VARCHAR | Yes | URL to profile photo (CloudFront) |
| `email_verified_at` | TIMESTAMPTZ | Yes | Timestamp of email verification |
| `phone_verified_at` | TIMESTAMPTZ | Yes | Timestamp of phone OTP verification |
| `last_login_at` | TIMESTAMPTZ | Yes | Last successful login timestamp |
| `created_at` | TIMESTAMPTZ | No | Row creation time |
| `updated_at` | TIMESTAMPTZ | No | Last update time |

---

### farmer_profiles

Extended profile data for users with role `FARMER` or `COOPERATIVE_MANAGER`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users (unique: one profile per user) |
| `farm_size` | FLOAT | Numeric size of farm |
| `farm_size_unit` | VARCHAR | `acres`, `hectares` (default: `acres`) |
| `farm_location` | VARCHAR | Human-readable farm location |
| `gps_lat` | FLOAT | Farm GPS latitude |
| `gps_lng` | FLOAT | Farm GPS longitude |
| `main_crops` | VARCHAR[] | Array of primary crops |
| `livestock_types` | VARCHAR[] | Array of livestock types kept |
| `farm_photos` | VARCHAR[] | Array of CloudFront photo URLs |
| `bio` | TEXT | Free-text farmer bio |
| `irrigation_type` | VARCHAR | `rainfed`, `drip`, `overhead`, `furrow` |
| `soil_type` | VARCHAR | `clay`, `sandy`, `loam`, `silt` |
| `certifications` | VARCHAR[] | Certification names/numbers |

---

### buyer_profiles

Extended profile for `BUYER`, `WHOLESALER`, `RETAILER`, `EXPORTER` roles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `business_name` | VARCHAR | Company or trading name |
| `business_type` | VARCHAR | `restaurant`, `supermarket`, `exporter`, `hotel`, etc. |
| `kra_pin` | VARCHAR | Kenya Revenue Authority PIN |
| `business_address` | VARCHAR | Physical address |
| `business_license` | VARCHAR | Business registration number |
| `preferred_products` | VARCHAR[] | Product categories of interest |
| `monthly_budget` | FLOAT | Estimated monthly spend (KES) |

---

### transport_providers

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `vehicle_type` | VARCHAR | `pickup`, `lorry`, `van`, `trailer`, `refrigerated_truck` |
| `vehicle_reg` | VARCHAR | Vehicle registration plate (unique) |
| `capacity` | FLOAT | Maximum load |
| `capacity_unit` | VARCHAR | Default: `tonnes` |
| `has_refrigeration` | BOOLEAN | Whether vehicle has cold chain |
| `counties` | VARCHAR[] | Counties where provider operates |
| `price_per_km` | FLOAT | Quoted rate per kilometre (KES) |
| `available` | BOOLEAN | Current availability |
| `rating` | FLOAT | Average rating (0–5) |
| `total_deliveries` | INT | Lifetime completed deliveries |
| `license_number` | VARCHAR | Transport operating licence number |
| `insurance_expiry` | TIMESTAMPTZ | Vehicle insurance expiry date |
| `current_lat` | FLOAT | Live GPS latitude (updated by mobile app) |
| `current_lng` | FLOAT | Live GPS longitude |

---

### categories

Hierarchical product category tree (max two levels: parent → child).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR | Category name (unique) |
| `slug` | VARCHAR | URL-friendly name (unique) |
| `icon` | VARCHAR | Emoji or icon reference |
| `description` | TEXT | Category description |
| `parent_id` | UUID | FK → categories (self-reference; null = top-level) |

---

### products

Farmer listings available for purchase.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `farmer_id` | UUID | FK → users |
| `category_id` | UUID | FK → categories |
| `name` | VARCHAR | Product name |
| `description` | TEXT | Detailed description |
| `quantity` | FLOAT | Available quantity |
| `unit` | VARCHAR | `kg`, `bag`, `crate`, `litre`, `head`, `dozen` |
| `grade` | VARCHAR | `A`, `B`, `C`, `organic` |
| `price` | FLOAT | Price per unit (KES) |
| `min_order_qty` | FLOAT | Minimum purchase quantity |
| `harvest_date` | TIMESTAMPTZ | When the crop was harvested |
| `expiry_date` | TIMESTAMPTZ | Use-by / best-before date |
| `county` | VARCHAR | County where produce is located |
| `sub_county` | VARCHAR | Sub-county |
| `location` | VARCHAR | Market or farm location description |
| `gps_lat` | FLOAT | GPS latitude |
| `gps_lng` | FLOAT | GPS longitude |
| `photos` | VARCHAR[] | CloudFront photo URLs |
| `status` | ProductStatus | `DRAFT`, `ACTIVE`, `SOLD_OUT`, `EXPIRED`, `SUSPENDED` |
| `organic_certified` | BOOLEAN | Has organic certification |
| `certification_no` | VARCHAR | Certification number |
| `view_count` | INT | Listing view counter |
| `is_featured` | BOOLEAN | Appears in featured section |
| `tags` | VARCHAR[] | Searchable tags |

---

### orders

Records a single transaction between one buyer and one farmer.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `buyer_id` | UUID | FK → users |
| `farmer_id` | UUID | FK → users |
| `status` | OrderStatus | See status state machine |
| `total_amount` | FLOAT | Sum of all order items (KES) |
| `notes` | TEXT | Buyer instructions |
| `delivery_address` | VARCHAR | Destination address |
| `delivery_lat` | FLOAT | Delivery GPS lat |
| `delivery_lng` | FLOAT | Delivery GPS lng |
| `transport_provider_id` | UUID | FK → transport_providers (optional) |
| `delivery_fee` | FLOAT | Transport cost (KES) |
| `platform_fee` | FLOAT | MkulimaLink commission (KES) |
| `payment_status` | PaymentStatus | Current payment state |
| `expected_delivery_date` | TIMESTAMPTZ | Agreed delivery date |
| `delivered_at` | TIMESTAMPTZ | Actual delivery timestamp |
| `cancelled_at` | TIMESTAMPTZ | Cancellation timestamp |
| `cancellation_reason` | TEXT | Reason for cancellation |

---

### order_items

Line items within an order (many products per order).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `order_id` | UUID | FK → orders (cascade delete) |
| `product_id` | UUID | FK → products |
| `quantity` | FLOAT | Quantity ordered |
| `unit_price` | FLOAT | Price at time of order (snapshot) |
| `total_price` | FLOAT | `quantity × unit_price` |
| `unit` | VARCHAR | Unit at time of order |

---

### payments

Records every payment attempt for an order.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `order_id` | UUID | FK → orders |
| `user_id` | UUID | FK → users (payer) |
| `amount` | FLOAT | Amount charged (KES) |
| `method` | PaymentMethod | `MPESA_STK`, `MPESA_B2C`, `BANK_TRANSFER`, `CASH_ON_DELIVERY` |
| `status` | PaymentStatus | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`, `CANCELLED` |
| `mpesa_transaction_id` | VARCHAR | M-Pesa transaction ID |
| `mpesa_receipt_number` | VARCHAR | M-Pesa receipt (e.g. `PGH57WLKOB`) |
| `mpesa_checkout_request_id` | VARCHAR | STK push checkout request ID |
| `phone_number` | VARCHAR | M-Pesa phone number used |
| `merchant_request_id` | VARCHAR | Daraja merchant request ID |
| `result_code` | INT | M-Pesa result code (0 = success) |
| `result_desc` | VARCHAR | M-Pesa result description |
| `refunded_at` | TIMESTAMPTZ | Refund timestamp |

---

### reviews

User-to-user reviews tied to a completed order.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `reviewer_id` | UUID | FK → users |
| `reviewee_id` | UUID | FK → users |
| `order_id` | UUID | FK → orders |
| `rating` | INT | 1–5 star rating |
| `comment` | TEXT | Review text |
| `type` | ReviewType | `BUYER_TO_FARMER`, `FARMER_TO_BUYER`, `BUYER_TO_TRANSPORT` |
| `photos` | VARCHAR[] | Evidence photos |

---

### notifications

In-app push notifications per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users (cascade delete) |
| `title` | VARCHAR | Short notification title |
| `message` | TEXT | Notification body |
| `type` | NotificationType | `ORDER`, `PAYMENT`, `DELIVERY`, `PRICE_ALERT`, `WEATHER`, `ADVISORY`, `SYSTEM`, `PROMOTION` |
| `read` | BOOLEAN | Whether notification was read |
| `read_at` | TIMESTAMPTZ | When it was read |
| `data` | JSONB | Structured payload (e.g., `{ "orderId": "..." }`) |

---

### market_prices

Historical market price data collected from KACE, county markets, and field agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `product_name` | VARCHAR | Commodity name |
| `category` | VARCHAR | Category grouping |
| `county` | VARCHAR | Market county |
| `price` | FLOAT | Representative price (KES) |
| `unit` | VARCHAR | Price unit (e.g., `kg`, `bag 90kg`) |
| `date` | TIMESTAMPTZ | Price observation date |
| `source` | VARCHAR | `KACE`, `field_agent`, `nairobi_market`, etc. |
| `min_price` | FLOAT | Lowest observed price that day |
| `max_price` | FLOAT | Highest observed price that day |
| `avg_price` | FLOAT | Mean price |

---

### price_forecasts

ML model predictions for future commodity prices.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `product_name` | VARCHAR | Commodity |
| `category` | VARCHAR | Category |
| `county` | VARCHAR | County |
| `predicted_price` | FLOAT | Forecast price (KES) |
| `forecast_date` | TIMESTAMPTZ | Date being predicted |
| `confidence` | FLOAT | Model confidence 0.0–1.0 |
| `factors` | JSONB | Influencing factors (seasonality, weather, supply) |
| `model` | VARCHAR | ML model used (default: `linear_regression`) |

---

### deliveries

Tracks the physical movement of goods for a given order.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `order_id` | UUID | FK → orders (unique: one delivery per order) |
| `transport_provider_id` | UUID | FK → transport_providers |
| `driver_id` | UUID | FK → users (the driver) |
| `status` | DeliveryStatus | `PENDING`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED` |
| `pickup_address` | VARCHAR | Collection address |
| `pickup_lat/lng` | FLOAT | Pickup GPS coords |
| `delivery_address` | VARCHAR | Destination address |
| `delivery_lat/lng` | FLOAT | Destination GPS coords |
| `distance` | FLOAT | Route distance (km) |
| `estimated_arrival` | TIMESTAMPTZ | ETA |
| `actual_arrival` | TIMESTAMPTZ | Actual delivery time |
| `tracking_code` | VARCHAR | Public tracking code (unique) |
| `current_lat/lng` | FLOAT | Live position |
| `tracking_history` | JSONB[] | Array of `{status, lat, lng, timestamp}` |

---

### cooperative_societies

Farmer cooperatives registered on the platform.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR | Cooperative name |
| `registration_no` | VARCHAR | Kenya cooperatives registration number (unique) |
| `county` | VARCHAR | County of operation |
| `manager_id` | UUID | FK → users (unique: one manager per cooperative) |
| `description` | TEXT | About the cooperative |
| `logo` | VARCHAR | Logo URL |

---

### cooperative_members

Junction table: which users are members of which cooperative.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `cooperative_id` | UUID | FK → cooperative_societies |
| `user_id` | UUID | FK → users |
| `membership_no` | VARCHAR | Member number |
| `joined_at` | TIMESTAMPTZ | Join date |
| `is_active` | BOOLEAN | Active membership |

Unique constraint: `(cooperative_id, user_id)`

---

### advisories

Agricultural advisories published by extension officers or admins.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `officer_id` | UUID | FK → users |
| `title` | VARCHAR | Advisory headline |
| `content` | TEXT | Full advisory content |
| `category` | VARCHAR | `pest_disease`, `weather`, `market`, `regulation`, `planting` |
| `county` | VARCHAR | Target county (null = national) |
| `severity` | VARCHAR | `INFO`, `WATCH`, `WARNING`, `CRITICAL` |
| `tags` | VARCHAR[] | Searchable tags |
| `is_published` | BOOLEAN | Published to users |
| `view_count` | INT | Views counter |

---

### knowledge_articles

Educational articles for farmers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `author_id` | UUID | FK → users |
| `title` | VARCHAR | Article title |
| `content` | TEXT | Full article (Markdown) |
| `summary` | VARCHAR | Short excerpt |
| `category` | VARCHAR | `soil_health`, `pest_management`, `irrigation`, `post_harvest`, `market_access` |
| `tags` | VARCHAR[] | Tags for filtering |
| `media_urls` | VARCHAR[] | Photos/videos |
| `is_published` | BOOLEAN | Visibility |
| `view_count` | INT | Read counter |

---

### weather_data

Weather observations and forecasts per county (populated by scheduled job from OpenWeatherMap).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `county` | VARCHAR | Kenya county |
| `temperature` | FLOAT | Temperature in Celsius |
| `humidity` | FLOAT | Relative humidity % |
| `rainfall` | FLOAT | Rainfall in mm |
| `wind_speed` | FLOAT | Wind speed km/h |
| `condition` | VARCHAR | Human-readable condition |
| `forecast` | JSONB | 7-day forecast array |
| `source` | VARCHAR | Default: `openweather` |
| `recorded_at` | TIMESTAMPTZ | Observation timestamp |

---

### price_alerts

User-configured alerts triggered when a commodity price crosses a threshold.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | Owner |
| `product_name` | VARCHAR | Commodity to watch |
| `county` | VARCHAR | County scope (null = national) |
| `target_price` | FLOAT | Threshold price (KES) |
| `condition` | VARCHAR | `above` or `below` |
| `is_active` | BOOLEAN | Alert active |
| `triggered_at` | TIMESTAMPTZ | When alert last fired |

---

### otp_tokens

One-time passwords for phone verification, email verification, and password resets.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users (cascade delete) |
| `token` | VARCHAR | 6-digit OTP code |
| `type` | VARCHAR | `EMAIL_VERIFY`, `PHONE_VERIFY`, `PASSWORD_RESET` |
| `expires_at` | TIMESTAMPTZ | Expiry timestamp (typically 10 min) |
| `used` | BOOLEAN | Whether OTP was consumed |

---

## 3. Relationships

| Table | Related Table | Type | Foreign Key | Notes |
|-------|--------------|------|-------------|-------|
| `users` | `farmer_profiles` | 1:0..1 | `farmer_profiles.user_id` | One profile per farmer |
| `users` | `buyer_profiles` | 1:0..1 | `buyer_profiles.user_id` | One profile per buyer |
| `users` | `transport_providers` | 1:0..1 | `transport_providers.user_id` | One per transport user |
| `users` | `products` | 1:N | `products.farmer_id` | A farmer has many listings |
| `users` | `orders` (buyer) | 1:N | `orders.buyer_id` | |
| `users` | `orders` (farmer) | 1:N | `orders.farmer_id` | |
| `users` | `payments` | 1:N | `payments.user_id` | |
| `users` | `reviews` (given) | 1:N | `reviews.reviewer_id` | |
| `users` | `reviews` (received) | 1:N | `reviews.reviewee_id` | |
| `users` | `notifications` | 1:N | `notifications.user_id` | Cascade delete |
| `users` | `otp_tokens` | 1:N | `otp_tokens.user_id` | Cascade delete |
| `users` | `advisories` | 1:N | `advisories.officer_id` | |
| `users` | `knowledge_articles` | 1:N | `knowledge_articles.author_id` | |
| `users` | `warehouses` | 1:N | `warehouses.owner_id` | |
| `users` | `deliveries` (driver) | 1:N | `deliveries.driver_id` | |
| `users` | `cooperative_societies` | 1:0..1 | `cooperative_societies.manager_id` | Manager relation |
| `categories` | `categories` | 1:N | `categories.parent_id` | Self-referential hierarchy |
| `categories` | `products` | 1:N | `products.category_id` | |
| `orders` | `order_items` | 1:N | `order_items.order_id` | Cascade delete |
| `orders` | `payments` | 1:N | `payments.order_id` | Multiple payment attempts |
| `orders` | `reviews` | 1:N | `reviews.order_id` | |
| `orders` | `deliveries` | 1:0..1 | `deliveries.order_id` | Unique |
| `products` | `order_items` | 1:N | `order_items.product_id` | |
| `transport_providers` | `deliveries` | 1:N | `deliveries.transport_provider_id` | |
| `transport_providers` | `orders` | 1:N | `orders.transport_provider_id` | |
| `cooperative_societies` | `cooperative_members` | 1:N | `cooperative_members.cooperative_id` | |
| `users` | `cooperative_members` | 1:N | `cooperative_members.user_id` | |

---

## 4. Indexes

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `users` | `users_email_key` | `email` | UNIQUE | Fast email lookup |
| `users` | `users_phone_key` | `phone` | UNIQUE | Phone login |
| `users` | `users_national_id_key` | `national_id` | UNIQUE | KYC deduplication |
| `products` | `products_farmer_id_idx` | `farmer_id` | BTREE | Farmer's listings |
| `products` | `products_category_id_idx` | `category_id` | BTREE | Category browse |
| `products` | `products_county_idx` | `county` | BTREE | Geographic filter |
| `products` | `products_status_idx` | `status` | BTREE | Active listings filter |
| `orders` | `orders_buyer_id_idx` | `buyer_id` | BTREE | Buyer order history |
| `orders` | `orders_farmer_id_idx` | `farmer_id` | BTREE | Farmer order history |
| `orders` | `orders_status_idx` | `status` | BTREE | Status dashboard |
| `payments` | `payments_order_id_idx` | `order_id` | BTREE | Order payments |
| `payments` | `payments_user_id_idx` | `user_id` | BTREE | User payment history |
| `notifications` | `notifications_user_id_idx` | `user_id` | BTREE | User notification list |
| `market_prices` | `market_prices_product_county_date_idx` | `product_name, county, date` | BTREE | Price queries |
| `weather_data` | `weather_data_county_recorded_at_idx` | `county, recorded_at` | BTREE | Weather queries |
| `deliveries` | `deliveries_order_id_key` | `order_id` | UNIQUE | One delivery per order |
| `deliveries` | `deliveries_tracking_code_key` | `tracking_code` | UNIQUE | Public tracking |
| `transport_providers` | `transport_providers_vehicle_reg_key` | `vehicle_reg` | UNIQUE | Vehicle uniqueness |
| `reviews` | `reviews_reviewer_order_type_key` | `reviewer_id, order_id, type` | UNIQUE | One review per order type |
| `cooperative_members` | `cooperative_members_coop_user_key` | `cooperative_id, user_id` | UNIQUE | No duplicate membership |

---

## 5. Constraints

### Foreign Key Constraints

All foreign keys use `RESTRICT` on delete by default (Prisma default) unless stated otherwise:

| Table | Column | References | On Delete |
|-------|--------|-----------|-----------|
| `farmer_profiles` | `user_id` | `users.id` | CASCADE |
| `buyer_profiles` | `user_id` | `users.id` | CASCADE |
| `transport_providers` | `user_id` | `users.id` | CASCADE |
| `otp_tokens` | `user_id` | `users.id` | CASCADE |
| `notifications` | `user_id` | `users.id` | CASCADE |
| `order_items` | `order_id` | `orders.id` | CASCADE |
| `categories` | `parent_id` | `categories.id` | RESTRICT |
| `products` | `farmer_id` | `users.id` | RESTRICT |
| `orders` | `buyer_id` | `users.id` | RESTRICT |
| `orders` | `farmer_id` | `users.id` | RESTRICT |

### Check Constraints (application-level enforced)

| Table | Column | Rule |
|-------|--------|------|
| `reviews` | `rating` | 1 ≤ rating ≤ 5 |
| `products` | `price` | price > 0 |
| `products` | `quantity` | quantity ≥ 0 |
| `products` | `min_order_qty` | min_order_qty ≥ 1 |
| `transport_providers` | `price_per_km` | price_per_km > 0 |
| `market_prices` | `price` | price ≥ 0 |
| `price_forecasts` | `confidence` | 0.0 ≤ confidence ≤ 1.0 |
| `price_alerts` | `condition` | condition IN ('above', 'below') |

---

## 6. Enumerations

### UserRole

| Value | Description |
|-------|-------------|
| `FARMER` | Smallholder or commercial farmer |
| `BUYER` | Individual or household buyer |
| `WHOLESALER` | Wholesale purchaser |
| `RETAILER` | Retail shop or market stall |
| `EXPORTER` | Export-oriented trader |
| `TRANSPORT_PROVIDER` | Logistics service provider |
| `COOPERATIVE_MANAGER` | Manages a farmer cooperative |
| `ADMIN` | Platform administrator |
| `SUPER_ADMIN` | Full platform access |

### ProductStatus

| Value | Description |
|-------|-------------|
| `DRAFT` | Not yet published |
| `ACTIVE` | Available for purchase |
| `SOLD_OUT` | Quantity = 0 |
| `EXPIRED` | Past expiry date |
| `SUSPENDED` | Admin suspended |

### OrderStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Order placed, awaiting farmer confirmation |
| `CONFIRMED` | Farmer confirmed |
| `PROCESSING` | Farmer preparing produce |
| `READY_FOR_PICKUP` | Ready for transport collection |
| `IN_TRANSIT` | Being transported |
| `DELIVERED` | Reached buyer, pending confirmation |
| `COMPLETED` | Buyer confirmed receipt |
| `CANCELLED` | Order cancelled |
| `DISPUTED` | Buyer raised dispute |
| `REFUNDED` | Payment refunded |

### PaymentMethod

| Value | Description |
|-------|-------------|
| `MPESA_STK` | Lipa Na M-Pesa STK push |
| `MPESA_B2C` | M-Pesa Business to Customer |
| `BANK_TRANSFER` | Bank transfer |
| `CASH_ON_DELIVERY` | Pay on delivery |

### PaymentStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Awaiting initiation |
| `PROCESSING` | STK push sent, awaiting PIN |
| `COMPLETED` | Payment successful |
| `FAILED` | Payment failed |
| `REFUNDED` | Amount refunded |
| `CANCELLED` | Cancelled before completion |

### DeliveryStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Not yet assigned |
| `ASSIGNED` | Driver assigned |
| `PICKED_UP` | Goods collected from farm |
| `IN_TRANSIT` | En route to buyer |
| `DELIVERED` | Successfully delivered |
| `FAILED` | Delivery attempt failed |

### NotificationType

| Value | Use case |
|-------|---------|
| `ORDER` | Order status changes |
| `PAYMENT` | Payment confirmations |
| `DELIVERY` | Delivery updates |
| `PRICE_ALERT` | Commodity price threshold met |
| `WEATHER` | County weather alerts |
| `ADVISORY` | Extension advisory published |
| `SYSTEM` | Platform announcements |
| `PROMOTION` | Promotional offers |

### ReviewType

| Value | Description |
|-------|-------------|
| `BUYER_TO_FARMER` | Buyer rates farmer on product/service |
| `FARMER_TO_BUYER` | Farmer rates buyer on reliability |
| `BUYER_TO_TRANSPORT` | Buyer rates transport provider |
