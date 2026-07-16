export type CampName = "Hagadera" | "Ifo" | "Dhagahley";

export type Gender = "female" | "male" | "other" | "prefer_not_to_say";

export type UserRole = "patient" | "doctor" | "admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "missed"
  | "cancelled";

export type Clinic = {
  id: string;
  name: string;
  camp: CampName;
  location?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description?: string | null;
  clinic_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: string;
  user_id?: string | null;
  full_name: string;
  title?: string | null;
  specialty?: string | null;
  clinic_id?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Patient = {
  id: string;
  user_id?: string | null;
  full_name: string;
  refugee_id?: string | null;
  phone?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  camp?: CampName | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  reference_code: string;
  patient_id: string;
  clinic_id: string;
  service_id?: string | null;
  doctor_id?: string | null;
  requested_date: string;
  requested_time?: string | null;
  reason?: string | null;
  status: AppointmentStatus;
  doctor_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};
