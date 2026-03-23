import {
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  XCircle,
  Sparkles,
  HelpCircle,
  CornerDownRight,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

type PageStatus = "healthy" | "warning" | "critical" | "dead" | "new" | "unknown" | "redirected" | "excluded";

const STATUS_CONFIG: Record<PageStatus, { color: string; bg: string; label: string; icon: LucideIcon }> = {
  healthy:    { color: "#16A34A", bg: "#F0FDF4", label: "Healthy",    icon: CheckCircle2 },
  warning:    { color: "#D97706", bg: "#FFFBEB", label: "Warning",    icon: TrendingDown },
  critical:   { color: "#DC2626", bg: "#FEF2F2", label: "Critical",   icon: AlertTriangle },
  dead:       { color: "#6B7280", bg: "#F9FAFB", label: "Dead",       icon: XCircle },
  new:        { color: "#2563EB", bg: "#EFF6FF", label: "New",        icon: Sparkles },
  unknown:    { color: "#9CA3AF", bg: "#F9FAFB", label: "Unknown",    icon: HelpCircle },
  redirected: { color: "#9CA3AF", bg: "#F9FAFB", label: "Redirected", icon: CornerDownRight },
  excluded:   { color: "#6B7280", bg: "#F3F4F6", label: "Excluded",   icon: EyeOff },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as PageStatus] ?? STATUS_CONFIG.unknown;
  const Icon = cfg.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon size={13} strokeWidth={1.5} />
      {cfg.label}
    </span>
  );
}
