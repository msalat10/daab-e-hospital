import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Bell, CalendarCheck, Clock, XCircle } from "lucide-react";
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
import type { Appointment } from "@/features/shared/types/hospital";
import {
  formatDateTime,
  getAppointmentStatusMessage,
} from "@/features/shared/utils/appointments";

export const PatientNotificationsPage = () => {
  const { patient, isLoading: patientLoading } = useCurrentPatient();
  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: [
      {
        field: "patient_id",
        operator: "eq",
        value: patient?.id ?? "__no_patient__",
      },
    ],
    sorters: [{ field: "updated_at", order: "desc" }],
    queryOptions: {
      enabled: Boolean(patient?.id),
    },
  });

  const notifications = useMemo(
    () =>
      appointmentsList.result.data.map((appointment) => ({
        appointment,
        title: getNotificationTitle(appointment.status),
        icon: getNotificationIcon(appointment.status),
      })),
    [appointmentsList.result.data]
  );

  if (!patientLoading && !patient) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Complete your profile first
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Your appointment updates will appear after your patient profile is
            connected.
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
          Appointment updates
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          A simple activity feed for appointment requests, confirmations, and
          clinic decisions.
        </p>
      </section>

      <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardHeader className="border-b border-brand-border/70">
          <CardTitle className="flex items-center gap-2 text-xl text-brand-ink">
            <Bell className="h-5 w-5 text-brand" />
            Latest updates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {appointmentsList.query.isLoading ? (
            <EmptyFeed message="Loading updates..." />
          ) : notifications.length ? (
            <div className="space-y-4">
              {notifications.map(({ appointment, title, icon }) => (
                <Link
                  key={appointment.id}
                  to={`/patient/appointments/${appointment.id}`}
                  className="block rounded-[16px] bg-brand-paper-soft p-4 transition hover:bg-brand-mint/70"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-ink">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-brand-muted">
                          {getAppointmentStatusMessage(appointment.status)}
                        </p>
                        <p className="mt-2 text-xs font-medium text-brand-muted">
                          {formatDateTime(
                            appointment.requested_date,
                            appointment.requested_time
                          )}{" "}
                          | Ref {appointment.reference_code}
                        </p>
                      </div>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyFeed message="No appointment updates yet. Book a visit to start receiving status updates." />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const getNotificationTitle = (status: Appointment["status"]) => {
  switch (status) {
    case "pending":
      return "Appointment request received";
    case "confirmed":
      return "Appointment confirmed";
    case "completed":
      return "Visit completed";
    case "missed":
      return "Appointment marked missed";
    case "cancelled":
      return "Appointment cancelled";
    default:
      return "Appointment updated";
  }
};

const getNotificationIcon = (status: Appointment["status"]) => {
  switch (status) {
    case "confirmed":
    case "completed":
      return <CalendarCheck className="h-5 w-5" />;
    case "cancelled":
    case "missed":
      return <XCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const EmptyFeed = ({ message }: { message: string }) => (
  <div className="flex min-h-[260px] items-center justify-center rounded-[18px] bg-brand-paper-soft p-8 text-center text-sm leading-6 text-brand-muted">
    {message}
  </div>
);
