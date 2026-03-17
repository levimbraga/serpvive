import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Skull } from "lucide-react";

type StatsRowProps = {
  totalPages: number;
  healthy: number;
  warning: number;
  critical: number;
  dead: number;
};

const stats = [
  { key: "total", label: "Total Pages", icon: FileText, color: "#3B82F6", bgColor: "#EFF6FF" },
  { key: "healthy", label: "Healthy", icon: CheckCircle2, color: "#16A34A", bgColor: "#F0FDF4" },
  { key: "warning", label: "Warning", icon: AlertTriangle, color: "#D97706", bgColor: "#FFFBEB" },
  { key: "critical", label: "Critical", icon: AlertCircle, color: "#DC2626", bgColor: "#FEF2F2" },
  { key: "dead", label: "Dead", icon: Skull, color: "#6B7280", bgColor: "#F9FAFB" },
] as const;

export default function StatsRow({ totalPages, healthy, warning, critical, dead }: StatsRowProps) {
  const values: Record<string, number> = {
    total: totalPages,
    healthy,
    warning,
    critical,
    dead,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ key, label, icon: Icon, color, bgColor }) => (
        <div
          key={key}
          className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3 transition-shadow duration-150 hover:shadow-sm"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <Icon size={20} strokeWidth={1.5} style={{ color }} />
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-[#111827]">{values[key]}</p>
            <p className="text-[13px] text-[#6B7280]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
