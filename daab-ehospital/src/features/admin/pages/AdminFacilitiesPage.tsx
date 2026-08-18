import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Search } from "lucide-react";

import {
  AdminMetric,
  AdminStatusBadge,
  AdminTableCell,
  AdminTableHead,
  AdminTableShell,
} from "@/features/admin/components/AdminTable";
import { Input } from "@/components/ui/input";
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
  Service,
} from "@/features/shared/types/hospital";

export const AdminFacilitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const facilitiesList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
    sorters: [{ field: "name", order: "asc" }],
  });
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
  });
  const servicesList = useList<Service>({
    resource: "services",
    pagination: { mode: "off" },
  });
  const appointmentsList = useList<Appointment>({
    resource: "appointments",
    pagination: { mode: "off" },
  });

  const facilities = facilitiesList.result.data;
  const doctors = doctorsList.result.data;
  const services = servicesList.result.data;
  const appointments = appointmentsList.result.data;
  const counts = useMemo(() => {
    const doctorsByFacility = new Map<string, number>();
    const servicesByFacility = new Map<string, number>();
    const appointmentsByFacility = new Map<string, number>();

    doctors.forEach((doctor) => {
      if (doctor.clinic_id) {
        doctorsByFacility.set(
          doctor.clinic_id,
          (doctorsByFacility.get(doctor.clinic_id) ?? 0) + 1
        );
      }
    });
    services.forEach((service) => {
      if (service.clinic_id) {
        servicesByFacility.set(
          service.clinic_id,
          (servicesByFacility.get(service.clinic_id) ?? 0) + 1
        );
      }
    });
    appointments.forEach((appointment) => {
      appointmentsByFacility.set(
        appointment.clinic_id,
        (appointmentsByFacility.get(appointment.clinic_id) ?? 0) + 1
      );
    });

    return { doctorsByFacility, servicesByFacility, appointmentsByFacility };
  }, [appointments, doctors, services]);
  const filteredFacilities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return facilities;
    }

    return facilities.filter((facility) =>
      [facility.name, facility.camp, facility.location, facility.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [facilities, searchQuery]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label="Facilities" value={facilities.length} />
        <AdminMetric
          label="Active"
          value={facilities.filter((facility) => facility.is_active).length}
        />
        <AdminMetric label="Services" value={services.length} />
      </section>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search facilities"
          className="h-10 rounded-[6px] border-brand-border bg-brand-surface pl-9"
        />
      </div>

      <AdminTableShell
        title="Facilities"
        isLoading={
          facilitiesList.query.isLoading ||
          doctorsList.query.isLoading ||
          servicesList.query.isLoading ||
          appointmentsList.query.isLoading
        }
        isError={
          facilitiesList.query.isError ||
          doctorsList.query.isError ||
          servicesList.query.isError ||
          appointmentsList.query.isError
        }
        isEmpty={filteredFacilities.length === 0}
        emptyMessage="No facilities match this view."
      >
        <Table>
          <TableHeader>
            <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
              <AdminTableHead>Facility</AdminTableHead>
              <AdminTableHead>Location</AdminTableHead>
              <AdminTableHead className="text-right">Doctors</AdminTableHead>
              <AdminTableHead className="text-right">Services</AdminTableHead>
              <AdminTableHead className="text-right">Visits</AdminTableHead>
              <AdminTableHead className="text-right">Status</AdminTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFacilities.map((facility) => (
              <TableRow key={facility.id} className="hover:bg-brand-light">
                <AdminTableCell>
                  <div className="font-medium">{facility.name}</div>
                  <div className="mt-1 text-xs text-brand-muted">
                    {facility.phone || "No phone"}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {facility.location || `${facility.camp} Camp`}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  {counts.doctorsByFacility.get(facility.id) ?? 0}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  {counts.servicesByFacility.get(facility.id) ?? 0}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  {counts.appointmentsByFacility.get(facility.id) ?? 0}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <AdminStatusBadge tone={facility.is_active ? "success" : "neutral"}>
                    {facility.is_active ? "Active" : "Inactive"}
                  </AdminStatusBadge>
                </AdminTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
};
