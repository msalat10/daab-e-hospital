import { useMemo, useState } from "react";
import { type HttpError, useList, useUpdate } from "@refinedev/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router";

import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import {
  doctorStatusTabs,
  isAppointmentInDoctorScope,
} from "../utils/doctorAppointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableInstanceShell } from "@/components/refine-ui/data-table/table-instance-shell";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const doctorAppointmentFilters = useMemo(
    () =>
      doctor?.clinic_id
        ? [{ field: "clinic_id", operator: "eq" as const, value: doctor.clinic_id }]
        : doctor?.id
        ? [{ field: "doctor_id", operator: "eq" as const, value: doctor.id }]
        : [{ field: "id", operator: "eq" as const, value: "__no_doctor__" }],
    [doctor?.clinic_id, doctor?.id]
  );

  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    filters: doctorAppointmentFilters,
    sorters: [{ field: "requested_date", order: "asc" }],
    queryOptions: {
      enabled: Boolean(doctor?.clinic_id || doctor?.id),
    },
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
  const filteredAppointments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return scopedAppointments.filter((appointment) => {
      const patient = patientsById.get(appointment.patient_id);
      const clinic = clinicsById.get(appointment.clinic_id);
      const service = appointment.service_id
        ? servicesById.get(appointment.service_id)
        : undefined;
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      const searchableText = [
        appointment.reference_code,
        patient?.full_name,
        patient?.refugee_id,
        clinic?.name,
        clinic?.camp,
        service?.name,
        appointment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(normalizedQuery);
    });
  }, [
    clinicsById,
    patientsById,
    scopedAppointments,
    searchQuery,
    servicesById,
    statusFilter,
  ]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Appointment>();

    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all appointments"
            className="border-brand-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select appointment"
            className="border-brand-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          />
        ),
        size: 54,
      }),
      columnHelper.accessor("reference_code", {
        header: "Reference",
        cell: ({ row }) => {
          const patient = patientsById.get(row.original.patient_id);
          return (
            <div>
              <p className="font-semibold text-brand-ink">
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
          return <span className="font-semibold text-brand-ink">{patient?.full_name || "Patient"}</span>;
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
              <p className="font-semibold text-brand-ink">
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
        cell: ({ row }) => (
          <span className="font-medium text-brand-muted">
            {formatDateTime(
              row.original.requested_date,
              row.original.requested_time
            )}
          </span>
        ),
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
                className="h-8 rounded-[6px] border-brand-border bg-brand-surface px-3 text-xs text-brand-ink hover:bg-brand-light hover:text-brand-ink"
              >
                <Link to={`/doctor/appointments/${appointment.id}`}>Open</Link>
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-[8px] bg-primary px-3 text-xs hover:bg-primary/90"
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
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });
  const selectedRows = table.getSelectedRowModel().rows.length;

  if (!doctorLoading && !doctor) {
    return (
      <Card className="mx-auto max-w-3xl rounded-[8px] border-brand-border bg-brand-surface shadow-brand-card">
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
      <TableInstanceShell
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search patients, references, clinics"
        tabs={doctorStatusTabs.map((status) => ({
          value: status,
          label: status === "all" ? "All" : formatAppointmentStatus(status),
        }))}
        activeTab={statusFilter}
        onTabChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}
        filterButtons={["Patient", "Clinic", "Status"]}
        rowInfo={`${filteredAppointments.length} rows / ${selectedRows} selected`}
        summaries={[
          { label: "Filtered", value: `${filteredAppointments.length} rows` },
          {
            label: "Sorted",
            value:
              statusFilter === "all"
                ? "date asc"
                : formatAppointmentStatus(statusFilter),
          },
          { label: "Selected", value: `${selectedRows} rows` },
        ]}
      >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-brand-border bg-brand-paper-soft hover:bg-brand-paper-soft"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-9 px-3 text-xs font-semibold text-brand-muted"
                      >
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
                      className="h-40 bg-brand-surface text-center text-brand-muted"
                    >
                      Loading appointment queue...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-brand-divider bg-brand-surface transition hover:bg-brand-light"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-3 text-sm text-brand-ink">
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
                      className="h-40 bg-brand-surface text-center text-brand-muted"
                    >
                      No appointments match this queue view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
      </TableInstanceShell>
    </div>
  );
};
