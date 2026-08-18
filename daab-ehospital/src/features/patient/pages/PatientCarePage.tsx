import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Building2, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Clinic } from "@/features/shared/types/hospital";

const careLocations = [
  {
    name: "Hagadera Main Hospital",
    camp: "Hagadera",
    location: "Hagadera Camp",
  },
  {
    name: "Health Post E6",
    camp: "Ifo",
    location: "Hagadera Camp",
  },
  {
    name: "Health Post L6",
    camp: "Dhagahley",
    location: "Hagadera Camp",
  },
] as const;

export const PatientCarePage = () => {
  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
  });

  const clinicsByCamp = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.camp, clinic])),
    [clinicsList.result.data]
  );

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <div className="grid gap-4 md:grid-cols-3">
        {clinicsList.query.isLoading ? (
          <Card className="rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card md:col-span-3">
            <CardContent className="p-5 text-sm text-brand-muted">
              Loading care locations...
            </CardContent>
          </Card>
        ) : (
          careLocations.map((location) => {
            const clinic = clinicsByCamp.get(location.camp);

            return (
              <Card
                key={location.name}
                className="rounded-[8px] border border-brand-border bg-brand-surface shadow-brand-card"
              >
                <CardContent className="flex h-full flex-col justify-between p-5">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-mint text-brand">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-brand-ink">
                      {location.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-brand-muted">
                      <MapPin className="h-4 w-4" />
                      {location.location}
                    </p>
                    {clinic?.phone ? (
                      <p className="mt-2 flex items-center gap-2 text-sm text-brand-muted">
                        <Phone className="h-4 w-4" />
                        {clinic.phone}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-6 w-fit rounded-[6px] border-brand-border"
                  >
                    <Link to="/patient/book">Request visit</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
