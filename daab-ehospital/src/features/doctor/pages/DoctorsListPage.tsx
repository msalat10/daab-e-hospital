import { useMemo, type ReactNode } from "react";
import { useList } from "@refinedev/core";
import { Building2, Loader2, Phone, Stethoscope, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { Clinic, Doctor } from "@/features/shared/types/hospital";

export const DoctorsListPage = () => {
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });

  const doctors = doctorsList.result.data;
  const clinics = clinicsList.result.data;
  const isLoading = doctorsList.query.isLoading || clinicsList.query.isLoading;
  const hasError = doctorsList.query.isError || clinicsList.query.isError;

  const clinicsById = useMemo(
    () => new Map(clinics.map((clinic) => [clinic.id, clinic])),
    [clinics]
  );

  const activeDoctors = doctors.filter((doctor) => doctor.is_active).length;
  const specialties = new Set(
    doctors
      .map((doctor) => doctor.specialty)
      .filter((specialty): specialty is string => Boolean(specialty))
  ).size;

  return (
    <div className="space-y-6">
      <section className="rounded-[8px] border border-brand-border bg-brand-surface px-5 py-4 shadow-brand-card">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge className="border-brand-border bg-brand-paper-soft text-brand-muted">
              Doctor portal
            </Badge>
            <h1 className="text-2xl font-semibold tracking-normal text-brand-ink">
              Doctors
            </h1>
            <p className="text-sm leading-6 text-brand-muted">
              Live doctor profiles loaded from Supabase for clinic assignment
              and appointment planning.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-9 w-fit rounded-[6px] border-brand-border bg-brand-surface text-brand-ink hover:bg-brand-light hover:text-brand-ink"
            onClick={() => doctorsList.query.refetch()}
          >
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<UsersRound className="h-5 w-5" />}
          label="Total doctors"
          value={doctors.length}
        />
        <StatCard
          icon={<Stethoscope className="h-5 w-5" />}
          label="Active doctors"
          value={activeDoctors}
        />
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Specialties"
          value={specialties}
        />
      </section>

      <Card className="overflow-hidden rounded-[8px] border-brand-border bg-white shadow-brand-card">
        <CardHeader className="border-b border-brand-border/70">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl text-brand-ink">
              Supabase doctor records
            </CardTitle>
            <p className="text-sm text-brand-muted">
              Source table: <span className="font-medium">doctors</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex min-h-[220px] items-center justify-center gap-3 text-brand-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading doctors from Supabase...
            </div>
          )}

          {hasError && !isLoading && (
            <div className="m-6 rounded-[8px] border border-brand-danger/20 bg-brand-danger-soft px-4 py-4 text-sm text-brand-danger">
              We could not load doctors from Supabase. Check the environment
              keys and the RLS select policy on the doctors table.
            </div>
          )}

          {!isLoading && !hasError && doctors.length === 0 && (
            <div className="m-6 rounded-[8px] border border-brand-border bg-brand-paper-soft px-4 py-8 text-center">
              <p className="font-medium text-brand-ink">No doctors found.</p>
              <p className="mt-2 text-sm text-brand-muted">
                Add doctors in Supabase and refresh this page.
              </p>
            </div>
          )}

          {!isLoading && !hasError && doctors.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-paper-soft hover:bg-brand-paper-soft">
                  <TableHead className="px-6 text-brand-muted">Name</TableHead>
                  <TableHead className="text-brand-muted">Specialty</TableHead>
                  <TableHead className="text-brand-muted">Clinic</TableHead>
                  <TableHead className="text-brand-muted">Phone</TableHead>
                  <TableHead className="pr-6 text-right text-brand-muted">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => {
                  const clinic = doctor.clinic_id
                    ? clinicsById.get(doctor.clinic_id)
                    : undefined;

                  return (
                    <TableRow key={doctor.id} className="hover:bg-brand-light">
                      <TableCell className="px-6">
                        <div>
                          <p className="font-medium text-brand-ink">
                            {doctor.full_name}
                          </p>
                          <p className="text-xs text-brand-muted">
                            {doctor.title || "Clinical staff"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-brand-ink">
                        {doctor.specialty || "Not specified"}
                      </TableCell>
                      <TableCell>
                        <div className="text-brand-ink">
                          {clinic?.name || "Unassigned"}
                        </div>
                        {clinic?.camp && (
                          <div className="text-xs text-brand-muted">
                            {clinic.camp}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-brand-muted">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {doctor.phone || "No phone"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Badge
                          className={
                            doctor.is_active
                              ? "border-brand-success/20 bg-brand-success-soft text-brand-success"
                              : "border-brand-border bg-brand-paper text-brand-muted"
                          }
                          variant="outline"
                        >
                          {doctor.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <Card className="rounded-[8px] border-brand-border bg-white shadow-brand-card">
    <CardContent className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-sm text-brand-muted">{label}</p>
        <p className="mt-1 text-3xl font-semibold text-brand-ink">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-brand-light text-brand">
        {icon}
      </div>
    </CardContent>
  </Card>
);
