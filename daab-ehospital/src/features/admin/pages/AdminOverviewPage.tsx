import { useMemo } from "react";
import { useList } from "@refinedev/core";

import {
  AdminMetric,
  AdminStatusBadge,
  AdminTableCell,
  AdminTableHead,
  AdminTableShell,
  formatAdminDate,
} from "@/features/admin/components/AdminTable";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Appointment,
  Clinic,
  Doctor,
  Patient,
} from "@/features/shared/types/hospital";

export const AdminOverviewPage = () => {
  const patientsList = useList<Patient>({
    resource: "patients",
    pagination: { mode: "off" },
  });
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
  });
  const facilitiesList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });
  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
    sorters: [{ field: "requested_date", order: "desc" }],
  });

  const patients = patientsList.result.data;
  const doctors = doctorsList.result.data;
  const facilities = facilitiesList.result.data;
  const appointments = appointmentsList.result.data;
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter(
    (appointment) => appointment.requested_date === today
  );
  const recentAppointments = appointments.slice(0, 6);
  const clinicsById = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities]
  );
  const patientsById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients]
  );
  const isLoading =
    patientsList.query.isLoading ||
    doctorsList.query.isLoading ||
    facilitiesList.query.isLoading ||
    appointmentsList.query.isLoading;
  const isError =
    patientsList.query.isError ||
    doctorsList.query.isError ||
    facilitiesList.query.isError ||
    appointmentsList.query.isError;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Patients" value={patients.length} />
        <AdminMetric label="Doctors" value={doctors.length} />
        <AdminMetric label="Facilities" value={facilities.length} />
        <AdminMetric label="Appointments today" value={todaysAppointments.length} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminTableShell
          title="Recent appointments"
          isLoading={isLoading}
          isError={isError}
          isEmpty={recentAppointments.length === 0}
          emptyMessage="No appointments have been recorded yet."
        >
          <Table>
            <TableHeader>
              <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
                <AdminTableHead>Reference</AdminTableHead>
                <AdminTableHead>Patient</AdminTableHead>
                <AdminTableHead>Post</AdminTableHead>
                <AdminTableHead>Date</AdminTableHead>
                <AdminTableHead className="text-right">Status</AdminTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAppointments.map((appointment) => (
                <TableRow key={appointment.id} className="hover:bg-brand-light">
                  <AdminTableCell>{appointment.reference_code}</AdminTableCell>
                  <AdminTableCell>
                    {patientsById.get(appointment.patient_id)?.full_name ||
                      "Unknown patient"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {clinicsById.get(appointment.clinic_id)?.name || "Unassigned"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {formatAdminDate(appointment.requested_date)}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <AdminStatusBadge tone={getAppointmentTone(appointment.status)}>
                      {appointment.status}
                    </AdminStatusBadge>
                  </AdminTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>

        <AdminTableShell
          title="Facilities"
          isLoading={facilitiesList.query.isLoading}
          isError={facilitiesList.query.isError}
          isEmpty={facilities.length === 0}
          emptyMessage="No facilities found."
        >
          <Table>
            <TableHeader>
              <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
                <AdminTableHead>Facility</AdminTableHead>
                <AdminTableHead className="text-right">Status</AdminTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id} className="hover:bg-brand-light">
                  <AdminTableCell>
                    <div className="font-medium">{facility.name}</div>
                    <div className="mt-1 text-xs text-brand-muted">
                      {facility.location || `${facility.camp} Camp`}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <AdminStatusBadge
                      tone={facility.is_active ? "success" : "neutral"}
                    >
                      {facility.is_active ? "Active" : "Inactive"}
                    </AdminStatusBadge>
                  </AdminTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      </div>
    </div>
  );
};

const getAppointmentTone = (status: Appointment["status"]) => {
  if (status === "confirmed" || status === "completed") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "cancelled" || status === "missed") {
    return "danger";
  }

  return "neutral";
};
