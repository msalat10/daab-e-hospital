import { useMemo, useState, type ReactNode } from "react";
import { useList } from "@refinedev/core";
import { Link } from "react-router";

import { AppointmentStatusBadge } from "@/features/shared/components/AppointmentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import {
  isAppointmentInDoctorScope,
  isTodayAppointment,
} from "../utils/doctorAppointments";

export const DoctorDashboardPage = () => {
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();
  const [patientSearch, setPatientSearch] = useState("");

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

  const appointments = useMemo(
    () =>
      appointmentsList.result.data.filter((appointment) =>
        isAppointmentInDoctorScope(appointment, doctor)
      ),
    [appointmentsList.result.data, doctor]
  );

  const todaysAppointments = appointments.filter(isTodayAppointment);
  const currentQueue = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  );
  const scopedPatients = useMemo(() => {
    const seen = new Set<string>();

    return appointments
      .map((appointment) => patientsById.get(appointment.patient_id))
      .filter((patient): patient is Patient => {
        if (!patient || seen.has(patient.id)) {
          return false;
        }

        seen.add(patient.id);
        return true;
      });
  }, [appointments, patientsById]);
  const patientSearchResults = useMemo(() => {
    const normalized = patientSearch.trim().toLowerCase();

    if (!normalized) {
      return scopedPatients.slice(0, 4);
    }

    return scopedPatients
      .filter((patient) =>
        [patient.full_name, patient.refugee_id, patient.phone, patient.camp]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 6);
  }, [patientSearch, scopedPatients]);
  const upcomingConsultations = appointments
    .filter((appointment) => appointment.status === "confirmed")
    .slice(0, 5);
  const recentRecords = [...appointments]
    .filter((appointment) => appointment.status === "completed")
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 4);
  const selectedAppointment =
    todaysAppointments[0] ?? currentQueue[0] ?? appointments[0];
  const selectedPatient = selectedAppointment
    ? patientsById.get(selectedAppointment.patient_id)
    : undefined;
  const selectedClinic = selectedAppointment
    ? clinicsById.get(selectedAppointment.clinic_id)
    : undefined;
  const selectedService = selectedAppointment?.service_id
    ? servicesById.get(selectedAppointment.service_id)
    : undefined;
  const doctorClinic = doctor?.clinic_id
    ? clinicsById.get(doctor.clinic_id)
    : undefined;
  const isLoading =
    appointmentsList.query.isLoading ||
    patientsList.query.isLoading ||
    doctorLoading;

  if (!doctorLoading && !doctor) {
    return <DoctorProfileRequired />;
  }

  return (
    <div className="min-h-full rounded-[12px] border border-brand-border bg-brand-paper p-3 shadow-brand-card md:p-4">
      <section className="mb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">
              Doctor workspace
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-brand-ink">
              Today's clinical work
            </h1>
            <p className="mt-1 text-sm text-brand-muted">
              {doctorClinic
                ? `${doctorClinic.name}, ${doctorClinic.camp}`
                : "Review appointment requests, patient records, and follow-up work."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-9 rounded-[6px]">
              <Link to="/doctor/appointments">View full queue</Link>
            </Button>
            <Button asChild className="h-9 rounded-[6px] bg-brand hover:bg-brand-dark">
              <Link to="/doctor/appointments">Open next patient</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-3">
          <section className="grid overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card md:grid-cols-4">
            <WorkloadStat label="Today" value={todaysAppointments.length} />
            <WorkloadStat
              label="Waiting"
              value={
                currentQueue.filter((item) => item.status === "pending").length
              }
            />
            <WorkloadStat
              label="Confirmed"
              value={
                currentQueue.filter((item) => item.status === "confirmed")
                  .length
              }
            />
            <WorkloadStat label="Recent records" value={recentRecords.length} />
          </section>

          <section className="rounded-[8px] border border-brand-border bg-brand-surface p-4 shadow-brand-card">
            <SectionHeader
              title="Patient search"
              description="Search patients already linked to your clinic queue."
            />
            <Input
              value={patientSearch}
              onChange={(event) => setPatientSearch(event.target.value)}
              placeholder="Search by patient name, refugee ID, phone, or camp"
              className="mt-4 h-9 rounded-[6px] border-brand-border bg-brand-surface"
            />
            <div className="mt-3 divide-y divide-brand-divider overflow-hidden rounded-[6px] border border-brand-border">
              {patientSearchResults.length ? (
                patientSearchResults.map((patient) => {
                  const latestAppointment = appointments.find(
                    (appointment) => appointment.patient_id === patient.id
                  );

                  return (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-brand-ink">
                          {patient.full_name}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {patient.refugee_id || "No refugee ID"} ·{" "}
                          {patient.camp || "Camp not recorded"}
                        </p>
                      </div>
                      {latestAppointment ? (
                        <Button
                          asChild
                          variant="outline"
                          className="h-8 rounded-[6px]"
                        >
                          <Link
                            to={`/doctor/appointments/${latestAppointment.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-sm text-brand-muted">
                  No patients match that search.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[8px] border border-brand-border bg-brand-surface p-4 shadow-brand-card">
            <SectionHeader
              title="Current patient queue"
              description="Pending requests and confirmed consultations in clinical order."
              action={
                <Button asChild variant="outline" className="h-8 rounded-[6px]">
                  <Link to="/doctor/appointments">Manage queue</Link>
                </Button>
              }
            />
            <div className="mt-4 overflow-hidden rounded-[6px] border border-brand-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-brand-paper-soft hover:bg-brand-paper-soft">
                    <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
                      Patient
                    </TableHead>
                    <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
                      Visit
                    </TableHead>
                    <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
                      Time
                    </TableHead>
                    <TableHead className="h-9 px-3 text-xs font-semibold text-brand-muted">
                      Status
                    </TableHead>
                    <TableHead className="h-9 px-3 text-right text-xs font-semibold text-brand-muted">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <QueueSkeleton />
                  ) : currentQueue.length ? (
                    currentQueue.slice(0, 8).map((appointment) => {
                      const patient = patientsById.get(appointment.patient_id);
                      const service = appointment.service_id
                        ? servicesById.get(appointment.service_id)
                        : undefined;
                      const clinic = clinicsById.get(appointment.clinic_id);

                      return (
                        <TableRow
                          key={appointment.id}
                          className="border-brand-border/70 hover:bg-brand-light"
                        >
                          <TableCell className="px-3 py-3">
                            <p className="text-sm font-medium text-brand-ink">
                              {patient?.full_name || "Patient record"}
                            </p>
                            <p className="text-xs text-brand-muted">
                              {patient?.refugee_id ||
                                appointment.reference_code}
                            </p>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-sm text-brand-ink">
                            <p>{service?.name || "General visit"}</p>
                            <p className="text-xs text-brand-muted">
                              {clinic
                                ? `${clinic.name}, ${clinic.camp}`
                                : "Clinic"}
                            </p>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-sm text-brand-muted">
                            {formatDateTime(
                              appointment.requested_date,
                              appointment.requested_time
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <AppointmentStatusBadge
                              status={appointment.status}
                            />
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right">
                            <Button
                              asChild
                              variant="outline"
                              className="h-8 rounded-[6px]"
                            >
                              <Link
                                to={`/doctor/appointments/${appointment.id}`}
                              >
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
                        No active patients in the queue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="grid overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card lg:grid-cols-2">
            <WorkPanel title="Upcoming consultations">
              <div className="divide-y divide-brand-border/70">
                {upcomingConsultations.length ? (
                  upcomingConsultations.map((appointment) => (
                    <AppointmentLine
                      key={appointment.id}
                      appointment={appointment}
                      patient={patientsById.get(appointment.patient_id)}
                      service={
                        appointment.service_id
                          ? servicesById.get(appointment.service_id)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <EmptyState text="No confirmed consultations are waiting." />
                )}
              </div>
            </WorkPanel>
            <WorkPanel title="Recent patient records">
              <div className="divide-y divide-brand-border/70">
                {recentRecords.length ? (
                  recentRecords.map((appointment) => (
                    <AppointmentLine
                      key={appointment.id}
                      appointment={appointment}
                      patient={patientsById.get(appointment.patient_id)}
                      service={
                        appointment.service_id
                          ? servicesById.get(appointment.service_id)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <EmptyState text="Completed visits will appear here." />
                )}
              </div>
            </WorkPanel>
          </section>

          <section className="grid overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card lg:grid-cols-3">
            <WorkPanel title="Pending lab results">
              <EmptyState text="Lab result integration is not connected yet." />
            </WorkPanel>
            <WorkPanel title="Prescription requests">
              <EmptyState text="Prescription requests will appear after the medication workflow is added." />
            </WorkPanel>
            <WorkPanel title="Notifications">
              <EmptyState text="No clinical notifications at this time." />
            </WorkPanel>
          </section>
        </main>

        <aside className="min-w-0 overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card">
          <section className="border-b border-brand-divider bg-brand-surface p-4">
            <SectionHeader
              title="Patient context"
              description="Selected from the active queue."
            />
            {selectedPatient && selectedAppointment ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-brand-ink">
                    {selectedPatient.full_name}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {selectedPatient.refugee_id || "No refugee ID"} ·{" "}
                    {selectedPatient.gender || "Gender not set"}
                  </p>
                </div>
                <PatientFacts
                  rows={[
                    ["Camp", selectedPatient.camp || "Not recorded"],
                    ["Clinic", selectedClinic?.name || "Not assigned"],
                    ["Visit", selectedService?.name || "General visit"],
                    [
                      "Scheduled",
                      formatDateTime(
                        selectedAppointment.requested_date,
                        selectedAppointment.requested_time
                      ),
                    ],
                  ]}
                />
                <Button asChild className="h-9 w-full rounded-[6px] bg-brand hover:bg-brand-dark">
                  <Link to={`/doctor/appointments/${selectedAppointment.id}`}>
                    Open consultation
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyState text="Select a patient from the queue to view clinical context." />
            )}
          </section>

          <ContextBlock title="Vitals">
            <EmptyState text="Vitals capture is not connected yet." compact />
          </ContextBlock>
          <ContextBlock title="Allergies">
            <EmptyState text="No allergy records available." compact />
          </ContextBlock>
          <ContextBlock title="Current medications">
            <EmptyState text="Medication records will appear after prescriptions are implemented." compact />
          </ContextBlock>
          <ContextBlock title="Visit timeline">
            <div className="space-y-3">
              {appointments
                .filter(
                  (appointment) =>
                    selectedPatient &&
                    appointment.patient_id === selectedPatient.id
                )
                .slice(0, 4)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border-l-2 border-brand-border pl-3"
                  >
                    <p className="text-sm font-medium text-brand-ink">
                      {formatDateTime(
                        appointment.requested_date,
                        appointment.requested_time
                      )}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {appointment.reference_code}
                    </p>
                  </div>
                ))}
            </div>
          </ContextBlock>
        </aside>
      </div>
    </div>
  );
};

const DoctorProfileRequired = () => (
  <Card className="mx-auto max-w-3xl rounded-[8px] border-brand-border bg-brand-surface shadow-none">
    <CardContent className="p-6">
      <h1 className="text-xl font-semibold text-brand-ink">
        Choose your doctor profile
      </h1>
      <p className="mt-2 text-sm leading-6 text-brand-muted">
        Select a doctor profile before opening the clinical workspace.
      </p>
      <Button asChild className="mt-5 rounded-[6px] bg-brand hover:bg-brand-dark">
        <Link to="/doctor/profile">Choose doctor</Link>
      </Button>
    </CardContent>
  </Card>
);

const SectionHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-semibold text-brand-ink">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-brand-muted">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);

const WorkloadStat = ({ label, value }: { label: string; value: number }) => (
  <div className="border-b border-r border-brand-divider px-4 py-3 md:border-b-0">
    <p className="text-xs font-medium uppercase tracking-[0.06em] text-brand-muted">
      {label}
    </p>
    <p className="mt-1 text-xl font-semibold text-brand-ink">{value}</p>
  </div>
);

const WorkPanel = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="min-h-[180px] border-r border-brand-divider p-4">
    <h2 className="text-base font-semibold text-brand-ink">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

const AppointmentLine = ({
  appointment,
  patient,
  service,
}: {
  appointment: Appointment;
  patient?: Patient;
  service?: Service;
}) => (
  <Link
    to={`/doctor/appointments/${appointment.id}`}
    className="block py-3 transition hover:bg-brand-light"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-brand-ink">
          {patient?.full_name || "Patient record"}
        </p>
        <p className="mt-1 text-xs text-brand-muted">
          {service?.name || "General visit"}
        </p>
      </div>
      <p className="whitespace-nowrap text-xs text-brand-muted">
        {formatDateTime(appointment.requested_date, appointment.requested_time)}
      </p>
    </div>
  </Link>
);

const PatientFacts = ({ rows }: { rows: Array<[string, string]> }) => (
  <dl className="divide-y divide-brand-divider border-y border-brand-divider">
    {rows.map(([label, value]) => (
      <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-2">
        <dt className="text-xs font-medium uppercase tracking-[0.06em] text-brand-muted">
          {label}
        </dt>
        <dd className="text-sm text-brand-ink">{value}</dd>
      </div>
    ))}
  </dl>
);

const ContextBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="border-b border-brand-divider p-4">
    <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
    <div className="mt-3">{children}</div>
  </section>
);

const EmptyState = ({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) => (
  <div
    className={
      compact
        ? "text-sm leading-6 text-brand-muted"
        : "rounded-[6px] border border-dashed border-brand-border bg-brand-paper-soft px-3 py-4 text-sm leading-6 text-brand-muted"
    }
  >
    {text}
  </div>
);

const QueueSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <TableRow key={index} className="border-brand-border/70">
        {Array.from({ length: 5 }).map((__, cellIndex) => (
          <TableCell key={cellIndex} className="px-3 py-3">
            <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-brand-neutral-soft" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
