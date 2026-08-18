import type { IResourceItem } from "@refinedev/core";
import {
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import type { UserRole } from "@/features/shared/types/hospital";

export const patientResources: IResourceItem[] = [
  {
    name: "patient-dashboard",
    list: "/patient/dashboard",
    meta: {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      allowedRoles: ["patient"],
    },
  },
  {
    name: "appointments",
    list: "/patient/appointments",
    create: "/patient/book",
    show: "/patient/appointments/:id",
    meta: {
      label: "My Appointments",
      icon: <CalendarCheck className="h-4 w-4" />,
      allowedRoles: ["patient"],
    },
  },
  {
    name: "patient-care",
    list: "/patient/care",
    meta: {
      label: "Find Care",
      icon: <Stethoscope className="h-4 w-4" />,
      allowedRoles: ["patient"],
    },
  },
  {
    name: "patient-notifications",
    list: "/patient/notifications",
    meta: {
      label: "Updates",
      icon: <Bell className="h-4 w-4" />,
      allowedRoles: ["patient"],
    },
  },
  {
    name: "patients",
    list: "/patient/profile",
    meta: {
      label: "Profile",
      icon: <UsersRound className="h-4 w-4" />,
      allowedRoles: ["patient"],
    },
  },
];

export const doctorResources: IResourceItem[] = [
  {
    name: "doctor-dashboard",
    list: "/doctor/dashboard",
    meta: {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      allowedRoles: ["doctor"],
    },
  },
  {
    name: "doctor-queue",
    list: "/doctor/appointments",
    show: "/doctor/appointments/:id",
    meta: {
      label: "Appointment Queue",
      icon: <ClipboardList className="h-4 w-4" />,
      allowedRoles: ["doctor"],
    },
  },
  {
    name: "doctor-profile",
    list: "/doctor/profile",
    meta: {
      label: "Profile",
      icon: <Stethoscope className="h-4 w-4" />,
      allowedRoles: ["doctor"],
    },
  },
];

export const adminResources: IResourceItem[] = [
  {
    name: "admin-dashboard",
    list: "/admin/dashboard",
    meta: {
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
  },
  {
    name: "patients",
    list: "/admin/patients",
    meta: {
      label: "Patients",
      icon: <UsersRound className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
  },
  {
    name: "doctors",
    list: "/admin/doctors",
    meta: {
      label: "Doctors",
      icon: <Stethoscope className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
  },
  {
    name: "facilities",
    list: "/admin/facilities",
    meta: {
      label: "Facilities",
      icon: <Building2 className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
  },
];

const hiddenDataResources: IResourceItem[] = [
  {
    name: "clinics",
    list: "/clinics",
    meta: { hide: true },
  },
  {
    name: "services",
    list: "/services",
    meta: { hide: true },
  },
  {
    name: "doctors",
    list: "/doctors",
    meta: { hide: true },
  },
  {
    name: "patients",
    list: "/patients",
    meta: { hide: true },
  },
  {
    name: "appointments",
    list: "/appointments",
    meta: { hide: true },
  },
];

export const publicResources: IResourceItem[] = [];

const uniqueResources = (resources: IResourceItem[]) => {
  const seen = new Set<string>();

  return resources.filter((resource) => {
    if (seen.has(resource.name)) {
      return false;
    }

    seen.add(resource.name);
    return true;
  });
};

export const getResourcesForRole = (role?: UserRole | null) => {
  if (role === "patient") {
    return uniqueResources([...patientResources, ...hiddenDataResources]);
  }

  if (role === "doctor") {
    return uniqueResources([...doctorResources, ...hiddenDataResources]);
  }

  if (role === "admin") {
    return uniqueResources([...adminResources, ...hiddenDataResources]);
  }

  return publicResources;
};
