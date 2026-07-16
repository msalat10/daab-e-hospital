import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Patient } from "@/features/shared/types/hospital";

const profileFields = [
  { key: "full_name", label: "Full name" },
  { key: "refugee_id", label: "Refugee ID" },
  { key: "phone", label: "Phone number" },
  { key: "camp", label: "Camp" },
  { key: "gender", label: "Gender" },
  { key: "date_of_birth", label: "Date of birth" },
] as const;

export const PatientProfileCompletion = ({
  patient,
}: {
  patient?: Patient;
}) => {
  const completedFields = patient
    ? profileFields.filter((field) => Boolean(patient[field.key])).length
    : 0;
  const percentage = Math.round((completedFields / profileFields.length) * 100);
  const missingFields = profileFields.filter(
    (field) => !patient || !patient[field.key]
  );

  return (
    <div className="rounded-[18px] bg-white p-5 shadow-brand-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-muted">
            Profile readiness
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-brand-ink">
            {percentage}% complete
          </h2>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-brand px-4 hover:bg-brand-dark"
        >
          <Link to="/patient/profile">{patient ? "Update" : "Start"}</Link>
        </Button>
      </div>

      <Progress value={percentage} className="mt-5 h-2 bg-brand-mint" />

      <div className="mt-4 flex flex-wrap gap-2">
        {missingFields.length ? (
          missingFields.slice(0, 4).map((field) => (
            <span
              key={field.key}
              className="rounded-full bg-brand-paper-soft px-3 py-1 text-xs font-medium text-brand-muted"
            >
              {field.label}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-brand-mint px-3 py-1 text-xs font-medium text-brand">
            Ready for appointment booking
          </span>
        )}
      </div>
    </div>
  );
};
