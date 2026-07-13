import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const resourceCopy: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  patients: {
    title: "Patients",
    description:
      "Patient registration and lookup will connect to the Supabase patients table.",
  },
  appointments: {
    title: "Appointments",
    description:
      "Appointment booking, status tracking, and doctor queue actions will connect to the Supabase appointments table.",
  },
  clinics: {
    title: "Clinics",
    description:
      "Clinic records for Hagadera, Ifo, and Dhagahley will connect to the Supabase clinics table.",
  },
  services: {
    title: "Services",
    description:
      "Clinic services such as general visits, child health, and maternal care will connect to the Supabase services table.",
  },
  doctors: {
    title: "Doctors",
    description:
      "Doctor profiles and clinic assignments will connect to the Supabase doctors table.",
  },
};

type ResourcePlaceholderPageProps = {
  resource: keyof typeof resourceCopy;
  mode?: "list" | "create" | "edit" | "show";
};

const modeLabels = {
  list: "List view",
  create: "Create view",
  edit: "Edit view",
  show: "Show view",
};

export const ResourcePlaceholderPage = ({
  resource,
  mode = "list",
}: ResourcePlaceholderPageProps) => {
  const { id } = useParams();
  const copy = resourceCopy[resource];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center">
      <Card className="w-full border-brand-border shadow-brand-card">
        <CardHeader>
          <p className="text-sm font-semibold text-brand">{modeLabels[mode]}</p>
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-brand-muted">{copy.description}</p>
          {id && (
            <p className="rounded-[8px] bg-brand-mint px-4 py-3 text-sm text-brand-ink">
              Selected record id: {id}
            </p>
          )}
          <p className="text-sm text-brand-muted">
            The Supabase provider and schema are ready. The next step is to add
            the feature forms and tables for this resource.
          </p>
          <Button asChild className="bg-brand hover:bg-brand-dark">
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
