import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Kenya Counties ───────────────────────────────────────────────────────────
const KENYA_COUNTIES = [
  { name: 'Mombasa', code: '001' },
  { name: 'Kwale', code: '002' },
  { name: 'Kilifi', code: '003' },
  { name: 'Tana River', code: '004' },
  { name: 'Lamu', code: '005' },
  { name: 'Taita-Taveta', code: '006' },
  { name: 'Garissa', code: '007' },
  { name: 'Wajir', code: '008' },
  { name: 'Mandera', code: '009' },
  { name: 'Marsabit', code: '010' },
  { name: 'Isiolo', code: '011' },
  { name: 'Meru', code: '012' },
  { name: "Tharaka-Nithi", code: '013' },
  { name: 'Embu', code: '014' },
  { name: 'Kitui', code: '015' },
  { name: 'Machakos', code: '016' },
  { name: 'Makueni', code: '017' },
  { name: 'Nyandarua', code: '018' },
  { name: 'Nyeri', code: '019' },
  { name: 'Kirinyaga', code: '020' },
  { name: "Murang'a", code: '021' },
  { name: 'Kiambu', code: '022' },
  { name: 'Turkana', code: '023' },
  { name: 'West Pokot', code: '024' },
  { name: 'Samburu', code: '025' },
  { name: 'Trans Nzoia', code: '026' },
  { name: 'Uasin Gishu', code: '027' },
  { name: 'Elgeyo-Marakwet', code: '028' },
  { name: 'Nandi', code: '029' },
  { name: 'Baringo', code: '030' },
  { name: 'Laikipia', code: '031' },
  { name: 'Nakuru', code: '032' },
  { name: 'Narok', code: '033' },
  { name: 'Kajiado', code: '034' },
  { name: 'Kericho', code: '035' },
  { name: 'Bomet', code: '036' },
  { name: 'Kakamega', code: '037' },
  { name: 'Vihiga', code: '038' },
  { name: 'Bungoma', code: '039' },
  { name: 'Busia', code: '040' },
  { name: 'Siaya', code: '041' },
  { name: 'Kisumu', code: '042' },
  { name: 'Homa Bay', code: '043' },
  { name: 'Migori', code: '044' },
  { name: 'Kisii', code: '045' },
  { name: 'Nyamira', code: '046' },
  { name: 'Nairobi', code: '047' },
];

