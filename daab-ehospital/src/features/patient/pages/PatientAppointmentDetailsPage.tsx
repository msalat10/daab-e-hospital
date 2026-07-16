import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { type HttpError, useList, useUpdate } from "@refinedev/core";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { Link, useParams } from "react-router";

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
import { Label } from "@/components/ui/label";
import type {
  Appointment,
  Clinic,
  Doctor,
  Service,
} from "@/features/shared/types/hospital";
import {
  canPatientCancel,
  canPatientReschedule,
  formatDateTime,
  getAppointmentStatusMessage,
} from "@/features/shared/utils/appointments";

export const PatientAppointmentDetailsPage = () => {
  const { id } = useParams();
  const { patient, isLoading: patientLoading } = useCurrentPatient();
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");

  const appointmentList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: [
      { field: "id", operator: "eq", value: id ?? "" },
      ...(patient?.id
        ? [{ field: "patient_id", operator: "eq" as const, value: patient.id }]
        : []),
    ],
    queryOptions: {
      enabled: Boolean(id) && Boolean(patient?.id),
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

  const updateAppointment = useUpdate<
    Appointment,
    HttpError,
    Partial<Appointment>
  >();

  const appointment = appointmentList.result.data[0];
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

  const clinic = appointment ? clinicsById.get(appointment.clinic_id) : null;
  const service =
    appointment && appointment.service_id
      ? servicesById.get(appointment.service_id)
      : null;
  const doctor =
    appointment && appointment.doctor_id
      ? doctorsById.get(appointment.doctor_id)
      : null;

  const handleReschedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!appointment || !requestedDate) {
      return;
    }

    await updateAppointment.mutateAsync({
      resource: "appointments",
      id: appointment.id,
      values: {
        requested_date: requestedDate,
        requested_time: requestedTime || null,
        status: appointment.status === "confirmed" ? "pending" : appointment.status,
      },
      successNotification: {
        type: "success",
        message: "Reschedule request saved",
        description:
          appointment.status === "confirmed"
            ? "The clinic will review the new visit time."
            : "Your appointment request was updated.",
      },
    });

    await appointmentList.query.refetch();
    setRequestedDate("");
    setRequestedTime("");
  };

  const handleCancel = async () => {
    if (!appointment) {
      return;
    }

    await updateAppointment.mutateAsync({
      resource: "appointments",
      id: appointment.id,
      values: { status: "cancelled" },
      successNotification: {
        type: "success",
        message: "Appointment cancelled",
        description: "The appointment is no longer active.",
      },
    });

    await appointmentList.query.refetch();
  };

  if (!patientLoading && !patient) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Complete your profile first
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Appointment details are shown after your patient profile is
            connected.
          </p>
          <Button asChild className="mt-5 rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/patient/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (appointmentList.query.isLoading || patientLoading) {
    return (
      <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-5">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardContent className="p-6 text-sm text-brand-muted">
            Loading appointment details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-5">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-brand-ink">
              Appointment not found
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              This appointment could not be found for your patient profile.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link to="/patient/appointments">Back to appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <Button
          asChild
          variant="ghost"
          className="-ml-3 mb-4 rounded-full text-brand-muted hover:text-brand-ink"
        >
          <Link to="/patient/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-muted">
              Reference {appointment.reference_code}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
              Appointment details
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              {getAppointmentStatusMessage(appointment.status)}
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader className="border-b border-brand-border/70">
            <CardTitle className="text-xl text-brand-ink">
              Visit information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <DetailItem
              icon={<CalendarClock className="h-4 w-4" />}
              label="Requested visit"
              value={formatDateTime(
                appointment.requested_date,
                appointment.requested_time
              )}
            />
            <DetailItem
              icon={<MapPin className="h-4 w-4" />}
              label="Clinic"
              value={clinic ? `${clinic.name}, ${clinic.camp}` : "Clinic"}
            />
            <DetailItem
              icon={<ClipboardList className="h-4 w-4" />}
              label="Service"
              value={service?.name || "General visit"}
            />
            <DetailItem
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={doctor?.full_name || "Not assigned yet"}
            />
            <div className="rounded-[14px] bg-brand-paper-soft p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Reason for visit
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-ink">
                {appointment.reason || "No reason was provided."}
              </p>
            </div>
            <div className="rounded-[14px] bg-brand-paper-soft p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Clinic notes
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-ink">
                {appointment.doctor_notes ||
                  "No clinic notes have been added yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-lg text-brand-ink">
                Reschedule request
              </CardTitle>
              <p className="text-sm leading-6 text-brand-muted">
                Choose a new preferred visit time. Confirmed visits return to
                pending so the clinic can review the change.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleReschedule}>
                <div className="space-y-2">
                  <Label htmlFor="requested_date">New date</Label>
                  <Input
                    id="requested_date"
                    type="date"
                    value={requestedDate}
                    disabled={!canPatientReschedule(appointment.status)}
                    onChange={(event) => setRequestedDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requested_time">New time</Label>
                  <Input
                    id="requested_time"
                    type="time"
                    value={requestedTime}
                    disabled={!canPatientReschedule(appointment.status)}
                    onChange={(event) => setRequestedTime(event.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-brand hover:bg-brand-dark"
                  disabled={
                    !canPatientReschedule(appointment.status) ||
                    !requestedDate ||
                    updateAppointment.mutation.isPending
                  }
                >
                  Save new time
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-brand-ink">
                Need to cancel?
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Cancel only if you cannot attend, so the clinic can give the
                slot to another patient.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={
                  !canPatientCancel(appointment.status) ||
                  updateAppointment.mutation.isPending
                }
                onClick={handleCancel}
              >
                Cancel appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-[14px] bg-brand-paper-soft p-4">
    <div className="flex items-center gap-2 text-brand">
      {icon}
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">
        {label}
      </p>
    </div>
    <p className="mt-3 text-sm font-semibold text-brand-ink">{value}</p>
  </div>
);
