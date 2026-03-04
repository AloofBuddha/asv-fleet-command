import { useEffect, useRef } from "react";
import { useFleetStore } from "../stores/fleetStore";
import type { FleetUpdate } from "../types/vessel";

const PARTYKIT_HOST = "localhost:1999";
const RECONNECT_DELAY_MS = 1000;

/** Shared ref so other code can send messages to the fleet server */
let fleetSocket: WebSocket | null = null;

export function sendToFleet(message: unknown) {
  if (fleetSocket && fleetSocket.readyState === WebSocket.OPEN) {
    fleetSocket.send(JSON.stringify(message));
  }
}

export function useFleetConnection() {
  const updateFleet = useFleetStore((s) => s.updateFleet);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Watch for sim speed changes and send to server
  useEffect(() => {
    return useFleetStore.subscribe((state, prev) => {
      if (state.simSpeed !== prev.simSpeed) {
        sendToFleet({ type: "set_speed", speed: state.simSpeed });
      }
    });
  }, []);

  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      const url = `ws://${PARTYKIT_HOST}/parties/fleet/main`;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      fleetSocket = ws;

      ws.onopen = () => {
        console.log("[fleet-ws] connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as FleetUpdate;
          if (data.type === "fleet_update") {
            const v0 = data.vessels[0];
            console.log(
              `[fleet-ws] update: ${data.vessels.length} vessels, v0 pos=${v0?.position.lat.toFixed(6)},${v0?.position.lng.toFixed(6)}`,
            );
            updateFleet(data.vessels, data.trails ?? {}, data.simSpeed);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = (ev) => {
        console.log(`[fleet-ws] closed code=${ev.code} reason=${ev.reason}`);
        if (fleetSocket === ws) fleetSocket = null;
        if (!disposed) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => {
        console.warn("Fleet WebSocket error — will reconnect");
        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (fleetSocket === wsRef.current) fleetSocket = null;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [updateFleet]);
}
