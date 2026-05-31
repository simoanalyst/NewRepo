import axios from 'axios';
import { logger } from '../config/logger';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

export async function getDistance(
  originLat: number, originLng: number,
  destLat: number, destLng: number
): Promise<{ distance: number; duration: number; distanceText: string; durationText: string }> {
  if (!GOOGLE_MAPS_KEY) {
    // Haversine formula fallback
    const R = 6371; // Earth radius km
    const dLat = ((destLat - originLat) * Math.PI) / 180;
    const dLng = ((destLng - originLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c);
    const duration = Math.round((distance / 60) * 60); // ~60km/h

    return {
      distance,
      duration,
      distanceText: `${distance} km`,
      durationText: `${Math.floor(duration / 60)}h ${duration % 60}min`,
    };
  }

  try {
    const response = await axios.get(`${MAPS_BASE_URL}/distancematrix/json`, {
      params: {
        origins: `${originLat},${originLng}`,
        destinations: `${destLat},${destLng}`,
        mode: 'driving',
        key: GOOGLE_MAPS_KEY,
      },
    });

    const element = response.data.rows[0].elements[0];
    return {
      distance: element.distance.value / 1000,
      duration: element.duration.value / 60,
      distanceText: element.distance.text,
      durationText: element.duration.text,
    };
  } catch (err) {
    logger.error('Maps API error', err);
    const dist = Math.round(Math.sqrt((destLat - originLat) ** 2 + (destLng - originLng) ** 2) * 111);
    return { distance: dist, duration: dist * 1.5, distanceText: `~${dist} km`, durationText: `~${Math.round(dist * 1.5 / 60)}h` };
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  if (!GOOGLE_MAPS_KEY) return null;

  try {
    const response = await axios.get(`${MAPS_BASE_URL}/geocode/json`, {
      params: { address: `${address}, Kenya`, key: GOOGLE_MAPS_KEY },
    });

    if (response.data.results.length > 0) {
      const loc = response.data.results[0].geometry.location;
      return {
        lat: loc.lat,
        lng: loc.lng,
        formattedAddress: response.data.results[0].formatted_address,
      };
    }
    return null;
  } catch (err) {
    logger.error('Geocode error', err);
    return null;
  }
}
