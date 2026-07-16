import { useMemo, useState } from "react";
import { type HttpError, useList, useUpdate } from "@refinedev/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router";

import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import {
  doctorStatusTabs,
  isAppointmentInDoctorScope,
} from "../utils/doctorAppointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AppointmentStatus,
  Clinic,
  Patient,
  Service,
} from "@/features/shared/types/hospital";
import { AppointmentStatusBadge } from "@/features/shared/components/AppointmentStatusBadge";
import {
  formatAppointmentStatus,
  formatDateTime,
} from "@/features/shared/utils/appointments";

export const DoctorAppointmentsPage = () => {
  const { doctor, isLoading: doctorLoading } = useCurrentDoctor();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );

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
  const updateAppointment = useUpdate<
    Appointment,
    HttpError,
    Partial<Appointment>
  >();

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

  const scopedAppointments = useMemo(
    () =>
      appointmentsList.result.data.filter((appointment) =>
        isAppointmentInDoctorScope(appointment, doctor)
      ),
    [appointmentsList.result.data, doctor]
  );
  const filteredAppointments = useMemo(
    () =>
      statusFilter === "all"
        ? scopedAppointments
        : scopedAppointments.filter(
            (appointment) => appointment.status === statusFilter
          ),
    [scopedAppointments, statusFilter]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Appointment>();

    return [
      columnHelper.accessor("reference_code", {
        header: "Reference",
        cell: ({ row }) => {
          const patient = patientsById.get(row.original.patient_id);
          return (
            <div>
              <p className="font-medium text-brand-ink">
                {row.original.reference_code}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                {patient?.refugee_id || "No refugee ID"}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("patient_id", {
        header: "Patient",
        cell: ({ getValue }) => {
          const patient = patientsById.get(getValue());
          return patient?.full_name || "Patient";
        },
      }),
      columnHelper.accessor("clinic_id", {
        header: "Clinic / Service",
        cell: ({ row }) => {
          const clinic = clinicsById.get(row.original.clinic_id);
          const service = row.original.service_id
            ? servicesById.get(row.original.service_id)
            : undefined;

          return (
            <div>
              <p className="font-medium text-brand-ink">
                {clinic ? `${clinic.name}, ${clinic.camp}` : "Clinic"}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                {service?.name || "General visit"}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("requested_date", {
        header: "Visit time",
        cell: ({ row }) =>
          formatDateTime(row.original.requested_date, row.original.requested_time),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <AppointmentStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const appointment = row.original;
          const canConfirm = appointment.status === "pending" && doctor?.id;

          return (
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 rounded-full border-brand-border px-3 text-xs"
              >
                <Link to={`/doctor/appointments/${appointment.id}`}>Open</Link>
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-full bg-brand px-3 text-xs hover:bg-brand-dark"
                disabled={!canConfirm || updateAppointment.mutation.isPending}
                onClick={async () => {
                  if (!doctor) {
                    return;
                  }

                  await updateAppointment.mutateAsync({
                    resource: "appointments",
                    id: appointment.id,
                    values: {
                      status: "confirmed",
                      doctor_id: doctor.id,
                    },
                    successNotification: {
                      type: "success",
                      message: "Appointment confirmed",
                      description: "The patient appointment is now confirmed.",
                    },
                  });
                  await appointmentsList.query.refetch();
                }}
              >
                Confirm
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [
    appointmentsList.query,
    clinicsById,
    doctor,
    patientsById,
    servicesById,
    updateAppointment,
  ]);

  const table = useReactTable({
    data: filteredAppointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!doctorLoading && !doctor) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-brand-ink">
            Choose your doctor profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Select a doctor profile before opening the appointment queue.
          </p>
          <Button asChild className="mt-5 rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/doctor/profile">Choose doctor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Doctor portal</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-brand-ink">
              Appointment queue
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              Review pending clinic requests and manage visits assigned to your
              doctor profile.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full">
            <Link to="/doctor/dashboard">Dashboard</Link>
          </Button>
        </div>
      </section>

      <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardHeader className="border-b border-brand-border/70">
          <CardTitle className="text-xl text-brand-ink">
            Queue records
          </CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {doctorStatusTabs.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                className={
                  statusFilter === status
                    ? "rounded-full bg-brand px-4 hover:bg-brand-dark"
                    : "rounded-full border-brand-border px-4"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "All" : formatAppointmentStatus(status)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-brand-paper-soft hover:bg-brand-paper-soft"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-5 text-brand-muted">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {appointmentsList.query.isLoading || doctorLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center text-brand-muted"
                    >
                      Loading appointment queue...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-5 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center text-brand-muted"
                    >
                      No appointments match this queue view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
