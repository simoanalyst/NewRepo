import { StoreLocation } from "@/types";

export const stores: StoreLocation[] = [
  {
    id: "store-nairobi-flagship",
    name: "Kenyan Jewelry — Westlands Flagship",
    county: "Nairobi",
    address: "The Address, 5th Floor, Muthithi Road, Westlands, Nairobi",
    phone: "+254 700 000 001",
    lat: -1.2673,
    lng: 36.8076,
    hours: "Mon–Fri 9:00–19:00 · Sat 10:00–18:00 · Sun Closed",
    isFlagship: true,
  },
  {
    id: "store-mombasa",
    name: "Kenyan Jewelry — Nyali, Mombasa",
    county: "Mombasa",
    address: "City Mall, Links Road, Nyali, Mombasa",
    phone: "+254 700 000 003",
    lat: -4.0269,
    lng: 39.7115,
    hours: "Mon–Fri 9:00–19:00 · Sat 10:00–18:00 · Sun 11:00–16:00",
    isFlagship: false,
  },
  {
    id: "store-kisumu",
    name: "Kenyan Jewelry — Kisumu",
    county: "Kisumu",
    address: "Mega Plaza, Oginga Odinga Street, Kisumu",
    phone: "+254 700 000 004",
    lat: -0.0917,
    lng: 34.768,
    hours: "Mon–Sat 9:00–18:00 · Sun Closed",
    isFlagship: false,
  },
];
