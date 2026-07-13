import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { hospitalResources } from "./app/resources";
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { DoctorsListPage } from "./features/doctor/pages/DoctorsListPage";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { ResourcePlaceholderPage } from "./features/shared/pages/ResourcePlaceholderPage";
import "./App.css";
import { dataProvider, liveProvider } from "./providers/data";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
            <Refine
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              dataProvider={dataProvider}
              liveProvider={liveProvider}
              resources={hospitalResources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "7yYQXp-Q8qzze-7XRW5k",
              }}
            >
              <Routes>
                <Route index element={<LandingPage />} />
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
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
                    <Route
                      index
                      element={<DoctorsListPage />}
                    />
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
