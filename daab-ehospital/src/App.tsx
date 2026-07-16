import { Authenticated, CanAccess, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { getResourcesForRole } from "./app/resources";
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { AdminPlaceholderPage } from "./features/admin/pages/AdminPlaceholderPage";
import { RoleRedirect } from "./features/auth/components/RoleGate";
import { useAuthRole } from "./features/auth/hooks/useAuthRole";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { DoctorAppointmentDetailsPage } from "./features/doctor/pages/DoctorAppointmentDetailsPage";
import { DoctorAppointmentsPage } from "./features/doctor/pages/DoctorAppointmentsPage";
import { DoctorDashboardPage } from "./features/doctor/pages/DoctorDashboardPage";
import { DoctorProfilePage } from "./features/doctor/pages/DoctorProfilePage";
import { DoctorsListPage } from "./features/doctor/pages/DoctorsListPage";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { PatientAppointmentDetailsPage } from "./features/patient/pages/PatientAppointmentDetailsPage";
import { PatientAppointmentsPage } from "./features/patient/pages/PatientAppointmentsPage";
import { PatientBookAppointmentPage } from "./features/patient/pages/PatientBookAppointmentPage";
import { PatientCarePage } from "./features/patient/pages/PatientCarePage";
import { PatientDashboardPage } from "./features/patient/pages/PatientDashboardPage";
import { PatientNotificationsPage } from "./features/patient/pages/PatientNotificationsPage";
import { PatientProfilePage } from "./features/patient/pages/PatientProfilePage";
import { PatientReferenceLookupPage } from "./features/patient/pages/PatientReferenceLookupPage";
import { ResourcePlaceholderPage } from "./features/shared/pages/ResourcePlaceholderPage";
import "./App.css";
import { AUTH_DISABLED } from "./config/auth";
import { accessControlProvider } from "./providers/access-control";
import { authProvider } from "./providers/auth";
import { dataProvider, liveProvider } from "./providers/data";

function App() {
  const { role } = useAuthRole();

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
            <Refine
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              dataProvider={dataProvider}
              liveProvider={liveProvider}
              resources={getResourcesForRole(role)}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "7yYQXp-Q8qzze-7XRW5k",
              }}
            >
              <Routes>
                <Route index element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  element={
                    AUTH_DISABLED ? (
                      <Layout>
                        <Outlet />
                      </Layout>
                    ) : (
                      <Authenticated key="protected-routes" redirectOnFail="/login">
                        <Layout>
                          <Outlet />
                        </Layout>
                      </Authenticated>
                    )
                  }
                >
                  <Route path="/app" element={<RoleRedirect />} />
                  <Route path="/patient">
                    <Route
                      element={
                        <CanAccess
                          resource="patient-dashboard"
                          action="list"
                          fallback={<RoleRedirect />}
                        >
                          <Outlet />
                        </CanAccess>
                      }
                    >
                      <Route index element={<PatientDashboardPage />} />
                      <Route path="dashboard" element={<PatientDashboardPage />} />
                      <Route path="book" element={<PatientBookAppointmentPage />} />
                      <Route
                        path="appointments"
                        element={<PatientAppointmentsPage />}
                      />
                      <Route
                        path="appointments/:id"
                        element={<PatientAppointmentDetailsPage />}
                      />
                      <Route path="care" element={<PatientCarePage />} />
                      <Route
                        path="reference"
                        element={<PatientReferenceLookupPage />}
                      />
                      <Route
                        path="notifications"
                        element={<PatientNotificationsPage />}
                      />
                      <Route path="profile" element={<PatientProfilePage />} />
                    </Route>
                  </Route>
                  <Route path="/doctor">
                    <Route
                      element={
                        <CanAccess
                          resource="doctor-dashboard"
                          action="list"
                          fallback={<RoleRedirect />}
                        >
                          <Outlet />
                        </CanAccess>
                      }
                    >
                      <Route index element={<DoctorDashboardPage />} />
                      <Route path="dashboard" element={<DoctorDashboardPage />} />
                      <Route
                        path="appointments"
                        element={<DoctorAppointmentsPage />}
                      />
                      <Route
                        path="appointments/:id"
                        element={<DoctorAppointmentDetailsPage />}
                      />
                      <Route path="profile" element={<DoctorProfilePage />} />
                    </Route>
                  </Route>
                  <Route path="/admin">
                    <Route
                      element={
                        <CanAccess
                          resource="admin-dashboard"
                          action="list"
                          fallback={<RoleRedirect />}
                        >
                          <Outlet />
                        </CanAccess>
                      }
                    >
                      <Route index element={<AdminPlaceholderPage />} />
                      <Route path="dashboard" element={<AdminPlaceholderPage />} />
                    </Route>
                  </Route>
                  <Route
                    element={
                      <CanAccess
                        resource="admin-dashboard"
                        action="list"
                        fallback={<RoleRedirect />}
                      >
                        <Outlet />
                      </CanAccess>
                    }
                  >
                    <Route path="/patients">
                      <Route
                        index
                        element={<ResourcePlaceholderPage resource="patients" />}
                      />
                      <Route
                        path="create"
                        element={
                          <ResourcePlaceholderPage
                            resource="patients"
                            mode="create"
                          />
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="patients"
                            mode="edit"
                          />
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="patients"
                            mode="show"
                          />
                        }
                      />
                    </Route>
                    <Route path="/appointments">
                      <Route
                        index
                        element={
                          <ResourcePlaceholderPage resource="appointments" />
                        }
                      />
                      <Route
                        path="create"
                        element={
                          <ResourcePlaceholderPage
                            resource="appointments"
                            mode="create"
                          />
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="appointments"
                            mode="edit"
                          />
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="appointments"
                            mode="show"
                          />
                        }
                      />
                    </Route>
                    <Route path="/clinics">
                      <Route
                        index
                        element={<ResourcePlaceholderPage resource="clinics" />}
                      />
                      <Route
                        path="create"
                        element={
                          <ResourcePlaceholderPage
                            resource="clinics"
                            mode="create"
                          />
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="clinics"
                            mode="edit"
                          />
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="clinics"
                            mode="show"
                          />
                        }
                      />
                    </Route>
                    <Route path="/services">
                      <Route
                        index
                        element={<ResourcePlaceholderPage resource="services" />}
                      />
                      <Route
                        path="create"
                        element={
                          <ResourcePlaceholderPage
                            resource="services"
                            mode="create"
                          />
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="services"
                            mode="edit"
                          />
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="services"
                            mode="show"
                          />
                        }
                      />
                    </Route>
                    <Route path="/doctors">
                      <Route index element={<DoctorsListPage />} />
                      <Route
                        path="create"
                        element={
                          <ResourcePlaceholderPage
                            resource="doctors"
                            mode="create"
                          />
                        }
                      />
                      <Route
                        path="edit/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="doctors"
                            mode="edit"
                          />
                        }
                      />
                      <Route
                        path="show/:id"
                        element={
                          <ResourcePlaceholderPage
                            resource="doctors"
                            mode="show"
                          />
                        }
                      />
                    </Route>
                  </Route>
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