// ─── Product Categories ───────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: 'Cereals & Grains',
    slug: 'cereals-grains',
    icon: '🌾',
    description: 'Maize, wheat, sorghum, millet, barley and other cereal crops',
    children: [
      { name: 'Maize', slug: 'maize', icon: '🌽' },
      { name: 'Wheat', slug: 'wheat', icon: '🌾' },
      { name: 'Sorghum', slug: 'sorghum', icon: '🌾' },
      { name: 'Millet', slug: 'millet', icon: '🌾' },
      { name: 'Rice', slug: 'rice', icon: '🍚' },
    ],
  },
  {
    name: 'Legumes & Pulses',
    slug: 'legumes-pulses',
    icon: '🫘',
    description: 'Beans, lentils, peas, groundnuts and other legumes',
    children: [
      { name: 'Beans', slug: 'beans', icon: '🫘' },
      { name: 'Green Grams', slug: 'green-grams', icon: '🫘' },
      { name: 'Lentils', slug: 'lentils', icon: '🫘' },
      { name: 'Cowpeas', slug: 'cowpeas', icon: '🫘' },
      { name: 'Groundnuts', slug: 'groundnuts', icon: '🥜' },
      { name: 'Pigeon Peas', slug: 'pigeon-peas', icon: '🫘' },
    ],
  },
  {
    name: 'Vegetables',
    slug: 'vegetables',
    icon: '🥦',
    description: 'Fresh vegetables from Kenyan farms',
    children: [
      { name: 'Tomatoes', slug: 'tomatoes', icon: '🍅' },
      { name: 'Onions', slug: 'onions', icon: '🧅' },
      { name: 'Cabbages', slug: 'cabbages', icon: '🥬' },
      { name: 'Potatoes', slug: 'potatoes', icon: '🥔' },
      { name: 'Kale (Sukuma Wiki)', slug: 'kale', icon: '🥬' },
      { name: 'Spinach', slug: 'spinach', icon: '🥬' },
      { name: 'Carrots', slug: 'carrots', icon: '🥕' },
      { name: 'Capsicum', slug: 'capsicum', icon: '🫑' },
      { name: 'Garlic', slug: 'garlic', icon: '🧄' },
      { name: 'French Beans', slug: 'french-beans', icon: '🫘' },
    ],
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    icon: '🍎',
    description: 'Fresh fruits grown across Kenya',
    children: [
      { name: 'Bananas', slug: 'bananas', icon: '🍌' },
      { name: 'Mangoes', slug: 'mangoes', icon: '🥭' },
      { name: 'Avocados', slug: 'avocados', icon: '🥑' },
      { name: 'Pineapples', slug: 'pineapples', icon: '🍍' },
      { name: 'Passion Fruit', slug: 'passion-fruit', icon: '🟡' },
      { name: 'Watermelon', slug: 'watermelon', icon: '🍉' },
      { name: 'Papaya', slug: 'papaya', icon: '🍈' },
      { name: 'Oranges', slug: 'oranges', icon: '🍊' },
    ],
  },
  {
    name: 'Cash Crops',
    slug: 'cash-crops',
    icon: '☕',
    description: 'Coffee, tea, pyrethrum, and other export-oriented crops',
    children: [
      { name: 'Coffee', slug: 'coffee', icon: '☕' },
      { name: 'Tea', slug: 'tea', icon: '🍵' },
      { name: 'Pyrethrum', slug: 'pyrethrum', icon: '🌼' },
      { name: 'Sunflower', slug: 'sunflower', icon: '🌻' },
      { name: 'Sugarcane', slug: 'sugarcane', icon: '🎋' },
    ],
  },
  {
    name: 'Livestock Products',
    slug: 'livestock-products',
    icon: '🥛',
    description: 'Milk, eggs, honey, and processed livestock products',
    children: [
      { name: 'Milk', slug: 'milk', icon: '🥛' },
      { name: 'Eggs', slug: 'eggs', icon: '🥚' },
      { name: 'Honey', slug: 'honey', icon: '🍯' },
      { name: 'Ghee', slug: 'ghee', icon: '🧈' },
      { name: 'Yoghurt', slug: 'yoghurt', icon: '🥛' },
    ],
  },
  {
    name: 'Poultry',
    slug: 'poultry',
    icon: '🐔',
    description: 'Live birds and poultry products',
    children: [
      { name: 'Broiler Chicken', slug: 'broiler-chicken', icon: '🐔' },
      { name: 'Kienyeji Chicken', slug: 'kienyeji-chicken', icon: '🐓' },
      { name: 'Ducks', slug: 'ducks', icon: '🦆' },
      { name: 'Turkey', slug: 'turkey', icon: '🦃' },
      { name: 'Quail', slug: 'quail', icon: '🐦' },
    ],
  },
  {
    name: 'Livestock',
    slug: 'livestock',
    icon: '🐄',
    description: 'Cattle, goats, sheep, pigs and other farm animals',
    children: [
      { name: 'Cattle', slug: 'cattle', icon: '🐄' },
      { name: 'Goats', slug: 'goats', icon: '🐐' },
      { name: 'Sheep', slug: 'sheep', icon: '🐑' },
      { name: 'Pigs', slug: 'pigs', icon: '🐷' },
      { name: 'Camels', slug: 'camels', icon: '🐪' },
      { name: 'Rabbits', slug: 'rabbits', icon: '🐇' },
    ],
  },
];

// ─── Sample Market Prices (per county, per commodity) ─────────────────────────
interface MarketPriceEntry {
  productName: string;
  category: string;
  county: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unit: string;
  source: string;
}

function generateMarketPrices(): MarketPriceEntry[] {
  const commodities = [
    { name: 'Maize', category: 'cereals', basePrice: 35, unit: 'kg', variation: 0.2 },
    { name: 'Beans', category: 'legumes', basePrice: 120, unit: 'kg', variation: 0.25 },
    { name: 'Potatoes', category: 'vegetables', basePrice: 28, unit: 'kg', variation: 0.3 },
    { name: 'Tomatoes', category: 'vegetables', basePrice: 45, unit: 'kg', variation: 0.4 },
    { name: 'Onions', category: 'vegetables', basePrice: 35, unit: 'kg', variation: 0.3 },
    { name: 'Cabbages', category: 'vegetables', basePrice: 20, unit: 'head', variation: 0.35 },
    { name: 'Bananas', category: 'fruits', basePrice: 15, unit: 'kg', variation: 0.25 },
    { name: 'Mangoes', category: 'fruits', basePrice: 25, unit: 'kg', variation: 0.4 },
    { name: 'Avocados', category: 'fruits', basePrice: 30, unit: 'kg', variation: 0.35 },
    { name: 'Coffee', category: 'cash-crops', basePrice: 350, unit: 'kg', variation: 0.15 },
    { name: 'Tea', category: 'cash-crops', basePrice: 50, unit: 'kg', variation: 0.1 },
    { name: 'Milk', category: 'livestock', basePrice: 55, unit: 'litre', variation: 0.1 },
    { name: 'Eggs', category: 'livestock', basePrice: 16, unit: 'piece', variation: 0.15 },
    { name: 'Kienyeji Chicken', category: 'poultry', basePrice: 650, unit: 'bird', variation: 0.2 },
    { name: 'Kale (Sukuma Wiki)', category: 'vegetables', basePrice: 8, unit: 'bundle', variation: 0.3 },
    { name: 'Carrots', category: 'vegetables', basePrice: 40, unit: 'kg', variation: 0.25 },
    { name: 'Sweet Potatoes', category: 'vegetables', basePrice: 30, unit: 'kg', variation: 0.3 },
    { name: 'Sorghum', category: 'cereals', basePrice: 40, unit: 'kg', variation: 0.2 },
  ];

  const prices: MarketPriceEntry[] = [];
  const today = new Date();

  // Generate prices for the last 7 days for selected counties
  const selectedCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Meru', 'Nyeri', 'Kiambu', 'Machakos', 'Kakamega',
    'Uasin Gishu', 'Trans Nzoia', 'Nyandarua', 'Kirinyaga', 'Murang\'a',
  ];

  for (const commodity of commodities) {
    for (const county of selectedCounties) {
      for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        // Simulate county-specific price variation
        const countyMultiplier = county === 'Nairobi' || county === 'Mombasa'
          ? 1.15 // Higher prices in major cities
          : county === 'Trans Nzoia' || county === 'Uasin Gishu'
          ? 0.85 // Lower prices in production zones
          : 1.0;

        const basePrice = commodity.basePrice * countyMultiplier;
        const variation = commodity.variation;
        const minPrice = parseFloat((basePrice * (1 - variation / 2)).toFixed(2));
        const maxPrice = parseFloat((basePrice * (1 + variation / 2)).toFixed(2));
        const avgPrice = parseFloat(((minPrice + maxPrice) / 2).toFixed(2));

        prices.push({
          productName: commodity.name,
          category: commodity.category,
          county,
          price: avgPrice,
          minPrice,
          maxPrice,
          avgPrice,
          unit: commodity.unit,
          source: daysAgo === 0 ? 'field_agent' : 'KACE',
        });
      }
    }
  }

  return prices;
}

