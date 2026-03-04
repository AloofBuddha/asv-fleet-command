import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapFlyToProps {
  target: { lat: number; lng: number } | null;
}

/**
 * Flies the map to a target position when it changes.
 * Rendered inside MapContainer to access the map instance.
 */
export function MapFlyTo({ target }: MapFlyToProps) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 7), {
        duration: 1,
      });
    }
  }, [map, target]);

  return null;
}
