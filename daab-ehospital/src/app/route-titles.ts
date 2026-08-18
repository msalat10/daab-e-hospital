const routeTitles: Array<[RegExp, string]> = [
  [/^\/$/, "Daryeel"],
  [/^\/login\/?$/, "Sign in"],
  [/^\/signup\/?$/, "Create account"],
  [/^\/forgot-password\/?$/, "Reset password"],
  [/^\/update-password\/?$/, "Update password"],
  [/^\/app\/?$/, "Daryeel"],
  [/^\/patient\/?$/, "My care workspace"],
  [/^\/patient\/dashboard\/?$/, "My care workspace"],
  [/^\/patient\/appointments\/[^/]+\/?$/, "Appointment details"],
  [/^\/patient\/appointments\/?$/, "My appointments"],
  [/^\/patient\/book\/?$/, "Book an appointment"],
  [/^\/patient\/care\/?$/, "Find care"],
  [/^\/patient\/notifications\/?$/, "Appointment updates"],
  [/^\/patient\/profile\/?$/, "My profile"],
  [/^\/doctor\/?$/, "Today's clinical work"],
  [/^\/doctor\/dashboard\/?$/, "Today's clinical work"],
  [/^\/doctor\/appointments\/[^/]+\/?$/, "Consultation"],
  [/^\/doctor\/appointments\/?$/, "Appointment queue"],
  [/^\/doctor\/profile\/?$/, "Doctor profile"],
  [/^\/doctors\/?$/, "Doctors"],
  [/^\/admin\/?$/, "Admin overview"],
  [/^\/admin\/dashboard\/?$/, "Admin overview"],
  [/^\/admin\/patients\/?$/, "Patients"],
  [/^\/admin\/doctors\/?$/, "Doctors"],
  [/^\/admin\/facilities\/?$/, "Facilities"],
  [/^\/patients\/?$/, "Patients"],
  [/^\/appointments\/?$/, "Appointments"],
  [/^\/clinics\/?$/, "Clinics"],
  [/^\/services\/?$/, "Services"],
];

export const getRouteTitle = (pathname?: string) => {
  const match = routeTitles.find(([pattern]) => pattern.test(pathname ?? ""));

  return match?.[1] ?? "Dashboard";
};

export const getDocumentTitle = (pathname?: string) => {
  const title = getRouteTitle(pathname);

  return title === "Daryeel" ? "Daryeel" : `${title} | Daryeel`;
};
