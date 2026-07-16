import type { UserRole } from "@/features/shared/types/hospital";

export const roleHomePath: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export const defaultRole: UserRole = "patient";

export const isUserRole = (role: unknown): role is UserRole =>
  role === "patient" || role === "doctor" || role === "admin";

export const getRoleHomePath = (role: unknown) =>
  isUserRole(role) ? roleHomePath[role] : roleHomePath[defaultRole];
