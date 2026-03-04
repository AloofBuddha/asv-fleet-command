import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/** Round to a "nice" nautical mile number for scale bar display */
function niceRound(n: number): number {
  const nice = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  return nice.find((v) => v >= n * 0.5) ?? Math.round(n);
}

function createScaleControl(map: L.Map): L.Control {
  const container = L.DomUtil.create("div");
  container.style.cssText =
    "background:rgba(10,14,23,0.8);color:#8899aa;padding:4px 10px;" +
    "font-size:11px;border:1px solid #2a3a4e;border-radius:3px;" +
    "font-family:monospace;pointer-events:none;user-select:none;";

  const update = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const metersPerPx =
      (40075016.686 * Math.cos((center.lat * Math.PI) / 180)) /
      Math.pow(2, zoom + 8);
    const targetBarPx = 120;
    const barDistNM = (metersPerPx * targetBarPx) / 1852;
    const niceNM = niceRound(barDistNM);
    const actualPx = (niceNM / barDistNM) * targetBarPx;

    container.innerHTML =
      `<div style="width:${actualPx}px;border-bottom:2px solid #5a7a9a;` +
      `text-align:center;padding-bottom:2px">${niceNM} NM</div>`;
  };

  map.on("zoomend moveend", update);
  update();

  const Control = L.Control.extend({
    options: { position: "bottomleft" as L.ControlPosition },
    onAdd() {
      return container;
    },
  });

  return new Control();
}

/**
 * Nautical mile scale bar — dark-themed, updates on zoom/pan.
 * Standard feature on professional maritime displays.
 */
export function NauticalScale() {
  const map = useMap();

  useEffect(() => {
    const control = createScaleControl(map);
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}
