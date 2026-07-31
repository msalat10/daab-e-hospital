import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Appointment,
  Clinic,
  Service,
} from "@/features/shared/types/hospital";
import {
  CareTasksSection,
  MedicalHistorySection,
  PatientContextPanel,
  PatientSummaryCards,
  UpcomingAppointmentSection,
} from "../components/dashboard/PatientDashboardCards";
import { useCurrentPatient } from "../hooks/useCurrentPatient";

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
  const activeAppointments = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  );
  const nextAppointment = activeAppointments[0];

  const clinicsById = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.id, clinic])),
    [clinicsList.result.data]
  );
  const servicesById = useMemo(
    () =>
      new Map(servicesList.result.data.map((service) => [service.id, service])),
    [servicesList.result.data]
  );

  return (
    <div className="min-h-full rounded-[12px] border border-brand-border bg-brand-paper p-3 shadow-brand-card md:p-4">
      {!patientLoading && !patient && (
        <Card className="mb-4 rounded-[8px] border-brand-border bg-brand-surface shadow-none">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-ink">
                Complete your patient profile
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create a profile first so your bookings and appointment history
                can be linked to one patient record.
              </p>
            </div>
            <Button asChild className="w-fit rounded-[6px] bg-brand hover:bg-brand-dark">
              <Link to="/patient/profile">Create profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-3">
          <section className="rounded-[8px] bg-transparent">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">
                  Patient portal
                </p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight text-brand-ink">
                  My care workspace
                </h1>
                <p className="mt-1 text-sm text-brand-muted">
                  Manage appointments, records, messages, and clinic follow-up
                  from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-9 rounded-[6px]">
                  <Link to="/patient/appointments">View medical records</Link>
                </Button>
                <Button
                  asChild
                  className="h-9 rounded-[6px] bg-brand hover:bg-brand-dark"
                >
                  <Link to="/patient/book">Book appointment</Link>
                </Button>
              </div>
            </div>
          </section>

          <PatientSummaryCards appointments={appointments} />

          <UpcomingAppointmentSection
            appointment={nextAppointment}
            clinicsById={clinicsById}
            servicesById={servicesById}
          />
          <MedicalHistorySection
            appointments={appointments}
            clinicsById={clinicsById}
            servicesById={servicesById}
          />
          <CareTasksSection />
        </main>

        <div className="min-w-0 overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card">
          <PatientContextPanel patient={patient} appointments={appointments} />
        </div>
      </div>
    </div>
  );
};
