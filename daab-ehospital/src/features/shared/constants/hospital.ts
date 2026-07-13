import type { AppointmentStatus, CampName, Gender } from "../types/hospital";

export const CAMPS: CampName[] = ["Hagadera", "Ifo", "Dhagahley"];

export const GENDERS: Array<{ label: string; value: Gender }> = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export const APPOINTMENT_STATUSES: Array<{
  label: string;
  value: AppointmentStatus;
}> = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
  { label: "Cancelled", value: "cancelled" },
];

export const HOSPITAL_RESOURCES = [
  "patients",
  "appointments",
  "clinics",
  "services",
  "doctors",
] as const;
