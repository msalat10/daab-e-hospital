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
import type { Clinic, Doctor } from "@/features/shared/types/hospital";

export const AdminDoctorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    sorters: [{ field: "full_name", order: "asc" }],
  });
  const facilitiesList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });

  const doctors = doctorsList.result.data;
  const facilities = facilitiesList.result.data;
  const facilitiesById = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities]
  );
  const specialties = new Set(
    doctors
      .map((doctor) => doctor.specialty)
      .filter((specialty): specialty is string => Boolean(specialty))
  );
  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const facility = doctor.clinic_id
        ? facilitiesById.get(doctor.clinic_id)
        : undefined;

      return [
        doctor.full_name,
        doctor.title,
        doctor.specialty,
        doctor.phone,
        facility?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [doctors, facilitiesById, searchQuery]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label="Total doctors" value={doctors.length} />
        <AdminMetric
          label="Active"
          value={doctors.filter((doctor) => doctor.is_active).length}
        />
        <AdminMetric label="Specialties" value={specialties.size} />
      </section>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search doctors"
          className="h-10 rounded-[6px] border-brand-border bg-brand-surface pl-9"
        />
      </div>

      <AdminTableShell
        title="Doctors"
        isLoading={doctorsList.query.isLoading || facilitiesList.query.isLoading}
        isError={doctorsList.query.isError || facilitiesList.query.isError}
        isEmpty={filteredDoctors.length === 0}
        emptyMessage="No doctors match this view."
      >
        <Table>
          <TableHeader>
            <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
              <AdminTableHead>Name</AdminTableHead>
              <AdminTableHead>Specialty</AdminTableHead>
              <AdminTableHead>Post</AdminTableHead>
              <AdminTableHead>Phone</AdminTableHead>
              <AdminTableHead className="text-right">Status</AdminTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.map((doctor) => {
              const facility = doctor.clinic_id
                ? facilitiesById.get(doctor.clinic_id)
                : undefined;

              return (
                <TableRow key={doctor.id} className="hover:bg-brand-light">
                  <AdminTableCell>
                    <div className="font-medium">{doctor.full_name}</div>
                    <div className="mt-1 text-xs text-brand-muted">
                      {doctor.title || "Clinical staff"}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    {doctor.specialty || "Not specified"}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div>{facility?.name || "Unassigned"}</div>
                    {facility?.camp && (
                      <div className="mt-1 text-xs text-brand-muted">
                        {facility.camp} Camp
                      </div>
                    )}
                  </AdminTableCell>
                  <AdminTableCell>{doctor.phone || "No phone"}</AdminTableCell>
                  <AdminTableCell className="text-right">
                    <AdminStatusBadge tone={doctor.is_active ? "success" : "neutral"}>
                      {doctor.is_active ? "Active" : "Inactive"}
                    </AdminStatusBadge>
                  </AdminTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
};
