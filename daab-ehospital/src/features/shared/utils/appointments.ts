import type { AppointmentStatus } from "../types/hospital";

export const generateReferenceCode = () => {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `DAD-${datePart}-${randomPart}`;
};

export const formatAppointmentStatus = (status: AppointmentStatus) =>
  status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

export const formatDateTime = (date?: string | null, time?: string | null) => {
  if (!date) {
    return "Not scheduled";
  }

  return time ? `${date} at ${time.slice(0, 5)}` : date;
};

export const getAppointmentStatusMessage = (status: AppointmentStatus) => {
  const messages: Record<AppointmentStatus, string> = {
    pending:
      "Your request is waiting for clinic review. Keep your reference code safe.",
    confirmed:
      "Your visit has been confirmed. Please arrive a little before the scheduled time.",
    completed:
      "This visit is marked as completed. Clinic notes will appear here when available.",
    missed:
      "This visit was missed. You can book another appointment when you are ready.",
    cancelled:
      "This appointment was cancelled. You can create a new request at any time.",
  };

  return messages[status];
};

export const canPatientCancel = (status: AppointmentStatus) =>
  status === "pending" || status === "confirmed";

export const canPatientReschedule = (status: AppointmentStatus) =>
  status === "pending" || status === "confirmed";