// ─── Sample Knowledge Articles ────────────────────────────────────────────────
const KNOWLEDGE_ARTICLES = [
  {
    title: 'Managing Fall Armyworm in Maize: A Practical Guide for Kenyan Farmers',
    summary: 'Fall armyworm (Spodoptera frugiperda) is one of the most destructive pests in Kenya. Learn to identify, monitor and control it effectively.',
    content: `## Introduction

Fall armyworm (FAW) was first detected in Kenya in 2016 and has since become a major threat to maize production, causing losses of up to 70% in severely affected farms. This guide covers practical management strategies suitable for smallholder farmers in Kenya.

## Identification

Look for these signs on maize plants:
- **Early stage (vegetative):** Small holes in leaves with white papery windows; fine sawdust-like frass in leaf whorls
- **Whorl stage:** Ragged feeding damage in the whorl; caterpillars visible when you unfurl leaves
- **Cob stage:** Entry holes near silk/husk; frass and caterpillars inside cobs
- **Adult moths:** Mottled grey-brown forewings; fly at night

The caterpillar has a distinctive inverted Y-shape on its head capsule.

## Scouting

- Scout fields twice a week from emergence to silking
- Check 10 random plants per 0.1 ha
- **Action threshold:** Take action if 20% or more of plants show damage

## Management

### Biological Control (IPM approach)
- **Trichogramma wasps:** Release 50,000–100,000 per ha at first sign of eggs
- **NPV (Nuclear Polyhedrosis Virus):** Apply SPODOPTEX at 1L/ha at pest emergence
- **Push-pull intercropping:** Plant Napier grass as border and Desmodium as intercrop — proven to reduce FAW by up to 86%

### Botanical Pesticides
- **Neem extract:** Mix 250g neem seed kernel powder in 10L water, filter and spray into whorls
- **Chilli pepper extract:** Blend 100g fresh chillies in 1L water, dilute 1:5 and spray
- Apply in the evening when larvae are most active

### Chemical Control (last resort)
| Product | Active Ingredient | Dosage |
|---------|-----------------|--------|
| Coragen® | Chlorantraniliprole | 100ml/200L water/ha |
| Affirm® | Emamectin benzoate | 200g/200L water/ha |
| Voliam Targo® | Chlorantraniliprole + Abamectin | 200ml/200L water/ha |

**Important:** Rotate chemical classes to prevent resistance. Never apply more than twice per season with the same active ingredient.

## Post-Harvest

- Dry maize to below 13% moisture before storage
- Apply Actellic Super dust (2g/kg) in hermetic bags
- Use metal silos or PICS bags for long-term storage

## Contacts for Support

- Kenya Plant Health Inspectorate Service (KEPHIS): 0800 720 600 (toll-free)
- Kenya Agricultural & Livestock Research Organization (KALRO): 0722 206 986`,
    category: 'pest_management',
    tags: ['fall-armyworm', 'maize', 'pest-control', 'IPM', 'food-security'],
  },
  {
    title: 'Soil Health Management for Sustainable Crop Production in Kenya',
    summary: 'Practical techniques to build and maintain soil organic matter, improve soil structure, and boost crop yields without expensive inputs.',
    content: `## Why Soil Health Matters

Healthy soil is the foundation of profitable and sustainable farming. In Kenya, decades of continuous cultivation without adequate soil amendment have led to widespread soil degradation. This guide shows you how to reverse that trend.

## Key Soil Health Indicators

| Indicator | Poor | Moderate | Good |
|-----------|------|----------|------|
| Organic matter % | <1% | 1–3% | >3% |
| Soil pH | <5.0 or >8.0 | 5.5–5.9 | 6.0–7.0 |
| Earthworms per m² | <5 | 5–10 | >10 |
| Water infiltration | Pools immediately | Slow | Absorbs quickly |

## Soil Testing

Test your soil every 2 years. Soil testing is available at:
- **KALRO Soil Testing Laboratories** – Nairobi, Kisumu, Mombasa (KES 500/sample)
- **AFA (Agriculture and Food Authority)** county offices
- **Private labs:** SGS Kenya, Fertilizer Testing Services

Collect composite samples (top 20cm) from at least 10 spots per field.

## Improving Soil Organic Matter

### Compost Making (3-month process)
1. Layer: 1 part green material (kitchen waste, fresh grass) + 3 parts dry material (straw, dry leaves)
2. Add wood ash (1 cup per layer) for potassium
3. Maintain moisture — as wet as a wrung-out sponge
4. Turn every 2 weeks
5. Ready when dark, crumbly and smells earthy

Apply 5–10 tonnes/ha before planting.

### Cover Crops
Plant these between main crop seasons:
- **Tithonia diversifolia (Mexican sunflower):** Chop and incorporate 2 weeks before planting — adds 200kg N/ha equivalent
- **Mucuna (velvet bean):** Fixes 100–150kg N/ha
- **Lablab:** Fixes 50–100kg N/ha and palatable to livestock

### Minimum Tillage
- Reduce ploughing depth to 15cm
- Use subsoilers only when hardpan is confirmed at <30cm
- Leave crop residues on the surface as mulch

## Lime Application

If pH is below 5.5, apply lime:
- **Agricultural lime:** 1–2 tonnes/ha (slow-release, lasts 3–5 years)
- **Dolomitic lime:** Preferred if soil is also low in magnesium
- Apply 3 months before planting and incorporate

## Integrated Soil Fertility Management (ISFM)

Combine:
1. **Mineral fertilizer** (half recommended rate)
2. **Compost or manure** (5 tonnes/ha)
3. **Lime** (if pH below 5.5)
4. **Improved seed varieties**

This combination delivers yields comparable to full mineral fertilizer at lower cost.`,
    category: 'soil_health',
    tags: ['soil', 'compost', 'organic-matter', 'lime', 'ISFM', 'fertility'],
  },
  {
    title: 'Post-Harvest Handling of Horticultural Produce: Reducing Losses from Farm to Market',
    summary: 'Kenya loses an estimated 30-40% of fresh produce between harvest and the consumer. Learn proven techniques to extend shelf life and improve quality.',
    content: `## The Post-Harvest Challenge

Kenya's fresh produce losses cost farmers and traders billions of shillings annually. Most losses are preventable with simple, low-cost interventions.

## Harvesting Best Practices

### Timing
- Harvest in the **early morning** (5am–8am) when temperatures are lowest
- Avoid harvesting during or immediately after heavy rain
- Never harvest when produce is still wet with dew

### Handling
- Use clean, sharp harvesting tools (pruning shears, knives)
- Handle produce gently — bruising accelerates decay
- Place harvested produce in the shade immediately
- Use padded harvesting baskets, not metal buckets

## Field Cooling

Cooling produce immediately after harvest is the most important post-harvest intervention.

### Evaporative Cooling (Pot-in-Pot / Zeir Pot)
Cost: KES 1,500–3,000 to build

- Place a smaller clay pot inside a larger one
- Fill the gap between them with wet sand
- Cover with wet jute sack
- Temperatures inside: 15–20°C vs. ambient 30–40°C
- **Suitable for:** Tomatoes, onions, peppers, carrots, aubergines

### Cold Water Hydro-cooling
- Immerse produce in cold water (1–5°C) for 10–30 minutes immediately post-harvest
- Used commercially for French beans, peas, lettuce

## Packaging

| Produce | Recommended Package | Avoid |
|---------|-------------------|-------|
| Tomatoes | Single-layer wooden crates | Deep plastic bags |
| Avocados | Perforated crates with padding | Tight net bags |
| Mangoes | Wooden crates, 15kg max | Gunny bags |
| Kale/Spinach | Crates with holes, misted | Sealed plastic |
| Onions | Net/mesh bags | Sealed containers |

## Storage

### Ambient Storage
- Store in cool, well-ventilated rooms (avoid sun)
- Keep away from ethylene-producing fruits (mangoes, bananas ripen others faster)
- Check daily and remove any rotting produce

### Hermetic Storage (cereals/legumes)
- Use PICS (Purdue Improved Crop Storage) bags or metal silos
- Dry grain to <13% moisture before storage
- Apply Actellic Super or Diatom (diatomite) dust
- Seal completely — no air entry

## Grading and Sorting

- Grade by size, colour, and freedom from defects
- Grade A: Premium supermarkets and export
- Grade B: Wholesale and retail markets
- Grade C: Processing and juice factories

## Transport

- Pre-cool vehicles before loading (shade or air conditioning)
- Line wooden crates with newspaper or foam
- Don't overfill crates
- Avoid rough roads and high speeds
- Deliver early morning to reduce heat exposure`,
    category: 'post_harvest',
    tags: ['post-harvest', 'storage', 'cooling', 'packaging', 'quality', 'losses'],
  },
  {
    title: 'Accessing Market Linkages for Kenyan Smallholder Farmers',
    summary: 'A step-by-step guide to connecting with buyers, negotiating fair prices, and building long-term commercial relationships.',
    content: `## Market Access Challenges

Most Kenyan smallholder farmers sell through middlemen at the farm gate, receiving only 20–40% of the final consumer price. This guide shows you how to access better markets and negotiate fair prices.

## Know Your Market Options

### Farm Gate Sales
- **Pros:** Zero transport cost, immediate payment
- **Cons:** Lowest price, dependent on traders' arrival, no bargaining power

### Local Markets
- **Pros:** Direct consumer access, cash payment
- **Cons:** Labour-intensive, small volumes only

### Wholesale Markets
- **Key markets:** Wakulima (Nairobi), Kongowea (Mombasa), Kibuye (Kisumu), Eldoret Open Air
- **Best for:** Volumes above 500kg
- **Tip:** Arrive early (4am–6am) for best prices

### Supermarkets (Formal Retail)
- **Target buyers:** Naivas, Quickmart, Carrefour, Chandarana, local chains
- **Requirements:** Consistent supply, good grading, food safety compliance
- **Entry path:** Start with local branches, build track record, expand

### Export Markets
- **Key destinations:** EU, UK, Middle East (French beans, snow peas, herbs)
- **Certifications required:** GlobalG.A.P., organic (if applicable), phytosanitary certificate (KEPHIS)
- **Aggregators:** Keitt Limited, Vegpro, Frigoken, East African Growers

## Collective Marketing Through Cooperatives

Joining a cooperative or farmer group increases your bargaining power:

1. **Volume aggregation:** Pool produce with neighbours to meet large buyer minimum orders
2. **Collective negotiation:** Agree on floor price before approaching buyers
3. **Shared transport costs:** Share lorry or truck hire (reduces cost per kg by 40–60%)
4. **Collective certification:** Share GlobalG.A.P. or organic audit costs

## Negotiating Prices

- **Know your cost of production** (seeds, fertilizer, labour, transport) — set a minimum price
- **Know the market price** — check KACE daily prices at kace.or.ke or call 0800 720 300 (free)
- **Never sell when desperate** — try to store for 1–3 days if prices are too low
- **Build relationships** — regular buyers offer better prices than one-off traders

## Using Digital Platforms

MkulimaLink and other platforms allow you to:
- List produce and attract buyers from across Kenya
- Compare prices across counties before selling
- Access M-Pesa payment — no cash handling risk
- View price trends and forecasts to time your sales

## Contracts and Agreements

For large buyers, always get a written or documented agreement covering:
- Quantity and quality specifications (grade, size, moisture)
- Price or pricing formula
- Payment terms (on delivery? 7 days? 30 days?)
- Rejection policy (what happens to rejected produce?)`,
    category: 'market_access',
    tags: ['market-linkages', 'prices', 'cooperatives', 'export', 'negotiation'],
  },
];

