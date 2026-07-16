import type {
  Appointment,
  AppointmentStatus,
  Doctor,
} from "@/features/shared/types/hospital";

export const doctorStatusTabs: Array<AppointmentStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "missed",
  "cancelled",
];

export const isAppointmentInDoctorScope = (
  appointment: Appointment,
  doctor?: Doctor
) => {
  if (!doctor) {
    return false;
  }

  const assignedToDoctor = appointment.doctor_id === doctor.id;
  const openClinicRequest =
    appointment.status === "pending" &&
    Boolean(doctor.clinic_id) &&
    appointment.clinic_id === doctor.clinic_id;

  return assignedToDoctor || openClinicRequest;
};

export const isTodayAppointment = (appointment: Appointment) =>
  appointment.requested_date === new Date().toISOString().slice(0, 10);
