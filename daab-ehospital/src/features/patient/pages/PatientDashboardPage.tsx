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
  MedicalHistorySection,
  PatientContextPanel,
  PatientSummaryCards,
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
    <div className="min-h-full">
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
          <PatientSummaryCards appointments={appointments} />

          <MedicalHistorySection
            appointments={appointments}
            clinicsById={clinicsById}
            servicesById={servicesById}
          />
        </main>

        <div className="min-w-0 overflow-hidden rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card">
          <PatientContextPanel patient={patient} appointments={appointments} />
        </div>
      </div>
    </div>
  );
};
