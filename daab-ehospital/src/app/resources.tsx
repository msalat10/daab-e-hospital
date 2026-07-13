import {
  Building2,
  CalendarCheck,
  ClipboardList,
  Stethoscope,
  UsersRound,
} from "lucide-react";

export const hospitalResources = [
  {
    name: "patients",
    list: "/patients",
    create: "/patients/create",
    edit: "/patients/edit/:id",
    show: "/patients/show/:id",
    meta: {
      label: "Patients",
      icon: <UsersRound className="h-4 w-4" />,
      canDelete: true,
    },
  },
  {
    name: "appointments",
    list: "/appointments",
    create: "/appointments/create",
    edit: "/appointments/edit/:id",
    show: "/appointments/show/:id",
    meta: {
      label: "Appointments",
      icon: <CalendarCheck className="h-4 w-4" />,
      canDelete: true,
    },
  },
  {
    name: "clinics",
    list: "/clinics",
    create: "/clinics/create",
    edit: "/clinics/edit/:id",
    show: "/clinics/show/:id",
    meta: {
      label: "Clinics",
      icon: <Building2 className="h-4 w-4" />,
      canDelete: true,
    },
  },
  {
    name: "services",
    list: "/services",
    create: "/services/create",
    edit: "/services/edit/:id",
    show: "/services/show/:id",
    meta: {
      label: "Services",
      icon: <ClipboardList className="h-4 w-4" />,
      canDelete: true,
    },
  },
  {
    name: "doctors",
    list: "/doctors",
    create: "/doctors/create",
    edit: "/doctors/edit/:id",
    show: "/doctors/show/:id",
    meta: {
      label: "Doctors",
      icon: <Stethoscope className="h-4 w-4" />,
      canDelete: true,
    },
  },
];
