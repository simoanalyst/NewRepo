# Kenyan Jewelry Co. — Premium E-commerce Platform

A production-grade, mobile-first luxury jewelry e-commerce platform built for the Kenyan market — M-Pesa
checkout, WhatsApp support, KES pricing, nationwide delivery, and a full admin dashboard.

## Monorepo Structure

```
.
├── frontend/   Next.js 14 (App Router) storefront, admin dashboard, SEO
├── backend/    Express + Prisma + PostgreSQL REST API, M-Pesa Daraja integration
└── docker-compose.yml
```

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript |
| Database   | PostgreSQL + Prisma ORM |
| Auth       | JWT (access + refresh tokens), bcrypt password hashing |
| Payments   | M-Pesa Daraja API (STK Push + Paybill), Airtel Money, Card, COD, Bank Transfer |
| Messaging  | WhatsApp Business Cloud API (click-to-chat + transactional messages) |
| Infra      | Docker & Docker Compose |

## Features

**Storefront**: hero banners, featured/best-seller/new-arrival/limited-edition collections, category showcase
(engagement, wedding, necklaces, bracelets, earrings, watches, men's/women's, personalized, gifting), brand story,
testimonials, Instagram gallery, FAQ, store locator with embedded Google Maps, newsletter signup, dark/light mode,
glassmorphism navigation, full-text search & filtering (material, gemstone, color, ring size, price in KES),
product detail pages with image gallery + 360° indicator + zoom, size guide, specifications, reviews, related
products, wishlist, cart, and a guided checkout with M-Pesa STK Push, Paybill, Airtel Money, card, COD, and bank
transfer options.

**Customer accounts**: registration with phone OTP verification, login, order history, order tracking, saved
addresses, wishlist.

**Admin dashboard**: sales overview, product/category management, order management, customer list, review
moderation, banner & coupon management, audit logging.

**SEO**: dynamic sitemap.xml & robots.txt, per-page metadata, Open Graph tags, Product & FAQ JSON-LD structured
data, semantic URLs.

**Security**: Helmet security headers, CORS, rate limiting (general/auth/payment tiers), JWT auth with
role-based access control, Zod input validation, bcrypt password hashing, audit logging, HTTPS-only in
production.

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or use Docker Compose below)
- npm

### 1. Start PostgreSQL (via Docker)
```bash
docker compose up -d postgres
```

### 2. Backend API
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT secrets, M-Pesa credentials
npm install
npm run prisma:migrate    # creates tables
npm run prisma:seed       # seeds categories, products, stores, admin user
npm run dev                # http://localhost:4000
```

Seeded admin login: phone `+254700000001`, password `Admin@12345` (change immediately in production).

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

The storefront renders from bundled mock data (`frontend/src/data/*`) out of the box, so it's fully browsable
even before the backend is running. Once `NEXT_PUBLIC_API_URL` points at a live backend, account, order,
review, and admin pages switch to live data automatically.

## M-Pesa Daraja Setup

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) and obtain your Consumer Key
   & Secret.
2. For production, apply for a paybill/till Shortcode and Lipa Na M-Pesa Online passkey; for sandbox testing,
   use shortcode `174379` with Safaricom's published sandbox passkey.
3. Set `MPESA_CALLBACK_URL` to a publicly reachable HTTPS URL pointing at
   `POST /api/payments/mpesa/callback` (use `ngrok` for local testing).
4. Populate `backend/.env` with `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`,
   `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`.

Checkout flow: `POST /api/orders/checkout` with `paymentMethod: "MPESA_STK"` creates the order, then
immediately triggers an STK push to the customer's phone (`backend/src/services/mpesa.service.ts`). Safaricom
posts the result to the callback endpoint, which marks the order `PAID` and sends a WhatsApp confirmation.

> The frontend checkout UI (`frontend/src/components/checkout/CheckoutFlow.tsx`) currently simulates the STK
> push confirmation for a self-contained demo experience. Wiring it to the live authenticated
> `/api/orders/checkout` endpoint requires connecting the checkout form to a signed-in (or guest-token) session —
> the endpoint itself is fully implemented and ready to call.

## WhatsApp Business Integration

Set `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` (from Meta's WhatsApp Cloud API) in `backend/.env`
to enable transactional order-confirmation messages. The floating WhatsApp button and all "Chat with us" /
"Request Quote" / "Book Consultation" links work immediately using `NEXT_PUBLIC_WHATSAPP_NUMBER` — no API
credentials required for click-to-chat.

## Deployment

### Docker Compose (full stack)
```bash
cp backend/.env.example backend/.env   # fill in secrets
docker compose up -d --build
```

### Recommended managed hosting
- **Frontend**: Vercel (zero-config Next.js deploys, edge caching, image optimization)
- **Backend**: Render / Railway / Fly.io (Dockerfile provided)
- **Database**: managed PostgreSQL (Render, Railway, Supabase, or AWS RDS)

Set the same environment variables from `backend/.env.example` and `frontend/.env.example` in your hosting
provider's dashboard. Run `npm run prisma:deploy` (or let the backend's Docker `CMD` do it automatically) to
apply migrations on deploy.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list, including M-Pesa, WhatsApp, Google
Maps, and analytics (GA4 / Meta Pixel) configuration.

## Project Conventions

- All monetary values are stored and transmitted as integer KES (no decimals), formatted with
  `Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })` on the frontend.
- Phone numbers are normalized server-side to `2547XXXXXXXX` / `+2547XXXXXXXX` for M-Pesa and storage
  consistency.
- API responses follow the envelope `{ success, data, message?, meta? }`.

## License

Proprietary — © Kenyan Jewelry Co.
