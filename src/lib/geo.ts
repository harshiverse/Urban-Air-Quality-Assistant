/**
 * Geodesic calculation and location utilities for Urban Air Quality Assistant.
 * Uses the Haversine formula to compute great-circle distance between two coordinates.
 */

const EARTH_RADIUS_KM = 6371.0;

/**
 * Validates whether latitude and longitude are valid coordinates on Earth.
 */
export function isValidCoordinate(latitude: number | null | undefined, longitude: number | null | undefined): boolean {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return false;
  }
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Calculates great-circle distance in kilometers between two points on Earth using the Haversine formula.
 * Returns null if any coordinate is missing or invalid.
 */
export function haversineDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }

  const toRad = (angle: number) => (angle * Math.PI) / 180.0;

  const dLat = toRad(lat2! - lat1!);
  const dLon = toRad(lon2! - lon1!);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1!)) * Math.cos(toRad(lat2!)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 */
export function formatDistanceKm(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined) {
    return 'Distance unavailable';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
