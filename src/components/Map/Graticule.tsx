import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Lat/lon grid overlay — provides spatial reference on open ocean.
 * Standard feature on ECDIS and professional AIS displays.
 * Draws lines every 5 degrees with labels.
 */
export function Graticule() {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup();

    function drawGraticule() {
      layer.clearLayers();

      const bounds = map.getBounds();
      const zoom = map.getZoom();

      // Interval: 10° at low zoom, 5° at medium, 2° at high
      let interval = 10;
      if (zoom >= 5) interval = 5;
      if (zoom >= 7) interval = 2;
      if (zoom >= 9) interval = 1;

      const style: L.PolylineOptions = {
        color: "#3a4a5e",
        weight: 0.5,
        opacity: 0.5,
        interactive: false,
      };

      // Latitude lines
      const startLat = Math.floor(bounds.getSouth() / interval) * interval;
      const endLat = Math.ceil(bounds.getNorth() / interval) * interval;
      for (let lat = startLat; lat <= endLat; lat += interval) {
        L.polyline(
          [
            [lat, bounds.getWest()],
            [lat, bounds.getEast()],
          ],
          style,
        ).addTo(layer);

        // Label
        L.marker([lat, bounds.getWest() + 0.5], {
          icon: L.divIcon({
            className: "",
            html: `<span style="color:#5a6a7a;font-size:10px;white-space:nowrap">${lat}°</span>`,
            iconSize: [40, 12],
            iconAnchor: [0, 6],
          }),
          interactive: false,
        }).addTo(layer);
      }

      // Longitude lines
      const startLng = Math.floor(bounds.getWest() / interval) * interval;
      const endLng = Math.ceil(bounds.getEast() / interval) * interval;
      for (let lng = startLng; lng <= endLng; lng += interval) {
        L.polyline(
          [
            [bounds.getSouth(), lng],
            [bounds.getNorth(), lng],
          ],
          style,
        ).addTo(layer);

        // Label
        L.marker([bounds.getSouth() + 0.5, lng], {
          icon: L.divIcon({
            className: "",
            html: `<span style="color:#5a6a7a;font-size:10px;white-space:nowrap">${lng}°</span>`,
            iconSize: [40, 12],
            iconAnchor: [0, 0],
          }),
          interactive: false,
        }).addTo(layer);
      }
    }

    layer.addTo(map);
    drawGraticule();

    map.on("moveend", drawGraticule);
    map.on("zoomend", drawGraticule);

    return () => {
      map.off("moveend", drawGraticule);
      map.off("zoomend", drawGraticule);
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
