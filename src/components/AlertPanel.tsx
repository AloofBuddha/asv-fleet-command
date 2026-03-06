import { useEffect, useRef, useState, useCallback } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../styles/tokens.stylex";
import { useFleetStore } from "../stores/fleetStore";
import type { Alert, AlertType } from "../types/vessel";
import { Bell } from "lucide-react";

const ALERT_COLORS: Record<AlertType, string> = {
  battery_critical: "#ef4444",
  battery_warning: "#f59e0b",
  comms_lost: "#8b5cf6",
  status_critical: "#ef4444",
  status_offline: "#6b7280",
};

// ── AlertDropdown (rendered in Header) ──────────────────────────

const dropdownStyles = stylex.create({
  wrapper: {
    position: "relative",
  },
  bellBtn: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    borderWidth: 0,
    borderStyle: "none",
    color: colors.textSecondary,
    cursor: "pointer",
    padding: spacing.xs,
  },
  countBadge: {
    position: "absolute",
    top: "-2px",
    right: "-4px",
    fontSize: "9px",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: colors.statusCritical,
    borderRadius: "10px",
    minWidth: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: "3px",
    lineHeight: 1,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "320px",
    maxHeight: "400px",
    overflowY: "auto",
    backgroundColor: colors.bgSurface,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radii.lg,
    zIndex: 2000,
  },
  dropdownHeader: {
    fontSize: fontSizes.xs,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  empty: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    paddingBlock: spacing.lg,
    paddingInline: spacing.md,
    textAlign: "center",
  },
  alertRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  alertRowAcknowledged: {
    opacity: 0.45,
  },
  alertMessage: {
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    flexGrow: 1,
    lineHeight: 1.4,
  },
  alertTime: {
    fontSize: "10px",
    color: colors.textMuted,
    flexShrink: 0,
    fontFamily: "monospace",
  },
  dismissBtn: {
    background: "none",
    borderWidth: 0,
    borderStyle: "none",
    color: colors.textMuted,
    cursor: "pointer",
    fontSize: fontSizes.sm,
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },
});

export function AlertDropdown() {
  const alerts = useFleetStore((s) => s.alerts);
  const acknowledgeAlert = useFleetStore((s) => s.acknowledgeAlert);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Sort: unacknowledged first (newest first), then acknowledged (newest first)
  const sorted = [...alerts].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    return b.timestamp - a.timestamp;
  });

  function formatTime(ts: number) {
    return new Date(ts).toISOString().slice(11, 19) + "Z";
  }

  return (
    <div ref={wrapperRef} {...stylex.props(dropdownStyles.wrapper)}>
      <button
        onClick={() => setOpen((o) => !o)}
        {...stylex.props(dropdownStyles.bellBtn)}
        aria-label={`Alerts${unacknowledgedCount > 0 ? ` (${unacknowledgedCount} new)` : ""}`}
      >
        <Bell size={16} />
        {unacknowledgedCount > 0 && (
          <span {...stylex.props(dropdownStyles.countBadge)}>
            {unacknowledgedCount}
          </span>
        )}
      </button>

      {open && (
        <div {...stylex.props(dropdownStyles.dropdown)}>
          <div {...stylex.props(dropdownStyles.dropdownHeader)}>
            Alerts ({alerts.length})
          </div>
          {sorted.length === 0 ? (
            <div {...stylex.props(dropdownStyles.empty)}>No alerts</div>
          ) : (
            sorted.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onDismiss={acknowledgeAlert}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  onDismiss,
  formatTime,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
  formatTime: (ts: number) => string;
}) {
  return (
    <div
      {...stylex.props(
        dropdownStyles.alertRow,
        alert.acknowledged && dropdownStyles.alertRowAcknowledged,
      )}
      style={{ borderLeftColor: ALERT_COLORS[alert.type] }}
    >
      <span {...stylex.props(dropdownStyles.alertMessage)}>
        {alert.message}
      </span>
      <span {...stylex.props(dropdownStyles.alertTime)}>
        {formatTime(alert.timestamp)}
      </span>
      {!alert.acknowledged && (
        <button
          onClick={() => onDismiss(alert.id)}
          {...stylex.props(dropdownStyles.dismissBtn)}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── AlertToast (rendered in map area) ───────────────────────────

const TOAST_DURATION_MS = 5000;

const toastStyles = stylex.create({
  container: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1000,
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    paddingBlock: spacing.sm,
    paddingInline: spacing.md,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    minWidth: "200px",
    maxWidth: "300px",
    pointerEvents: "auto",
    opacity: 0.95,
  },
  message: {
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    flexGrow: 1,
    lineHeight: 1.4,
  },
  dismissBtn: {
    background: "none",
    borderWidth: 0,
    borderStyle: "none",
    color: colors.textMuted,
    cursor: "pointer",
    fontSize: fontSizes.sm,
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },
});

export function AlertToast() {
  const [toastAlert, setToastAlert] = useState<Alert | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Subscribe to store changes outside render cycle
  useEffect(() => {
    let lastCount = useFleetStore.getState().alerts.length;

    const unsub = useFleetStore.subscribe((state) => {
      const { alerts } = state;
      if (alerts.length > lastCount) {
        const newest = alerts[alerts.length - 1]!;
        if (!newest.acknowledged) {
          setToastAlert(newest);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setToastAlert(null);
          }, TOAST_DURATION_MS);
        }
      }
      lastCount = alerts.length;
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (toastAlert) {
      useFleetStore.getState().acknowledgeAlert(toastAlert.id);
    }
    setToastAlert(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [toastAlert]);

  if (!toastAlert) return null;

  return (
    <div {...stylex.props(toastStyles.container)}>
      <div
        {...stylex.props(toastStyles.toast)}
        style={{ borderLeftColor: ALERT_COLORS[toastAlert.type] }}
      >
        <span {...stylex.props(toastStyles.message)}>
          {toastAlert.message}
        </span>
        <button
          onClick={dismiss}
          {...stylex.props(toastStyles.dismissBtn)}
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
