import { useMemo, type ReactNode } from "react";
import { useList } from "@refinedev/core";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";

import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import {
  isAppointmentInDoctorScope,
  isTodayAppointment,
} from "../utils/doctorAppointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Appointment,
  Clinic,
  Patient,
  Service,
} from "@/features/shared/types/hospital";
import { AppointmentStatusBadge } from "@/features/shared/components/AppointmentStatusBadge";
import { formatDateTime } from "@/features/shared/utils/appointments";

export const DoctorDashboardPage = () => {
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();

  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    sorters: [{ field: "requested_date", order: "asc" }],
  });
  const patientsList = useList<Patient>({
    resource: "patients",
    pagination: { mode: "off" },
  });
  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });
  const servicesList = useList<Service>({
    resource: "services",
    pagination: { mode: "off" },
  });

  const appointments = useMemo(
    () =>
      appointmentsList.result.data.filter((appointment) =>
        isAppointmentInDoctorScope(appointment, doctor)
      ),
    [appointmentsList.result.data, doctor]
  );

  const patientsById = useMemo(
    () =>
      new Map(patientsList.result.data.map((patient) => [patient.id, patient])),
    [patientsList.result.data]
  );
  const clinicsById = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.id, clinic])),
    [clinicsList.result.data]
  );
  const servicesById = useMemo(
    () =>
      new Map(servicesList.result.data.map((service) => [service.id, service])),
    [servicesList.result.data]
  );

  const todaysAppointments = appointments.filter(isTodayAppointment);
  const pendingRequests = appointments.filter(
    (appointment) => appointment.status === "pending"
  );
  const confirmedVisits = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  );
  const completedVisits = appointments.filter(
    (appointment) => appointment.status === "completed"
  );
  const nextVisits = appointments
    .filter((appointment) =>
      ["pending", "confirmed"].includes(appointment.status)
    )
    .slice(0, 5);

  const doctorClinic = doctor?.clinic_id
    ? clinicsById.get(doctor.clinic_id)
    : undefined;

  if (!doctorLoading && !doctor) {
    return <DoctorProfileRequired />;
  }

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Doctor portal</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-brand-ink">
              Welcome{doctor?.full_name ? `, Dr. ${doctor.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              Review pending clinic requests, confirmed visits, and today’s
              consultation workload.
            </p>
          </div>
          <Button asChild className="w-fit rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/doctor/appointments">Open queue</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-4">
        <MetricCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Pending"
          value={pendingRequests.length}
        />
        <MetricCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Today"
          value={todaysAppointments.length}
        />
        <MetricCard
          icon={<Stethoscope className="h-5 w-5" />}
          label="Confirmed"
          value={confirmedVisits.length}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={completedVisits.length}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-brand-border/70">
            <div>
              <CardTitle className="text-xl text-brand-ink">
                Active queue
              </CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                Pending clinic requests and visits assigned to you.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/doctor/appointments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {appointmentsList.query.isLoading || doctorLoading ? (
              <div className="p-6 text-sm text-brand-muted">Loading queue...</div>
            ) : nextVisits.length ? (
              <div className="divide-y divide-brand-border/70">
                {nextVisits.map((appointment) => {
                  const patient = patientsById.get(appointment.patient_id);
                  const service = appointment.service_id
                    ? servicesById.get(appointment.service_id)
                    : undefined;

                  return (
                    <Link
                      key={appointment.id}
                      to={`/doctor/appointments/${appointment.id}`}
                      className="grid gap-3 px-5 py-4 transition hover:bg-brand-paper-soft md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <p className="font-medium text-brand-ink">
                          {patient?.full_name || "Patient"}
                        </p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {patient?.refugee_id || appointment.reference_code}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-brand-ink">
                          {service?.name || "General visit"}
                        </p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {formatDateTime(
                            appointment.requested_date,
                            appointment.requested_time
                          )}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-sm text-brand-muted">
                No active appointments in your queue.
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardContent className="p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
                <UserRound className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-brand-ink">
                {doctor?.full_name || "Doctor"}
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                {doctor?.specialty || doctor?.title || "Clinical staff"}
              </p>
              <div className="mt-5 rounded-[14px] bg-brand-paper-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Clinic
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">
                  {doctorClinic
                    ? `${doctorClinic.name}, ${doctorClinic.camp}`
                    : "Not assigned"}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-5 w-full rounded-full border-brand-border"
              >
                <Link to="/doctor/profile">Profile settings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-brand-ink text-white shadow-brand-card">
            <CardContent className="p-5">
              <ClipboardList className="h-7 w-7 text-brand-mint" />
              <h2 className="mt-4 text-lg font-semibold">Consultation flow</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Confirm pending visits, open the consultation, add notes, then
                mark the visit completed.
              </p>
              <Button
                asChild
                className="mt-5 rounded-full bg-white text-brand-ink hover:bg-brand-paper"
              >
                <Link to="/doctor/appointments">
                  Start review <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

const DoctorProfileRequired = () => (
  <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
    <CardContent className="p-6">
      <h1 className="text-2xl font-semibold text-brand-ink">
        Choose your doctor profile
      </h1>
      <p className="mt-2 text-sm leading-6 text-brand-muted">
        Auth is disabled while we build, so select a doctor profile before
        opening the queue.
      </p>
      <Button asChild className="mt-5 rounded-full bg-brand hover:bg-brand-dark">
        <Link to="/doctor/profile">Choose doctor</Link>
      </Button>
    </CardContent>
  </Card>
);

const MetricCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) => (
  <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
    <CardContent className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-sm text-brand-muted">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-brand-ink">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mint text-brand">
        {icon}
      </div>
    </CardContent>
  </Card>
);
