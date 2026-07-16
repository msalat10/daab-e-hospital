import { useMemo, useState, type FormEvent } from "react";
import { useList } from "@refinedev/core";
import { Search } from "lucide-react";
import { Link } from "react-router";

import { AppointmentStatusBadge } from "../components/AppointmentStatusBadge";
import { useCurrentPatient } from "../hooks/useCurrentPatient";
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
  Clinic,
  Doctor,
  Service,
} from "@/features/shared/types/hospital";
import {
  formatDateTime,
  getAppointmentStatusMessage,
} from "@/features/shared/utils/appointments";

export const PatientReferenceLookupPage = () => {
  const { patient, isLoading: patientLoading } = useCurrentPatient();
  const [referenceInput, setReferenceInput] = useState("");
  const [submittedReference, setSubmittedReference] = useState("");

  const appointmentList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: [
      { field: "reference_code", operator: "eq", value: submittedReference },
      ...(patient?.id
        ? [{ field: "patient_id", operator: "eq" as const, value: patient.id }]
        : []),
    ],
    queryOptions: {
      enabled: Boolean(submittedReference) && Boolean(patient?.id),
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
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
  });

  const clinicsById = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.id, clinic])),
    [clinicsList.result.data]
  );
  const servicesById = useMemo(
    () =>
      new Map(servicesList.result.data.map((service) => [service.id, service])),
    [servicesList.result.data]
  );
  const doctorsById = useMemo(
    () => new Map(doctorsList.result.data.map((doctor) => [doctor.id, doctor])),
    [doctorsList.result.data]
  );

  const appointment = appointmentList.result.data[0];
  const clinic = appointment ? clinicsById.get(appointment.clinic_id) : null;
  const service =
    appointment && appointment.service_id
      ? servicesById.get(appointment.service_id)
      : null;
  const doctor =
    appointment && appointment.doctor_id
      ? doctorsById.get(appointment.doctor_id)
      : null;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedReference(referenceInput.trim().toUpperCase());
  };

  if (!patientLoading && !patient) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Complete your profile first
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Reference lookup is linked to your patient profile so only your own
            appointments are shown.
          </p>
          <Button asChild className="mt-5 rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/patient/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Patient portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
          Check appointment reference
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Enter the reference code you received after booking to see the latest
          status.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader>
            <CardTitle className="text-xl text-brand-ink">
              Reference lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSearch}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <Input
                  className="h-12 rounded-full border-brand-border pl-10 uppercase"
                  placeholder="DAD-260716-ABCD"
                  value={referenceInput}
                  onChange={(event) => setReferenceInput(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-brand hover:bg-brand-dark"
                disabled={!referenceInput.trim()}
              >
                Check status
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader className="border-b border-brand-border/70">
            <CardTitle className="text-xl text-brand-ink">Result</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!submittedReference ? (
              <EmptyResult message="Search with a reference code to see appointment details." />
            ) : appointmentList.query.isLoading ? (
              <EmptyResult message="Checking appointment status..." />
            ) : appointment ? (
              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-muted">
                      {appointment.reference_code}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-brand-ink">
                      {formatDateTime(
                        appointment.requested_date,
                        appointment.requested_time
                      )}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-brand-muted">
                      {getAppointmentStatusMessage(appointment.status)}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <LookupDetail
                    label="Clinic"
                    value={clinic ? `${clinic.name}, ${clinic.camp}` : "Clinic"}
                  />
                  <LookupDetail
                    label="Service"
                    value={service?.name || "General visit"}
                  />
                  <LookupDetail
                    label="Doctor"
                    value={doctor?.full_name || "Not assigned yet"}
                  />
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-full border-brand-border"
                >
                  <Link to={`/patient/appointments/${appointment.id}`}>
                    Open appointment
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyResult message="No appointment matched that reference for your profile." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LookupDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[14px] bg-brand-paper-soft p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
      {label}
    </p>
    <p className="mt-2 text-sm font-semibold text-brand-ink">{value}</p>
  </div>
);

const EmptyResult = ({ message }: { message: string }) => (
  <div className="flex min-h-[260px] items-center justify-center rounded-[18px] bg-brand-paper-soft p-8 text-center text-sm leading-6 text-brand-muted">
    {message}
  </div>
);
