import { useCallback, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors } from "./styles/tokens.stylex";
import { FleetMap } from "./components/Map/FleetMap";
import { Header } from "./components/Header";
import { FleetSidebar } from "./components/Sidebar/FleetSidebar";
import { VesselDetailPanel } from "./components/Detail/VesselDetailPanel";
import { Demo } from "./components/Demo";
import { useFleetConnection } from "./hooks/useFleetConnection";
import { useFleetStore } from "./stores/fleetStore";

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: colors.bgDeep,
    color: colors.textPrimary,
  },
  body: {
    display: "flex",
    flexGrow: 1,
    overflow: "hidden",
  },
  mapArea: {
    flexGrow: 1,
    position: "relative",
  },
});

const isDemo = new URLSearchParams(window.location.search).has("demo");

function FleetApp() {
  useFleetConnection();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const selectedVesselId = useFleetStore((s) => s.selectedVesselId);
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleFlyTo = useCallback((lat: number, lng: number) => {
    setFlyToTarget({ lat, lng });
  }, []);

  return (
    <div {...stylex.props(styles.root)}>
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
      />
      <div {...stylex.props(styles.body)}>
        <FleetSidebar
          collapsed={sidebarCollapsed}
          onFlyTo={handleFlyTo}
        />
        <div {...stylex.props(styles.mapArea)}>
          <FleetMap
            flyToTarget={flyToTarget}
            sidebarCollapsed={sidebarCollapsed}
            detailOpen={!!selectedVesselId}
          />
        </div>
        <VesselDetailPanel />
      </div>
    </div>
  );
}

export function App() {
  if (isDemo) return <Demo />;
  return <FleetApp />;
}