// ─── Sample Weather Data ──────────────────────────────────────────────────────
function generateWeatherData() {
  const countyWeather: Record<string, { baseTemp: number; baseHumidity: number; baseRainfall: number }> = {
    Nairobi: { baseTemp: 22, baseHumidity: 65, baseRainfall: 2 },
    Mombasa: { baseTemp: 30, baseHumidity: 80, baseRainfall: 5 },
    Kisumu: { baseTemp: 28, baseHumidity: 72, baseRainfall: 6 },
    Nakuru: { baseTemp: 20, baseHumidity: 60, baseRainfall: 3 },
    Meru: { baseTemp: 18, baseHumidity: 70, baseRainfall: 4 },
    Nyeri: { baseTemp: 17, baseHumidity: 72, baseRainfall: 4 },
    Kiambu: { baseTemp: 20, baseHumidity: 68, baseRainfall: 3 },
    'Uasin Gishu': { baseTemp: 19, baseHumidity: 65, baseRainfall: 4 },
    'Trans Nzoia': { baseTemp: 18, baseHumidity: 70, baseRainfall: 5 },
    Kakamega: { baseTemp: 23, baseHumidity: 78, baseRainfall: 8 },
    Kisii: { baseTemp: 21, baseHumidity: 75, baseRainfall: 7 },
    Machakos: { baseTemp: 25, baseHumidity: 55, baseRainfall: 2 },
    Garissa: { baseTemp: 35, baseHumidity: 35, baseRainfall: 0.5 },
    Nyandarua: { baseTemp: 15, baseHumidity: 75, baseRainfall: 5 },
    Kirinyaga: { baseTemp: 19, baseHumidity: 70, baseRainfall: 4 },
  };

  const conditions = ['Clear', 'Partly Cloudy', 'Mostly Cloudy', 'Light Rain', 'Moderate Rain'];
  const entries = [];
  const today = new Date();

  for (const [county, weather] of Object.entries(countyWeather)) {
    for (let daysAgo = 0; daysAgo < 3; daysAgo++) {
      const recordedAt = new Date(today);
      recordedAt.setDate(recordedAt.getDate() - daysAgo);
      recordedAt.setHours(6, 0, 0, 0);

      const tempVariation = (Math.random() - 0.5) * 4;
      const humidityVariation = (Math.random() - 0.5) * 10;
      const rainfallVariation = Math.random() * weather.baseRainfall * 0.8;

      const forecast = [];
      for (let day = 1; day <= 7; day++) {
        const forecastDate = new Date(recordedAt);
        forecastDate.setDate(forecastDate.getDate() + day);
        forecast.push({
          date: forecastDate.toISOString().split('T')[0],
          minTemp: parseFloat((weather.baseTemp - 5 + (Math.random() - 0.5) * 4).toFixed(1)),
          maxTemp: parseFloat((weather.baseTemp + 5 + (Math.random() - 0.5) * 4).toFixed(1)),
          rainfall: parseFloat((Math.random() * weather.baseRainfall * 1.5).toFixed(1)),
          humidity: Math.round(weather.baseHumidity + (Math.random() - 0.5) * 15),
          condition: conditions[Math.floor(Math.random() * conditions.length)],
        });
      }

      entries.push({
        county,
        temperature: parseFloat((weather.baseTemp + tempVariation).toFixed(1)),
        humidity: Math.round(Math.min(100, Math.max(20, weather.baseHumidity + humidityVariation))),
        rainfall: parseFloat(Math.max(0, rainfallVariation).toFixed(1)),
        windSpeed: parseFloat((Math.random() * 20 + 5).toFixed(1)),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        forecast,
        source: 'openweather',
        recordedAt,
      });
    }
  }

  return entries;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting MkulimaLink database seed...\n');

  // ── 1. Categories ─────────────────────────────────────────────────────────
  console.log('📂 Seeding categories...');
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
      },
    });
    categoryMap[cat.slug] = parent.id;

    for (const child of cat.children) {
      const childCat = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          icon: child.icon,
          parentId: parent.id,
        },
      });
      categoryMap[child.slug] = childCat.id;
    }
  }
  console.log(`  ✅ ${Object.keys(categoryMap).length} categories created\n`);

  // ── 2. Admin User ─────────────────────────────────────────────────────────
  console.log('👤 Seeding admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin@MkulimaLink2024!', 12);

  const adminUser = await prisma.user.upsert({
    where: { phone: '+254700000001' },
    update: {},
    create: {
      phone: '+254700000001',
      email: 'admin@mkulimalink.co.ke',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      firstName: 'Platform',
      lastName: 'Administrator',
      county: 'Nairobi',
      subCounty: 'Westlands',
      isVerified: true,
      isActive: true,
      phoneVerifiedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Super admin created: ${adminUser.email}\n`);

  // ── 3. Sample Farmers ─────────────────────────────────────────────────────
  console.log('🧑‍🌾 Seeding sample farmers...');
  const sampleFarmers = [
    {
      phone: '+254712001001',
      email: 'john.kamau@example.com',
      firstName: 'John',
      lastName: 'Kamau',
      county: 'Kiambu',
      subCounty: 'Limuru',
      ward: 'Ngecha-Tigoni',
      farmSize: 4.5,
      mainCrops: ['potatoes', 'tomatoes'],
      gpsLat: -1.0988,
      gpsLng: 36.7125,
    },
    {
      phone: '+254712001002',
      email: 'mary.mwangi@example.com',
      firstName: 'Mary',
      lastName: 'Mwangi',
      county: 'Meru',
      subCounty: 'Imenti North',
      ward: 'Timau',
      farmSize: 3.0,
      mainCrops: ['tomatoes', 'onions', 'french-beans'],
      gpsLat: 0.0471,
      gpsLng: 37.6497,
    },
    {
      phone: '+254712001003',
      email: 'peter.ochieng@example.com',
      firstName: 'Peter',
      lastName: 'Ochieng',
      county: 'Trans Nzoia',
      subCounty: 'Cherangany',
      ward: 'Sinyerere',
      farmSize: 8.0,
      mainCrops: ['maize', 'beans', 'sorghum'],
      gpsLat: 1.0145,
      gpsLng: 35.0022,
    },
    {
      phone: '+254712001004',
      email: 'grace.wanjiku@example.com',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      county: 'Nyandarua',
      subCounty: 'Kinangop',
      ward: 'North Kinangop',
      farmSize: 2.5,
      mainCrops: ['potatoes', 'cabbages', 'carrots'],
      gpsLat: -0.6204,
      gpsLng: 36.5963,
    },
    {
      phone: '+254712001005',
      email: 'samuel.kirui@example.com',
      firstName: 'Samuel',
      lastName: 'Kirui',
      county: 'Uasin Gishu',
      subCounty: 'Soy',
      ward: 'Ziwa',
      farmSize: 12.0,
      mainCrops: ['maize', 'wheat', 'sunflower'],
      gpsLat: 0.5143,
      gpsLng: 35.2699,
    },
    {
      phone: '+254712001006',
      email: 'esther.njeri@example.com',
      firstName: 'Esther',
      lastName: 'Njeri',
      county: 'Kirinyaga',
      subCounty: 'Mwea',
      ward: 'Mutithi',
      farmSize: 5.0,
      mainCrops: ['rice', 'coffee', 'avocados'],
      gpsLat: -0.6625,
      gpsLng: 37.3576,
    },
    {
      phone: '+254712001007',
      email: 'david.mutua@example.com',
      firstName: 'David',
      lastName: 'Mutua',
      county: 'Machakos',
      subCounty: 'Masinga',
      ward: 'Kivaa',
      farmSize: 6.0,
      mainCrops: ['mangoes', 'bananas', 'maize'],
      gpsLat: -1.1784,
      gpsLng: 37.5273,
    },
    {
      phone: '+254712001008',
      email: 'fatuma.hassan@example.com',
      firstName: 'Fatuma',
      lastName: 'Hassan',
      county: 'Kilifi',
      subCounty: 'Malindi',
      ward: 'Jilore',
      farmSize: 3.5,
      mainCrops: ['coconuts', 'cassava', 'mangoes'],
      gpsLat: -3.2175,
      gpsLng: 40.1169,
    },
  ];

  const farmerPasswordHash = await bcrypt.hash('Farmer@2024!', 12);

  for (const farmer of sampleFarmers) {
    const user = await prisma.user.upsert({
      where: { phone: farmer.phone },
      update: {},
      create: {
        phone: farmer.phone,
        email: farmer.email,
        passwordHash: farmerPasswordHash,
        role: 'FARMER',
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        county: farmer.county,
        subCounty: farmer.subCounty,
        ward: farmer.ward,
        isVerified: true,
        isActive: true,
        phoneVerifiedAt: new Date(),
      },
    });

    await prisma.farmerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        farmSize: farmer.farmSize,
        farmSizeUnit: 'acres',
        farmLocation: `${farmer.ward}, ${farmer.subCounty}, ${farmer.county}`,
        gpsLat: farmer.gpsLat,
        gpsLng: farmer.gpsLng,
        mainCrops: farmer.mainCrops,
        livestockTypes: [],
        farmPhotos: [],
        irrigationType: 'rainfed',
        soilType: 'loam',
        certifications: [],
      },
    });
  }
  console.log(`  ✅ ${sampleFarmers.length} sample farmers created\n`);

  // ── 4. Sample Buyers ─────────────────────────────────────────────────────
  console.log('🛒 Seeding sample buyers...');
  const sampleBuyers = [
    {
      phone: '+254722002001',
      email: 'procurement@naivassupermarket.co.ke',
      firstName: 'Robert',
      lastName: 'Njoroge',
      county: 'Nairobi',
      role: 'WHOLESALER' as const,
      businessName: 'Naivas Supermarket Ltd',
      businessType: 'supermarket',
      kraPin: 'A001234567B',
    },
    {
      phone: '+254722002002',
      email: 'supplies@wakulima.co.ke',
      firstName: 'Alice',
      lastName: 'Adhiambo',
      county: 'Nairobi',
      role: 'WHOLESALER' as const,
      businessName: 'Wakulima Market Traders',
      businessType: 'wholesale_market',
      kraPin: 'A007654321C',
    },
    {
      phone: '+254722002003',
      email: 'exports@greenexport.co.ke',
      firstName: 'James',
      lastName: 'Kiptoo',
      county: 'Nairobi',
      role: 'EXPORTER' as const,
      businessName: 'Green Export Kenya Ltd',
      businessType: 'exporter',
      kraPin: 'A009876543D',
    },
    {
      phone: '+254722002004',
      email: 'shop@kibera.co.ke',
      firstName: 'Wanjiku',
      lastName: 'Maina',
      county: 'Nairobi',
      role: 'RETAILER' as const,
      businessName: 'Mama Wanjiku Fresh Produce',
      businessType: 'retail_shop',
      kraPin: null,
    },
  ];

  const buyerPasswordHash = await bcrypt.hash('Buyer@2024!', 12);

  for (const buyer of sampleBuyers) {
    const user = await prisma.user.upsert({
      where: { phone: buyer.phone },
      update: {},
      create: {
        phone: buyer.phone,
        email: buyer.email,
        passwordHash: buyerPasswordHash,
        role: buyer.role,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        county: buyer.county,
        isVerified: true,
        isActive: true,
        phoneVerifiedAt: new Date(),
      },
    });

    await prisma.buyerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: buyer.businessName,
        businessType: buyer.businessType,
        kraPin: buyer.kraPin ?? undefined,
        preferredProducts: ['vegetables', 'fruits', 'cereals'],
        monthlyBudget: buyer.role === 'EXPORTER' ? 2000000 : buyer.role === 'WHOLESALER' ? 500000 : 50000,
      },
    });
  }
  console.log(`  ✅ ${sampleBuyers.length} sample buyers created\n`);

  // ── 5. Market Prices ─────────────────────────────────────────────────────
  console.log('📊 Seeding market prices (this may take a moment)...');
  const marketPrices = generateMarketPrices();
  const today = new Date();

  // Batch insert for performance
  const BATCH_SIZE = 100;
  let insertedPrices = 0;
  for (let i = 0; i < marketPrices.length; i += BATCH_SIZE) {
    const batch = marketPrices.slice(i, i + BATCH_SIZE);
    await prisma.marketPrice.createMany({
      data: batch.map((mp, idx) => ({
        productName: mp.productName,
        category: mp.category,
        county: mp.county,
        price: mp.price,
        minPrice: mp.minPrice,
        maxPrice: mp.maxPrice,
        avgPrice: mp.avgPrice,
        unit: mp.unit,
        source: mp.source,
        date: new Date(today.getTime() - Math.floor(idx / 15) * 24 * 60 * 60 * 1000),
      })),
      skipDuplicates: false,
    });
    insertedPrices += batch.length;
  }
  console.log(`  ✅ ${insertedPrices} market price records created\n`);

  // ── 6. Knowledge Articles ─────────────────────────────────────────────────
  console.log('📚 Seeding knowledge articles...');
  for (const article of KNOWLEDGE_ARTICLES) {
    const existing = await prisma.knowledgeArticle.findFirst({
      where: { title: article.title },
    });
    if (!existing) {
      await prisma.knowledgeArticle.create({
        data: {
          authorId: adminUser.id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          category: article.category,
          tags: article.tags,
          mediaUrls: [],
          isPublished: true,
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 1500),
        },
      });
    }
  }
  console.log(`  ✅ ${KNOWLEDGE_ARTICLES.length} knowledge articles created\n`);

  // ── 7. Weather Data ───────────────────────────────────────────────────────
  console.log('🌤️  Seeding weather data...');
  const weatherEntries = generateWeatherData();
  await prisma.weatherData.createMany({
    data: weatherEntries,
    skipDuplicates: false,
  });
  console.log(`  ✅ ${weatherEntries.length} weather records created\n`);

  // ── 8. Sample Advisory ────────────────────────────────────────────────────
  console.log('📢 Seeding sample advisory...');
  const advisoryExists = await prisma.advisory.findFirst({
    where: { title: { contains: 'Fall Armyworm' } },
  });

  if (!advisoryExists) {
    await prisma.advisory.create({
      data: {
        officerId: adminUser.id,
        title: 'Fall Armyworm Alert – Rift Valley Region',
        content:
          'Fall armyworm (Spodoptera frugiperda) infestations have been reported in maize farms across Uasin Gishu, Trans Nzoia, and Nandi counties. Farmers are advised to scout their fields immediately. Apply Coragen or Affirm if threshold (20% of plants affected) is exceeded. Contact your nearest KALRO office for free bio-pesticide samples.',
        category: 'pest_disease',
        county: 'Uasin Gishu',
        severity: 'WARNING',
        tags: ['fall-armyworm', 'maize', 'rift-valley', 'pest'],
        attachments: [],
        isPublished: true,
        publishedAt: new Date(),
        viewCount: 324,
      },
    });
  }
  console.log('  ✅ Sample advisory created\n');

  // ── 9. County Summary ─────────────────────────────────────────────────────
  console.log('🗺️  Kenya counties covered in seed:');
  console.log(`  ${KENYA_COUNTIES.map((c) => c.name).join(', ')}\n`);
  console.log(`  Total: ${KENYA_COUNTIES.length} counties\n`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('🎉 Database seed completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log('\nSeed summary:');
  console.log(`  Categories:       ${Object.keys(categoryMap).length}`);
  console.log(`  Admin users:      1`);
  console.log(`  Sample farmers:   ${sampleFarmers.length}`);
  console.log(`  Sample buyers:    ${sampleBuyers.length}`);
  console.log(`  Market prices:    ${insertedPrices}`);
  console.log(`  Knowledge articles: ${KNOWLEDGE_ARTICLES.length}`);
  console.log(`  Weather records:  ${weatherEntries.length}`);
  console.log(`  Advisories:       1`);
  console.log('\n📋 Default credentials:');
  console.log('  Admin:   +254700000001 / Admin@MkulimaLink2024!');
  console.log('  Farmer:  +254712001001 / Farmer@2024!');
  console.log('  Buyer:   +254722002001 / Buyer@2024!');
  console.log('\n⚠️  Change all default passwords before going to production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
