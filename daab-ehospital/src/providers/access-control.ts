import type { AccessControlProvider } from "@refinedev/core";

import type { UserRole } from "@/features/shared/types/hospital";
import { authProvider } from "./auth";

const resourceRoles: Record<string, UserRole[]> = {
  "admin-dashboard": ["admin"],
  "patient-dashboard": ["patient"],
  patients: ["patient", "admin"],
  appointments: ["patient", "doctor", "admin"],
  facilities: ["admin"],
  "patient-care": ["patient"],
  "patient-notifications": ["patient"],
  "doctor-dashboard": ["doctor"],
  "doctor-queue": ["doctor"],
  "doctor-profile": ["doctor"],
  clinics: ["admin"],
  services: ["admin"],
  doctors: ["admin"],
};

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, params }) => {
    const role = (await authProvider.getPermissions?.({})) as UserRole | null;
    const resourceName = params?.resource?.name || resource;
    const allowedRoles =
      (params?.resource?.meta?.allowedRoles as UserRole[] | undefined) ||
      resourceRoles[resourceName || ""];

    if (!allowedRoles || !role) {
      return { can: true };
    }

    return {
      can: allowedRoles.includes(role),
      reason: "This area is not available for your account role.",
    };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: true,
    },
  },
};
