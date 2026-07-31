import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/features/shared/types/hospital";
import { formatAppointmentStatus } from "@/features/shared/utils/appointments";

const statusClassName: Record<AppointmentStatus, string> = {
  pending: "border-brand-warning/20 bg-brand-warning-soft text-brand-warning",
  confirmed: "border-brand-success/20 bg-brand-success-soft text-brand-success",
  completed: "border-brand-success/20 bg-brand-success-soft text-brand-success",
  missed: "border-brand-neutral/20 bg-brand-neutral-soft text-brand-neutral",
  cancelled: "border-brand-danger/20 bg-brand-danger-soft text-brand-danger",
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
