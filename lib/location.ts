import { LocationVerification } from "./types";

// Default Hospital Target: City General Hospital (Mumbai / Center)
export const DEFAULT_HOSPITAL = {
  name: "ArogyaFlow City General Hospital",
  lat: 19.0760,
  lng: 72.8777,
  maxDistanceKm: 10.0,
};

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // round to 2 decimal places
}

/**
 * Evaluates proximity of patient location to target hospital
 */
export function checkHospitalProximity(
  userLat?: number,
  userLng?: number,
  forceDummy: boolean = false
): LocationVerification {
  if (forceDummy || userLat === undefined || userLng === undefined) {
    // Simulated dummy position within 1.2 km of hospital
    const dummyDistance = 1.2;
    return {
      isWithinRange: true,
      distanceKm: dummyDistance,
      userLat: DEFAULT_HOSPITAL.lat + 0.005,
      userLng: DEFAULT_HOSPITAL.lng + 0.005,
      hospitalName: DEFAULT_HOSPITAL.name,
      isDummyMode: true,
    };
  }

  const distance = calculateHaversineDistance(
    userLat,
    userLng,
    DEFAULT_HOSPITAL.lat,
    DEFAULT_HOSPITAL.lng
  );

  return {
    isWithinRange: distance <= DEFAULT_HOSPITAL.maxDistanceKm,
    distanceKm: distance,
    userLat,
    userLng,
    hospitalName: DEFAULT_HOSPITAL.name,
    isDummyMode: false,
  };
}
