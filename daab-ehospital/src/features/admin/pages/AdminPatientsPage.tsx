import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Search } from "lucide-react";

import {
  AdminMetric,
  AdminTableCell,
  AdminTableHead,
  AdminTableShell,
  formatAdminDate,
} from "@/features/admin/components/AdminTable";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment, Patient } from "@/features/shared/types/hospital";

export const AdminPatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const patientsList = useList<Patient>({
    resource: "patients",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "desc" }],
  });
  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
  });

  const patients = patientsList.result.data;
  const appointments = appointmentsList.result.data;
  const appointmentCounts = useMemo(() => {
    const counts = new Map<string, number>();

    appointments.forEach((appointment) => {
      counts.set(
        appointment.patient_id,
        (counts.get(appointment.patient_id) ?? 0) + 1
      );
    });

    return counts;
  }, [appointments]);
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.full_name, patient.refugee_id, patient.phone, patient.camp]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label="Total patients" value={patients.length} />
        <AdminMetric
          label="With refugee ID"
          value={patients.filter((patient) => patient.refugee_id).length}
        />
        <AdminMetric label="Appointment records" value={appointments.length} />
      </section>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search patients"
          className="h-10 rounded-[6px] border-brand-border bg-brand-surface pl-9"
        />
      </div>

      <AdminTableShell
        title="Patients"
        isLoading={patientsList.query.isLoading || appointmentsList.query.isLoading}
        isError={patientsList.query.isError || appointmentsList.query.isError}
        isEmpty={filteredPatients.length === 0}
        emptyMessage="No patients match this view."
      >
        <Table>
          <TableHeader>
            <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
              <AdminTableHead>Name</AdminTableHead>
              <AdminTableHead>Refugee ID</AdminTableHead>
              <AdminTableHead>Phone</AdminTableHead>
              <AdminTableHead>Camp</AdminTableHead>
              <AdminTableHead className="text-right">Visits</AdminTableHead>
              <AdminTableHead className="text-right">Created</AdminTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-brand-light">
                <AdminTableCell>
                  <div className="font-medium">{patient.full_name}</div>
                  <div className="mt-1 text-xs text-brand-muted">
                    {patient.gender || "Gender not set"}
                  </div>
                </AdminTableCell>
                <AdminTableCell>{patient.refugee_id || "Not set"}</AdminTableCell>
                <AdminTableCell>{patient.phone || "No phone"}</AdminTableCell>
                <AdminTableCell>{patient.camp || "Not set"}</AdminTableCell>
                <AdminTableCell className="text-right">
                  {appointmentCounts.get(patient.id) ?? 0}
                </AdminTableCell>
                <AdminTableCell className="text-right text-brand-muted">
                  {formatAdminDate(patient.created_at)}
                </AdminTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
};
