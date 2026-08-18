import { Link } from "react-router";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, ClipboardList, HeartPulse } from "lucide-react";

import { AppointmentStatusBadge } from "@/features/shared/components/AppointmentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Appointment,
  Clinic,
  Patient,
  Service,
} from "@/features/shared/types/hospital";
import { formatDateTime } from "@/features/shared/utils/appointments";

type EntityMap<T> = Map<string, T>;

export const PatientSummaryCards = ({
  appointments,
}: {
  appointments: Appointment[];
}) => {
  const active = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  ).length;
  const completed = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <SummaryCard
        label="Appointments"
        value={appointments.length}
        icon={<CalendarDays className="h-4 w-4" />}
        action={
          <Link
            to="/patient/appointments"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand text-white transition hover:bg-brand-dark"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />
      <SummaryCard
        label="Active Visits"
        value={active}
        icon={<HeartPulse className="h-4 w-4" />}
        tone="soft"
      />
      <SummaryCard
        label="Medical Records"
        value={completed}
        icon={<ClipboardList className="h-4 w-4" />}
      />
    </section>
  );
};

export const MedicalHistorySection = ({
  appointments,
  clinicsById,
  servicesById,
}: {
  appointments: Appointment[];
  clinicsById: EntityMap<Clinic>;
  servicesById: EntityMap<Service>;
}) => (
  <section className="rounded-[8px] border border-brand-border bg-brand-surface p-4 shadow-brand-card">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-brand-ink">
          Medical history
        </h2>
      </div>
      <Button asChild variant="outline" className="h-8 rounded-[6px]">
        <Link to="/patient/appointments">View all</Link>
      </Button>
    </div>
    <div className="mt-4 overflow-hidden rounded-[6px] border border-brand-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-brand-paper-soft hover:bg-brand-paper-soft">
            <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
              Visit
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
              Post
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
              Date
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
              Status
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-semibold text-brand-muted">
              Record
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length ? (
            appointments.slice(0, 6).map((appointment) => {
              const clinic = clinicsById.get(appointment.clinic_id);
              const service = appointment.service_id
                ? servicesById.get(appointment.service_id)
                : undefined;

              return (
                <TableRow
                  key={appointment.id}
                  className="border-brand-border/70 hover:bg-brand-light"
                >
                  <TableCell className="px-3 py-3 text-sm font-medium text-brand-ink">
                    {service?.name || "General visit"}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-brand-muted">
                    {clinic ? `${clinic.name}, ${clinic.camp}` : "Clinic"}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-brand-muted">
                    {formatDateTime(
                      appointment.requested_date,
                      appointment.requested_time
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <AppointmentStatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <Button asChild variant="outline" className="h-8 rounded-[6px]">
                      <Link to={`/patient/appointments/${appointment.id}`}>
                        Open
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-28 text-center text-sm text-brand-muted"
              >
                Your visit history will appear after your first appointment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </section>
);

export const PatientContextPanel = ({
  patient,
  appointments,
}: {
  patient?: Patient | null;
  appointments: Appointment[];
}) => {
  const completed = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;
  const active = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  ).length;

  return (
    <aside className="divide-y divide-brand-divider bg-brand-surface">
      <section className="bg-brand-surface p-5">
        <h2 className="text-base font-semibold text-brand-ink">
          Personal profile
        </h2>
        {patient ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-lg font-semibold text-brand-ink">
                {patient.full_name}
              </p>
              <p className="text-sm text-brand-muted">
                {patient.refugee_id || "No refugee ID"}
              </p>
            </div>
            <dl className="divide-y divide-brand-divider rounded-[8px] border border-brand-divider">
              <ProfileRow label="Camp" value={patient.camp || "Not recorded"} />
              <ProfileRow label="Phone" value={patient.phone || "Not recorded"} />
              <ProfileRow
                label="Gender"
                value={patient.gender || "Not recorded"}
              />
              <ProfileRow
                label="Date of birth"
                value={patient.date_of_birth || "Not recorded"}
              />
            </dl>
            <Button asChild variant="outline" className="h-9 w-full rounded-[6px] border-brand-border">
              <Link to="/patient/profile">Update profile</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-5 rounded-[8px] border border-dashed border-brand-border bg-brand-paper-soft p-4 text-sm leading-6 text-brand-muted">
            Complete your patient profile so appointments can be linked to your
            record.
          </div>
        )}
      </section>
      <ContextSection title="Health summary">
        <ProfileRow label="Active visits" value={String(active)} />
        <ProfileRow label="Completed visits" value={String(completed)} />
        <ProfileRow label="Total records" value={String(appointments.length)} />
      </ContextSection>
    </aside>
  );
};

const SummaryCard = ({
  label,
  value,
  icon,
  action,
  tone = "surface",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  action?: ReactNode;
  tone?: "surface" | "primary" | "soft";
}) => {
  const isPrimary = tone === "primary";
  const isSoft = tone === "soft";

  return (
    <article
      className={`relative min-h-[106px] overflow-hidden rounded-[8px] border p-4 shadow-brand-card ${
        isPrimary
          ? "border-brand bg-brand text-white"
          : isSoft
          ? "border-brand-border bg-brand-light text-brand-ink"
          : "border-brand-border bg-brand-surface text-brand-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-[6px] ${
            isPrimary
              ? "bg-white/18 text-white"
              : isSoft
              ? "bg-brand-surface text-brand"
              : "bg-muted text-brand-muted"
          }`}
        >
          {icon}
        </div>
        {action}
      </div>
      <div className="mt-4">
        <p
          className={`text-xl font-semibold leading-none ${
            isPrimary ? "text-white" : "text-brand-ink"
          }`}
        >
          {value}
        </p>
        <p
          className={`mt-2 text-xs font-medium ${
            isPrimary ? "text-white/82" : "text-brand-muted"
          }`}
        >
          {label}
        </p>
      </div>
    </article>
  );
};

const ContextSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="p-5">
    <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
    <div className="mt-4 rounded-[8px] border border-brand-divider">{children}</div>
  </section>
);

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[104px_1fr] gap-3 px-3 py-2.5">
    <dt className="text-xs font-medium uppercase tracking-[0.06em] text-brand-muted">
      {label}
    </dt>
    <dd className="text-sm text-brand-ink">{value}</dd>
  </div>
);
