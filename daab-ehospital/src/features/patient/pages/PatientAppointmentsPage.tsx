import { useMemo } from "react";
import { type HttpError, useList, useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
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
  Doctor,
  Service,
} from "@/features/shared/types/hospital";
import {
  canPatientCancel,
  formatDateTime,
} from "@/features/shared/utils/appointments";
import { AppointmentStatusBadge } from "../components/AppointmentStatusBadge";
import { useCurrentPatient } from "../hooks/useCurrentPatient";

export const PatientAppointmentsPage = () => {
  const { patient, isLoading: patientLoading } = useCurrentPatient();

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

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Appointment>();

    return [
      columnHelper.accessor("reference_code", {
        id: "reference_code",
        header: "Reference",
        enableSorting: false,
        size: 170,
      }),
      columnHelper.accessor("requested_date", {
        id: "requested_date",
        header: "Requested visit",
        enableSorting: true,
        cell: ({ row }) =>
          formatDateTime(row.original.requested_date, row.original.requested_time),
        size: 190,
      }),
      columnHelper.accessor("clinic_id", {
        id: "clinic_id",
        header: "Clinic",
        enableSorting: false,
        cell: ({ getValue }) => {
          const clinic = clinicsById.get(getValue());
          return clinic ? `${clinic.name}, ${clinic.camp}` : "Clinic";
        },
        size: 240,
      }),
      columnHelper.accessor("service_id", {
        id: "service_id",
        header: "Service",
        enableSorting: false,
        cell: ({ getValue }) => {
          const serviceId = getValue();
          return serviceId
            ? servicesById.get(serviceId)?.name || "General visit"
            : "General visit";
        },
        size: 210,
      }),
      columnHelper.accessor("doctor_id", {
        id: "doctor_id",
        header: "Doctor",
        enableSorting: false,
        cell: ({ getValue }) => {
          const doctorId = getValue();
          return doctorId
            ? doctorsById.get(doctorId)?.full_name || "Assigned doctor"
            : "Not assigned";
        },
        size: 190,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ getValue }) => <AppointmentStatusBadge status={getValue()} />,
        size: 150,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const appointment = row.original;
          const canCancel = canPatientCancel(appointment.status);

          return (
            <div className="flex items-center gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-brand-border px-3 text-xs"
              >
                <Link to={`/patient/appointments/${appointment.id}`}>Open</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-red-200 px-3 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={!canCancel || updateAppointment.mutation.isPending}
                onClick={async () => {
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
                }}
              >
                Cancel
              </Button>
            </div>
          );
        },
        enableSorting: false,
        size: 190,
      }),
    ];
  }, [clinicsById, doctorsById, servicesById, updateAppointment]);

  const table = useTable<Appointment>({
    columns,
    refineCoreProps: {
      resource: "appointments",
      syncWithLocation: true,
      filters: {
        permanent: [
          {
            field: "patient_id",
            operator: "eq",
            value: patient?.id ?? "__no_patient__",
          },
        ],
      },
      sorters: {
        initial: [{ field: "requested_date", order: "desc" }],
      },
      queryOptions: {
        enabled: Boolean(patient?.id),
      },
    },
  });

  if (!patientLoading && !patient) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Complete your profile first
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Your appointment history will appear after your patient profile is
            connected to your account.
          </p>
          <Button
            asChild
            className="mt-5 rounded-[4px] bg-brand hover:bg-brand-dark"
          >
            <Link to="/patient/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] border-0 bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Patient portal</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-brand-ink">
              My appointments
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              Track appointment requests, open full visit details, or update a
              request when clinic plans change.
            </p>
          </div>
          <Button
            asChild
            className="w-fit rounded-full bg-brand hover:bg-brand-dark"
          >
            <Link to="/patient/book">Book appointment</Link>
          </Button>
        </div>
      </section>

      <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardHeader className="border-b border-brand-border/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-brand-ink">
                Appointment history
              </CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                Only appointments linked to your patient profile are shown.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable table={table} />
        </CardContent>
      </Card>
    </div>
  );
};
