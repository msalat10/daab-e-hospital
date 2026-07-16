import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Building2, ClipboardList, Phone, Stethoscope } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Clinic,
  Doctor,
  Service,
} from "@/features/shared/types/hospital";

export const PatientCarePage = () => {
  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
  });
  const servicesList = useList<Service>({
    resource: "services",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
  });
  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
  });

  const servicesByClinic = useMemo(() => {
    const map = new Map<string, Service[]>();
    servicesList.result.data.forEach((service) => {
      if (!service.clinic_id) {
        return;
      }
      map.set(service.clinic_id, [...(map.get(service.clinic_id) || []), service]);
    });
    return map;
  }, [servicesList.result.data]);

  const doctorsByClinic = useMemo(() => {
    const map = new Map<string, Doctor[]>();
    doctorsList.result.data.forEach((doctor) => {
      if (!doctor.clinic_id) {
        return;
      }
      map.set(doctor.clinic_id, [...(map.get(doctor.clinic_id) || []), doctor]);
    });
    return map;
  }, [doctorsList.result.data]);

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Patient portal</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-brand-ink">
              Find care in Dadaab
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              Browse available clinics, services, and care teams before booking
              a visit.
            </p>
          </div>
          <Button asChild className="w-fit rounded-full bg-brand hover:bg-brand-dark">
            <Link to="/patient/book">Book appointment</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          {clinicsList.query.isLoading ? (
            <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
              <CardContent className="p-6 text-sm text-brand-muted">
                Loading clinics...
              </CardContent>
            </Card>
          ) : (
            clinicsList.result.data.map((clinic) => {
              const clinicServices = servicesByClinic.get(clinic.id) || [];
              const clinicDoctors = doctorsByClinic.get(clinic.id) || [];

              return (
                <Card
                  key={clinic.id}
                  className="rounded-[18px] border-0 bg-white shadow-brand-card"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mint text-brand">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold text-brand-ink">
                          {clinic.name}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-brand-muted">
                          {clinic.location || `${clinic.camp} camp clinic`}
                        </p>
                        {clinic.phone ? (
                          <p className="mt-3 flex items-center gap-2 text-sm text-brand-muted">
                            <Phone className="h-4 w-4" />
                            {clinic.phone}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-fit rounded-full border-brand-border"
                      >
                        <Link to="/patient/book">Request visit</Link>
                      </Button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[14px] bg-brand-paper-soft p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                          <ClipboardList className="h-4 w-4 text-brand" />
                          Services
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {clinicServices.length ? (
                            clinicServices.map((service) => (
                              <span
                                key={service.id}
                                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-muted"
                              >
                                {service.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-muted">
                              General consultation available.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-[14px] bg-brand-paper-soft p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                          <Stethoscope className="h-4 w-4 text-brand" />
                          Care team
                        </p>
                        <div className="mt-3 space-y-2">
                          {clinicDoctors.length ? (
                            clinicDoctors.slice(0, 3).map((doctor) => (
                              <div
                                key={doctor.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="font-medium text-brand-ink">
                                  {doctor.full_name}
                                </span>
                                <span className="text-brand-muted">
                                  {doctor.specialty || doctor.title || "Doctor"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-brand-muted">
                              Doctors will be assigned by the clinic.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card className="h-fit rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader>
            <CardTitle className="text-xl text-brand-ink">
              Available services
            </CardTitle>
            <p className="text-sm leading-6 text-brand-muted">
              Services can be linked to a specific clinic or offered generally
              across the camp health posts.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {servicesList.result.data.map((service) => (
              <div
                key={service.id}
                className="rounded-[14px] bg-brand-paper-soft p-4"
              >
                <p className="font-semibold text-brand-ink">{service.name}</p>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  {service.description || "Patient consultation and follow-up."}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
