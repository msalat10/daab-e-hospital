import { useEffect, useMemo, useState, type ReactNode } from "react";
import { type HttpError, useList, useUpdate } from "@refinedev/core";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router";

import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import { isAppointmentInDoctorScope } from "../utils/doctorAppointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  Appointment,
  Clinic,
  Doctor,
  Patient,
  Service,
} from "@/features/shared/types/hospital";
import { AppointmentStatusBadge } from "@/features/shared/components/AppointmentStatusBadge";
import {
  formatDateTime,
  getAppointmentStatusMessage,
} from "@/features/shared/utils/appointments";

export const DoctorAppointmentDetailsPage = () => {
  const { id } = useParams();
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();
  const [doctorNotes, setDoctorNotes] = useState("");
  const [assignedDoctorId, setAssignedDoctorId] = useState("");

  const appointmentList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: [{ field: "id", operator: "eq", value: id ?? "" }],
    queryOptions: { enabled: Boolean(id) },
  });
  const allAppointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    sorters: [{ field: "requested_date", order: "desc" }],
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
  const doctorsById = useMemo(
    () => new Map(doctorsList.result.data.map((item) => [item.id, item])),
    [doctorsList.result.data]
  );

  const patient = appointment ? patientsById.get(appointment.patient_id) : null;
  const clinic = appointment ? clinicsById.get(appointment.clinic_id) : null;
  const service =
    appointment && appointment.service_id
      ? servicesById.get(appointment.service_id)
      : null;
  const assignedDoctor =
    appointment && appointment.doctor_id
      ? doctorsById.get(appointment.doctor_id)
      : null;
  const patientHistory = appointment
    ? allAppointmentsList.result.data
        .filter((item) => item.patient_id === appointment.patient_id)
        .slice(0, 5)
    : [];

  const scoped = appointment
    ? isAppointmentInDoctorScope(appointment, doctor)
    : false;

  useEffect(() => {
    if (!appointment) {
      return;
    }

    setDoctorNotes(appointment.doctor_notes || "");
    setAssignedDoctorId(appointment.doctor_id || doctor?.id || "");
  }, [appointment, doctor?.id]);

  const saveAppointment = async (
    values: Partial<Appointment>,
    message: string,
    description: string
  ) => {
    if (!appointment) {
      return;
    }

    await updateAppointment.mutateAsync({
      resource: "appointments",
      id: appointment.id,
      values,
      successNotification: {
        type: "success",
        message,
        description,
      },
    });

    await appointmentList.query.refetch();
    await allAppointmentsList.query.refetch();
  };

  if (!doctorLoading && !doctor) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Choose your doctor profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Select a doctor profile before opening a consultation.
          </p>
          <Button asChild className="mt-5 rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/doctor/profile">Choose doctor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (appointmentList.query.isLoading || doctorLoading) {
    return (
      <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-5">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardContent className="p-6 text-sm text-brand-muted">
            Loading consultation...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment || !scoped) {
    return (
      <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-5">
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-brand-ink">
              Appointment not available
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              This appointment is not in your assigned doctor queue.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link to="/doctor/appointments">Back to queue</Link>
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
          <Link to="/doctor/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to queue
          </Link>
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-muted">
              Reference {appointment.reference_code}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
              Consultation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              {getAppointmentStatusMessage(appointment.status)}
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader className="border-b border-brand-border/70">
              <CardTitle className="text-xl text-brand-ink">
                Patient and visit details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <DetailItem
                icon={<UserRound className="h-4 w-4" />}
                label="Patient"
                value={patient?.full_name || "Patient"}
                subvalue={patient?.refugee_id || "No refugee ID"}
              />
              <DetailItem
                icon={<Phone className="h-4 w-4" />}
                label="Contact"
                value={patient?.phone || "No phone"}
                subvalue={patient?.camp || "Camp not set"}
              />
              <DetailItem
                icon={<CalendarClock className="h-4 w-4" />}
                label="Visit time"
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
                label="Assigned doctor"
                value={assignedDoctor?.full_name || "Not assigned"}
              />
              <div className="rounded-[14px] bg-brand-paper-soft p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Patient reason
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-ink">
                  {appointment.reason || "No reason was provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-xl text-brand-ink">
                Consultation notes
              </CardTitle>
              <p className="text-sm leading-6 text-brand-muted">
                Notes are saved to the appointment record and visible in the
                patient history.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                className="min-h-40 rounded-[14px] border-brand-border"
                placeholder="Write clinical notes, observations, or follow-up advice..."
                value={doctorNotes}
                onChange={(event) => setDoctorNotes(event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-brand-border"
                  onClick={() =>
                    saveAppointment(
                      { doctor_notes: doctorNotes },
                      "Notes saved",
                      "Consultation notes were updated."
                    )
                  }
                  disabled={updateAppointment.mutation.isPending}
                >
                  Save notes
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-brand hover:bg-brand-dark"
                  onClick={() =>
                    saveAppointment(
                      {
                        status: "completed",
                        doctor_notes: doctorNotes,
                        doctor_id: assignedDoctorId || doctor?.id || null,
                      },
                      "Visit completed",
                      "The appointment was marked as completed."
                    )
                  }
                  disabled={updateAppointment.mutation.isPending}
                >
                  Complete visit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-lg text-brand-ink">
                Appointment actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_doctor">Assigned doctor</Label>
                <Select
                  value={assignedDoctorId || "none"}
                  onValueChange={(value) =>
                    setAssignedDoctorId(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger
                    id="assigned_doctor"
                    className="h-11 rounded-full border-brand-border"
                  >
                    <SelectValue placeholder="Choose doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not assigned</SelectItem>
                    {doctorsList.result.data.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                className="w-full rounded-full bg-brand hover:bg-brand-dark"
                onClick={() =>
                  saveAppointment(
                    {
                      status: "confirmed",
                      doctor_id: assignedDoctorId || doctor?.id || null,
                    },
                    "Appointment confirmed",
                    "The appointment is now confirmed."
                  )
                }
                disabled={
                  appointment.status === "completed" ||
                  updateAppointment.mutation.isPending
                }
              >
                Confirm appointment
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-brand-border"
                onClick={() =>
                  saveAppointment(
                    {
                      status: "missed",
                      doctor_notes: doctorNotes,
                      doctor_id: assignedDoctorId || doctor?.id || null,
                    },
                    "Marked missed",
                    "The appointment was marked as missed."
                  )
                }
                disabled={updateAppointment.mutation.isPending}
              >
                Mark missed
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() =>
                  saveAppointment(
                    {
                      status: "cancelled",
                      doctor_notes: doctorNotes,
                      doctor_id: assignedDoctorId || doctor?.id || null,
                    },
                    "Appointment cancelled",
                    "The appointment was cancelled."
                  )
                }
                disabled={updateAppointment.mutation.isPending}
              >
                Cancel appointment
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-lg text-brand-ink">
                Patient history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patientHistory.length ? (
                patientHistory.map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="rounded-[14px] bg-brand-paper-soft p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-brand-ink">
                        {historyItem.reference_code}
                      </p>
                      <AppointmentStatusBadge status={historyItem.status} />
                    </div>
                    <p className="mt-2 text-xs text-brand-muted">
                      {formatDateTime(
                        historyItem.requested_date,
                        historyItem.requested_time
                      )}
                    </p>
                    {historyItem.doctor_notes ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">
                        {historyItem.doctor_notes}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-muted">
                  No previous visits found for this patient.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
  subvalue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subvalue?: string | null;
}) => (
  <div className="rounded-[14px] bg-brand-paper-soft p-4">
    <div className="flex items-center gap-2 text-brand">
      {icon}
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">
        {label}
      </p>
    </div>
    <p className="mt-3 text-sm font-semibold text-brand-ink">{value}</p>
    {subvalue ? <p className="mt-1 text-xs text-brand-muted">{subvalue}</p> : null}
  </div>
);
