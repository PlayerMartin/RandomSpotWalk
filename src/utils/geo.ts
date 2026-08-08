import type { LatLng } from '../types';

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEG_LAT = 111.32;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Returns the great-circle distance in meters between two lat/lng points
 * using the Haversine formula.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c * 1000;
}

/**
 * Returns a random LatLng uniformly distributed within a circle of the given
 * radius (in km) around the center point.
 *
 * Uses r = R * sqrt(random) for a uniform area distribution, plus a random
 * angle. Converts km distances to degrees accounting for latitude.
 */
export function randomPointInCircle(center: LatLng, radiusKm: number): LatLng {
  const angle = Math.random() * 2 * Math.PI;
  // Uniform distribution over the disk: radius = R * sqrt(u), u ∈ [0,1)
  const r = radiusKm * Math.sqrt(Math.random());

  const dLat = r / KM_PER_DEG_LAT;
  // Longitude degrees shrink with cos(latitude)
  const dLng = r / (KM_PER_DEG_LAT * Math.cos(toRad(center.lat)));

  return {
    lat: center.lat + dLat * Math.sin(angle),
    lng: center.lng + dLng * Math.cos(angle),
  };
}

/** Converts meters to a human readable label. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Returns the north/south/east/west bounds enclosing a circle of the given
 * radius (in meters) around a center point. Used to fit the map to a radius
 * without needing a bound instance of a Leaflet shape.
 */
export function circleBounds(
  center: LatLng,
  radiusMeters: number,
): { north: number; south: number; east: number; west: number } {
  const dLat = radiusMeters / (KM_PER_DEG_LAT * 1000);
  const dLng =
    radiusMeters / (KM_PER_DEG_LAT * 1000 * Math.max(Math.cos(toRad(center.lat)), 1e-6));
  return {
    north: center.lat + dLat,
    south: center.lat - dLat,
    east: center.lng + dLng,
    west: center.lng - dLng,
  };
}
