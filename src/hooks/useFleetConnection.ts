import { useEffect } from "react";
import { usePartySocket } from "partysocket/react";
import { useFleetStore } from "../stores/fleetStore";
import type { FleetUpdate } from "../types/vessel";

const PARTYKIT_HOST =
  import.meta.env.DEV
    ? "localhost:1999"
    : "asv-fleet-cmd.aloofbuddha.partykit.dev";

export function useFleetConnection() {
  const updateFleet = useFleetStore((s) => s.updateFleet);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    party: "fleet",
    room: "main",
    onMessage(event) {
      try {
        const data = JSON.parse(event.data as string) as FleetUpdate;
        if (data.type === "fleet_update") {
          updateFleet(data.vessels, data.trails ?? {}, data.simSpeed);
        }
      } catch {
        // Ignore malformed messages
      }
    },
  });

  // Watch for sim speed changes and send to server
  useEffect(() => {
    return useFleetStore.subscribe((state, prev) => {
      if (state.simSpeed !== prev.simSpeed) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "set_speed", speed: state.simSpeed }));
        }
      }
    });
  }, [socket]);
}
