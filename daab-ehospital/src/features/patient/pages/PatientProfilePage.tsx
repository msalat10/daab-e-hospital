import { useEffect } from "react";
import { type HttpError, useCreate, useUpdate } from "@refinedev/core";
import { useForm } from "react-hook-form";

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
import { AUTH_DISABLED } from "@/config/auth";
import { CAMPS, GENDERS } from "@/features/shared/constants/hospital";
import type {
  CampName,
  Gender,
  Patient,
} from "@/features/shared/types/hospital";
import { useCurrentPatient } from "../hooks/useCurrentPatient";

type PatientProfileFormValues = {
  full_name: string;
  refugee_id?: string;
  phone?: string;
  gender?: Gender;
  date_of_birth?: string;
  camp?: CampName;
  notes?: string;
};

export const PatientProfilePage = () => {
  const {
    patient,
    userId,
    identity,
    isLoading,
    refetch,
    setDevPatientId,
  } = useCurrentPatient();

  const form = useForm<PatientProfileFormValues>({
    defaultValues: {
      full_name: "",
      refugee_id: "",
      phone: "",
      date_of_birth: "",
      notes: "",
    },
  });

  const createPatient = useCreate<Patient, HttpError, Partial<Patient>>();
  const updatePatient = useUpdate<Patient, HttpError, Partial<Patient>>();

  useEffect(() => {
    if (patient) {
      form.reset({
        full_name: patient.full_name || "",
        refugee_id: patient.refugee_id || "",
        phone: patient.phone || "",
        gender: patient.gender || undefined,
        date_of_birth: patient.date_of_birth || "",
        camp: patient.camp || undefined,
        notes: patient.notes || "",
      });
    } else if (identity?.name || identity?.email) {
      form.setValue("full_name", identity.name || identity.email || "");
    }
  }, [form, identity, patient]);

  const isSaving =
    createPatient.mutation.isPending || updatePatient.mutation.isPending;

  const onSubmit = async (values: PatientProfileFormValues) => {
    if (!AUTH_DISABLED && !userId) {
      return;
    }

    const payload: Partial<Patient> = {
      user_id: AUTH_DISABLED ? null : userId,
      full_name: values.full_name.trim(),
      refugee_id: values.refugee_id?.trim() || null,
      phone: values.phone?.trim() || null,
      gender: values.gender || null,
      date_of_birth: values.date_of_birth || null,
      camp: values.camp || null,
      notes: values.notes?.trim() || null,
    };

    if (patient?.id) {
      await updatePatient.mutateAsync({
        resource: "patients",
        id: patient.id,
        values: payload,
        successNotification: {
          type: "success",
          message: "Profile updated",
          description: "Your patient profile has been saved.",
        },
      });
    } else {
      const createResponse = await createPatient.mutateAsync({
        resource: "patients",
        values: payload,
        successNotification: {
          type: "success",
          message: "Profile created",
          description: "Your patient profile is ready.",
        },
      });

      if (AUTH_DISABLED) {
        setDevPatientId(createResponse.data.id);
      }
    }

    refetch();
  };

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] border-0 bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Patient portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
          My profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Keep your contact and camp details accurate so clinic staff can manage
          your appointment requests.
        </p>
      </section>

      <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
        <CardHeader className="border-b border-brand-border/70">
          <CardTitle className="text-xl text-brand-ink">
            Patient information
          </CardTitle>
          <p className="text-sm text-brand-muted">
            {patient
              ? "Update your existing patient profile."
              : "Complete this once before booking appointments."}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-brand-muted">Loading profile...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Asha Mohamed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="refugee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refugee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="+254..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDERS.map((gender) => (
                              <SelectItem
                                key={gender.value}
                                value={gender.value}
                              >
                                {gender.label}
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
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="camp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Camp</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select camp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CAMPS.map((camp) => (
                              <SelectItem key={camp} value={camp}>
                                {camp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional details clinic staff should know"
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
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : patient ? "Update profile" : "Create profile"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
