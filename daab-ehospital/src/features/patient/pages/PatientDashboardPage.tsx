import { useMemo, type ReactNode } from "react";
import { useList } from "@refinedev/core";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  Appointment,
  AppointmentStatus,
  Clinic,
  Service,
} from "@/features/shared/types/hospital";
import { formatDateTime } from "@/features/shared/utils/appointments";
import { AppointmentStatusBadge } from "../components/AppointmentStatusBadge";
import { PatientProfileCompletion } from "../components/PatientProfileCompletion";
import { useCurrentPatient } from "../hooks/useCurrentPatient";

const statusOrder: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "missed",
  "cancelled",
];

export const PatientDashboardPage = () => {
  const { patient, isLoading: patientLoading } = useCurrentPatient();

  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: patient?.id
      ? [{ field: "patient_id", operator: "eq", value: patient.id }]
      : [{ field: "patient_id", operator: "eq", value: "__no_patient__" }],
    sorters: [{ field: "requested_date", order: "asc" }],
    queryOptions: {
      enabled: Boolean(patient?.id),
    },
  });

  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });

  const servicesList = useList<Service>({
    resource: "services",
    pagination: { mode: "off" },
  });

  const appointments = appointmentsList.result.data;
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;
  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const nextAppointment = appointments.find((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  );
  const recentAppointments = [...appointments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  const clinicsById = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.id, clinic])),
    [clinicsList.result.data]
  );
  const servicesById = useMemo(
    () =>
      new Map(servicesList.result.data.map((service) => [service.id, service])),
    [servicesList.result.data]
  );

  const nextClinic = nextAppointment
    ? clinicsById.get(nextAppointment.clinic_id)
    : undefined;
  const nextService = nextAppointment?.service_id
    ? servicesById.get(nextAppointment.service_id)
    : undefined;

  const completionRate = appointments.length
    ? Math.round((completedCount / appointments.length) * 100)
    : 0;

  const statusCounts = statusOrder.map((status) => ({
    status,
    count: appointments.filter((appointment) => appointment.status === status)
      .length,
  }));
  const highestStatusCount = Math.max(
    1,
    ...statusCounts.map((item) => item.count)
  );

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-muted">Patient portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-ink">
            Welcome{patient?.full_name ? `, ${patient.full_name.split(" ")[0]}` : ""}
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[360px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <Input
              className="h-11 rounded-full border-0 bg-white pl-9 shadow-brand-soft"
              placeholder="Search appointments, clinics, services"
              readOnly
            />
          </div>
          <Button
            asChild
            className="h-11 rounded-full bg-brand px-5 hover:bg-brand-dark"
          >
            <Link to="/patient/book">Book visit</Link>
          </Button>
        </div>
      </div>

      {!patientLoading && !patient && (
        <Card className="mb-5 rounded-[14px] border-brand-border bg-white shadow-brand-card">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-ink">
                Complete your patient profile
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
                Create a profile first so your bookings and appointment history
                can be linked to one patient record.
              </p>
            </div>
            <Button
              asChild
              className="w-fit rounded-full bg-brand hover:bg-brand-dark"
            >
              <Link to="/patient/profile">Create profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-muted">
                      Care readiness
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-brand-ink">
                      {patient ? "Profile active" : "Profile needed"}
                    </h2>
                  </div>
                  <Badge className="rounded-full border-brand/15 bg-brand-mint text-brand">
                    {completionRate || 0}%
                  </Badge>
                </div>
                <div className="mx-auto my-8 flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(var(--brand-teal)_0deg,var(--brand-teal)_252deg,var(--brand-mint)_252deg,var(--brand-mint)_360deg)]">
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-3xl font-semibold text-brand-ink">
                      {appointments.length}
                    </p>
                    <p className="text-xs text-brand-muted">visits</p>
                  </div>
                </div>
                <p className="text-center text-sm leading-6 text-brand-muted">
                  {patient
                    ? "Your clinic profile is ready for appointment requests."
                    : "Complete your profile to begin booking care."}
                </p>
                <Button
                  asChild
                  className="mt-5 h-11 w-full rounded-full bg-brand hover:bg-brand-dark"
                >
                  <Link to="/patient/profile">
                    {patient ? "Review profile" : "Set up profile"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-xl text-brand-ink">
                    Appointment analytics
                  </CardTitle>
                  <p className="mt-1 text-sm text-brand-muted">
                    Current request status overview
                  </p>
                </div>
                <Badge className="rounded-full border-brand-border bg-brand-paper-soft text-brand-muted">
                  Live
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <MetricPill
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="Total"
                    value={appointments.length}
                  />
                  <MetricPill
                    icon={<Clock3 className="h-4 w-4" />}
                    label="Pending"
                    value={pendingCount}
                  />
                  <MetricPill
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Confirmed"
                    value={confirmedCount}
                  />
                </div>

                <div className="rounded-[14px] bg-brand-paper-soft p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-ink">
                      Request distribution
                    </p>
                    <p className="text-xs text-brand-muted">Status mix</p>
                  </div>
                  <div className="flex h-44 items-end gap-3">
                    {statusCounts.map((item) => (
                      <StatusBar
                        key={item.status}
                        label={item.status.slice(0, 3)}
                        value={item.count}
                        height={Math.max(
                          10,
                          Math.round((item.count / highestStatusCount) * 100)
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-brand-border/60">
              <div>
                <CardTitle className="text-xl text-brand-ink">
                  Recent appointments
                </CardTitle>
                <p className="mt-1 text-sm text-brand-muted">
                  The latest requests linked to your patient profile
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/patient/appointments">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentAppointments.length ? (
                <div className="divide-y divide-brand-border/60">
                  {recentAppointments.map((appointment) => {
                    const clinic = clinicsById.get(appointment.clinic_id);
                    const service = appointment.service_id
                      ? servicesById.get(appointment.service_id)
                      : undefined;

                    return (
                      <div
                        key={appointment.id}
                        className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <p className="font-medium text-brand-ink">
                            {service?.name || "General clinic visit"}
                          </p>
                          <p className="mt-1 text-sm text-brand-muted">
                            {appointment.reference_code}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-ink">
                            {clinic
                              ? `${clinic.name}, ${clinic.camp}`
                              : "Clinic"}
                          </p>
                          <p className="mt-1 text-sm text-brand-muted">
                            {formatDateTime(
                              appointment.requested_date,
                              appointment.requested_time
                            )}
                          </p>
                        </div>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-sm text-brand-muted">
                    No appointment requests yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <PatientProfileCompletion patient={patient} />

          <Card className="overflow-hidden rounded-[18px] border-0 bg-white shadow-brand-card">
            <div className="h-24 bg-brand-mint" />
            <CardContent className="-mt-10 p-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand text-white shadow-brand-soft">
                <UserRound className="h-9 w-9" />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-brand-ink">
                  {patient?.full_name || "Patient profile"}
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  {patient?.camp || "Camp not selected"}
                </p>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <ProfileLine label="Refugee ID" value={patient?.refugee_id} />
                <ProfileLine label="Phone" value={patient?.phone} />
                <ProfileLine label="Gender" value={patient?.gender} />
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-5 w-full rounded-full"
              >
                <Link to="/patient/profile">Edit profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-xl text-brand-ink">
                Next appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="space-y-4">
                  <AppointmentStatusBadge status={nextAppointment.status} />
                  <div>
                    <p className="text-sm text-brand-muted">Visit time</p>
                    <p className="mt-1 font-medium text-brand-ink">
                      {formatDateTime(
                        nextAppointment.requested_date,
                        nextAppointment.requested_time
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted">Clinic</p>
                    <p className="mt-1 font-medium text-brand-ink">
                      {nextClinic
                        ? `${nextClinic.name}, ${nextClinic.camp}`
                        : "Clinic"}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to={`/patient/appointments/${nextAppointment.id}`}>
                      Open details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm leading-6 text-brand-muted">
                    You do not have an upcoming appointment.
                  </p>
                  <Button
                    asChild
                    className="mt-4 w-full rounded-full bg-brand hover:bg-brand-dark"
                  >
                    <Link to="/patient/book">Book appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-brand-ink text-white shadow-brand-card">
            <CardContent className="p-5">
              <ShieldCheck className="h-7 w-7 text-brand-mint" />
              <h2 className="mt-4 text-lg font-semibold">Care note</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Appointment requests are reviewed by clinic staff before they
                become confirmed visits.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

type MetricPillProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

const MetricPill = ({ icon, label, value }: MetricPillProps) => (
  <div className="rounded-full bg-brand-paper-soft px-4 py-3">
    <div className="flex items-center gap-2 text-brand-muted">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="mt-1 text-xl font-semibold text-brand-ink">{value}</p>
  </div>
);

type StatusBarProps = {
  label: string;
  value: number;
  height: number;
};

const StatusBar = ({ label, value, height }: StatusBarProps) => (
  <div className="flex flex-1 flex-col items-center justify-end gap-2">
    <span className="text-xs font-medium text-brand">{value}</span>
    <div className="flex h-32 w-full items-end justify-center">
      <div
        className="w-full max-w-12 rounded-t-full bg-brand shadow-brand-soft"
        style={{ height: `${height}%` }}
      />
    </div>
    <span className="text-xs uppercase text-brand-muted">{label}</span>
  </div>
);

type ProfileLineProps = {
  label: string;
  value?: string | null;
};

const ProfileLine = ({ label, value }: ProfileLineProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-brand-muted">{label}</span>
    <span className="truncate font-medium text-brand-ink">
      {value || "Not set"}
    </span>
  </div>
);
