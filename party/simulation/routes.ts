import type { LatLng } from "../../src/types/vessel";

/** Gulf Stream patrol — Norfolk to Bermuda area */
export const gulfStreamPatrol: LatLng[] = [
  { lat: 36.85, lng: -75.98 }, // Norfolk
  { lat: 35.2, lng: -75.0 }, // Outer Banks
  { lat: 33.5, lng: -73.5 }, // Off Cape Hatteras
  { lat: 31.5, lng: -72.0 }, // Gulf Stream
  { lat: 30.0, lng: -71.0 },
  { lat: 32.0, lng: -73.0 }, // Return leg
  { lat: 34.5, lng: -74.5 },
  { lat: 36.85, lng: -75.98 }, // Back to Norfolk
];

/** Caribbean loop — Puerto Rico through Lesser Antilles */
export const caribbeanLoop: LatLng[] = [
  { lat: 18.47, lng: -66.12 }, // San Juan
  { lat: 17.5, lng: -64.5 }, // US Virgin Islands
  { lat: 16.5, lng: -62.5 }, // Toward Guadeloupe
  { lat: 15.5, lng: -61.5 }, // Dominica
  { lat: 14.6, lng: -61.0 }, // Martinique
  { lat: 15.5, lng: -63.0 }, // Return leg
  { lat: 17.0, lng: -65.0 },
  { lat: 18.47, lng: -66.12 }, // Back to San Juan
];

/** Gulf of Mexico survey — systematic grid pattern */
export const gulfMexicoSurvey: LatLng[] = [
  { lat: 27.0, lng: -90.0 }, // Central Gulf
  { lat: 28.0, lng: -88.0 },
  { lat: 27.0, lng: -86.0 },
  { lat: 28.0, lng: -84.5 },
  { lat: 27.0, lng: -83.0 },
  { lat: 26.0, lng: -85.0 },
  { lat: 27.0, lng: -87.0 },
  { lat: 27.0, lng: -90.0 }, // Return
];

/** Chesapeake Bay coastal patrol */
export const chesapeakePatrol: LatLng[] = [
  { lat: 37.0, lng: -76.33 }, // Chesapeake Bay mouth
  { lat: 37.5, lng: -76.0 },
  { lat: 38.0, lng: -76.2 },
  { lat: 38.5, lng: -76.5 },
  { lat: 38.9, lng: -76.4 }, // Near Annapolis
  { lat: 38.5, lng: -76.3 }, // Return
  { lat: 37.8, lng: -76.1 },
  { lat: 37.0, lng: -76.33 }, // Back to mouth
];

/** Florida Strait — fast intercept pattern */
export const floridaStraitIntercept: LatLng[] = [
  { lat: 25.77, lng: -80.19 }, // Miami
  { lat: 25.0, lng: -80.5 }, // South toward Keys
  { lat: 24.5, lng: -81.5 }, // Key West area
  { lat: 24.0, lng: -82.5 }, // Strait
  { lat: 23.5, lng: -83.0 }, // Deep patrol
  { lat: 24.5, lng: -82.0 }, // Return leg
  { lat: 25.0, lng: -81.0 },
  { lat: 25.77, lng: -80.19 }, // Back to Miami
];

/** Norfolk-Bermuda rapid transit */
export const norfolkBermudaTransit: LatLng[] = [
  { lat: 36.85, lng: -75.98 }, // Norfolk
  { lat: 35.5, lng: -74.0 },
  { lat: 34.0, lng: -72.0 },
  { lat: 33.0, lng: -69.0 },
  { lat: 32.37, lng: -64.69 }, // Bermuda
  { lat: 33.5, lng: -68.0 }, // Return
  { lat: 35.0, lng: -73.0 },
  { lat: 36.85, lng: -75.98 }, // Back to Norfolk
];
