import { useMemo, useState } from "react";
import { type HttpError, useCreate, useList } from "@refinedev/core";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  Appointment,
  Clinic,
  Doctor,
  Service,
} from "@/features/shared/types/hospital";
import { generateReferenceCode } from "@/features/shared/utils/appointments";
import { useCurrentPatient } from "../hooks/useCurrentPatient";

type AppointmentFormValues = {
  clinic_id: string;
  service_id?: string;
  doctor_id?: string;
  requested_date: string;
  requested_time?: string;
  reason?: string;
};

const today = new Date().toISOString().slice(0, 10);

export const PatientBookAppointmentPage = () => {
  const { patient, isLoading: patientLoading } = useCurrentPatient();
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const form = useForm<AppointmentFormValues>({
    defaultValues: {
      clinic_id: "",
      service_id: "",
      doctor_id: "",
      requested_date: today,
      requested_time: "",
      reason: "",
    },
  });

  const selectedClinicId = form.watch("clinic_id");

  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "name", order: "asc" }],
  });

  const servicesList = useList<Service>({
    resource: "services",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "name", order: "asc" }],
  });

  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "full_name", order: "asc" }],
  });

  const createAppointment = useCreate<
    Appointment,
    HttpError,
    Partial<Appointment>
  >();

  const clinics = clinicsList.result.data;
  const services = servicesList.result.data;
  const doctors = doctorsList.result.data;

  const filteredServices = useMemo(
    () =>
      selectedClinicId
        ? services.filter(
            (service) =>
              !service.clinic_id || service.clinic_id === selectedClinicId
          )
        : services,
    [selectedClinicId, services]
  );

  const filteredDoctors = useMemo(
    () =>
      selectedClinicId
        ? doctors.filter((doctor) => doctor.clinic_id === selectedClinicId)
        : doctors,
    [selectedClinicId, doctors]
  );

  const lookupLoading =
    clinicsList.query.isLoading ||
    servicesList.query.isLoading ||
    doctorsList.query.isLoading;
  const isSubmitting = createAppointment.mutation.isPending;

  const onSubmit = async (values: AppointmentFormValues) => {
    if (!patient) {
      return;
    }

    const reference = generateReferenceCode();

    await createAppointment.mutateAsync({
      resource: "appointments",
      values: {
        reference_code: reference,
        patient_id: patient.id,
        clinic_id: values.clinic_id,
        service_id: values.service_id || null,
        doctor_id: values.doctor_id || null,
        requested_date: values.requested_date,
        requested_time: values.requested_time || null,
        reason: values.reason?.trim() || null,
        status: "pending",
      },
      successNotification: {
        type: "success",
        message: "Appointment requested",
        description: "Your request has been sent to the clinic.",
      },
    });

    setReferenceCode(reference);
    form.reset({
      clinic_id: "",
      service_id: "",
      doctor_id: "",
      requested_date: today,
      requested_time: "",
      reason: "",
    });
  };

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] border-0 bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">
          Appointment request
        </p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-brand-ink">
              Book an appointment
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              Choose a clinic service and send a visit request before arriving.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full">
            <Link to="/patient/appointments">My appointments</Link>
          </Button>
        </div>
      </section>

      {!patientLoading && !patient && (
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-brand-ink">
              Complete your profile first
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              We need your patient profile before an appointment can be linked
              to your account.
            </p>
            <Button
              asChild
              className="mt-5 rounded-[4px] bg-brand hover:bg-brand-dark"
            >
              <Link to="/patient/profile">Go to profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {patient && (
        <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
          <CardHeader className="border-b border-brand-border/70">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-brand-ink">
                  Visit details
                </CardTitle>
                <p className="mt-1 text-sm text-brand-muted">
                  Appointment requests start as pending until the clinic reviews
                  them.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {referenceCode && (
              <Alert className="mb-6 border-brand-border bg-brand-mint text-brand-ink">
                <CheckCircle2 className="h-4 w-4 text-brand" />
                <AlertTitle>Request submitted</AlertTitle>
                <AlertDescription>
                  Your reference code is{" "}
                  <span className="font-semibold">{referenceCode}</span>.
                </AlertDescription>
              </Alert>
            )}

            {lookupLoading && (
              <div className="mb-6 flex items-center gap-2 rounded-[8px] bg-brand-paper-soft px-4 py-3 text-sm text-brand-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clinic options...
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="clinic_id"
                    rules={{ required: "Clinic is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("service_id", "");
                            form.setValue("doctor_id", "");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a clinic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clinics.map((clinic) => (
                              <SelectItem key={clinic.id} value={clinic.id}>
                                {clinic.name} · {clinic.camp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred doctor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requested_date"
                    rules={{ required: "Requested date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested date</FormLabel>
                        <FormControl>
                          <Input min={today} type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requested_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for visit</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe why you need care"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="rounded-[4px] bg-brand hover:bg-brand-dark"
                  disabled={isSubmitting || lookupLoading}
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
