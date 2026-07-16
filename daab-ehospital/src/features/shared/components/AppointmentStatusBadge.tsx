import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/features/shared/types/hospital";
import { formatAppointmentStatus } from "@/features/shared/utils/appointments";

const statusClassName: Record<AppointmentStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-brand/15 bg-brand-mint text-brand",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  missed: "border-slate-200 bg-slate-50 text-slate-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export const AppointmentStatusBadge = ({
  status,
}: {
  status: AppointmentStatus;
}) => (
  <Badge className={statusClassName[status]} variant="outline">
    {formatAppointmentStatus(status)}
  </Badge>
);
