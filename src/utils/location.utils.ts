export type LocationPoint = {
  name: string;
  lat: number;
  lon: number;
};

export type NearestPickupResult = {
  isNear: boolean;
  nearestPoint: LocationPoint | null;
  distance: number | null;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const findNearestPickupPoint = (
  location: LocationPoint,
  pickupPoints: LocationPoint[],
  thresholdKm: number
): NearestPickupResult => {
  if (pickupPoints.length === 0) {
    return { isNear: false, nearestPoint: null, distance: null };
  }

  const nearest = pickupPoints.reduce<{
    point: LocationPoint;
    distance: number;
  } | null>((closest, point) => {
    const distance = haversineDistance(
      location.lat,
      location.lon,
      point.lat,
      point.lon
    );

    if (!closest || distance < closest.distance) {
      return { point, distance };
    }

    return closest;
  }, null);

  return {
    isNear: nearest !== null && nearest.distance <= thresholdKm,
    nearestPoint: nearest?.point ?? null,
    distance: nearest?.distance ?? null,
  };
};
