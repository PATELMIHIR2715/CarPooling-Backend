import { REQUEST_FAILED, ROUTE_NOT_FOUND } from "../../constants/messages.js";
import type { TLocationPoint, TRoutePoint } from "../../constants/types.js";

class LocationService {
  // ---------------------------------------------------
  // Generic Fetch With Retry
  // ---------------------------------------------------
  private async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries = 3
  ): Promise<any> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 15000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }
      }
    }

    throw new Error(REQUEST_FAILED);
  }

  // ---------------------------------------------------
  // Search Locations
  // ---------------------------------------------------
  async searchLocations(query: string) {
    const data = await this.fetchWithRetry(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&countrycodes=in&limit=10`,
      {
        headers: {
          "User-Agent": "CarpoolApp/1.0",
        },
      }
    );

    return data.map((item: any) => ({
      name: item.display_name,
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  }

  // ---------------------------------------------------
  // Get Route From OSRM
  // ---------------------------------------------------
  private async getOSRMRoute(start: TLocationPoint, end: TLocationPoint) {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start.lon},${start.lat};${end.lon},${end.lat}` +
      `?overview=false&steps=true`;

    const data = await this.fetchWithRetry(url);

    if (!data?.routes?.length) {
      throw new Error(ROUTE_NOT_FOUND);
    }

    return data.routes[0];
  }

  // ---------------------------------------------------
  // Check Valid Route Point
  // ---------------------------------------------------
  private isValidRouteName(name: string) {
    if (!name) return false;

    const lower = name.toLowerCase().trim();

    // Remove useless names
    const blockedWords = [
      "unnamed",
      "road",
      "street",
      "service road",
      "unknown",
    ];

    return (
      lower.length > 2 && !blockedWords.some((word) => lower.includes(word))
    );
  }

  // ---------------------------------------------------
  // Remove Duplicate Route Points
  // ---------------------------------------------------
  private removeDuplicates(points: TRoutePoint[]): TRoutePoint[] {
    const uniqueMap = new Map<string, TRoutePoint>();

    for (const point of points) {
      const key = point.name.toLowerCase().trim();

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, point);
      }
    }

    return Array.from(uniqueMap.values());
  }

  // ---------------------------------------------------
  // MAIN FUNCTION
  // ---------------------------------------------------
  async getRoutePoints(start: TLocationPoint, end: TLocationPoint) {
    // Get Route
    const route = await this.getOSRMRoute(start, end);

    const routePoints: TRoutePoint[] = [];

    // Loop Through Route Legs
    for (const leg of route.legs) {
      // Loop Through Route Steps
      for (const step of leg.steps) {
        const maneuver = step.maneuver;

        if (!maneuver?.location) {
          continue;
        }

        const [lon, lat] = maneuver.location;

        // Priority Based Name Extraction
        const name = step.destinations || step.rotary_name || step.name;

        // Skip invalid names
        if (!this.isValidRouteName(name)) {
          continue;
        }

        routePoints.push({
          id: `${lat}-${lon}-${name}`,
          name,
          lat,
          lon,
          type: "route_point",
        });
      }
    }

    // Remove duplicates
    const uniquePoints = this.removeDuplicates(routePoints);

    // Limit points for cleaner UI
    const limitedPoints = uniquePoints.slice(0, 100);

    // Final Response
    return [
      {
        id: "start",
        name: start.name,
        lat: start.lat,
        lon: start.lon,
        type: "start",
      },

      ...limitedPoints,

      {
        id: "end",
        name: end.name,
        lat: end.lat,
        lon: end.lon,
        type: "end",
      },
    ];
  }
}

export default new LocationService();
