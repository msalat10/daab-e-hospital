import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { type HttpError, useCreate, useList, useUpdate } from "@refinedev/core";
import { Building2, Phone, Stethoscope, UserCheck } from "lucide-react";
import { Link } from "react-router";

import { useCurrentDoctor } from "../hooks/useCurrentDoctor";
import { AUTH_DISABLED } from "@/config/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Clinic, Doctor } from "@/features/shared/types/hospital";

export const DoctorProfilePage = () => {
  const {
    doctor,
    devDoctorId,
    setDevDoctorId,
    clearDevDoctorId,
    identity,
    userId,
    isLoading: doctorLoading,
    refetch,
  } = useCurrentDoctor();
  const [selectedDoctorId, setSelectedDoctorId] = useState(devDoctorId || "");
  const [formValues, setFormValues] = useState({
    full_name: "",
    title: "",
    specialty: "",
    phone: "",
    clinic_id: "",
  });

  const doctorsList = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    sorters: [{ field: "full_name", order: "asc" }],
  });
  const clinicsList = useList<Clinic>({
    resource: "clinics",
    pagination: { mode: "off" },
  });
  const updateDoctor = useUpdate<Doctor, HttpError, Partial<Doctor>>();
  const createDoctor = useCreate<Doctor, HttpError, Partial<Doctor>>();

  const clinicsById = useMemo(
    () => new Map(clinicsList.result.data.map((clinic) => [clinic.id, clinic])),
    [clinicsList.result.data]
  );

  const currentClinic = doctor?.clinic_id
    ? clinicsById.get(doctor.clinic_id)
    : undefined;

  const selectedDoctor = doctorsList.result.data.find(
    (item) => item.id === selectedDoctorId
  );

  const chooseDoctor = async () => {
    if (!selectedDoctorId) {
      return;
    }

    setDevDoctorId(selectedDoctorId);
    const nextDoctor = doctorsList.result.data.find(
      (item) => item.id === selectedDoctorId
    );
    setFormValues({
      full_name: nextDoctor?.full_name || "",
      title: nextDoctor?.title || "",
      specialty: nextDoctor?.specialty || "",
      phone: nextDoctor?.phone || "",
      clinic_id: nextDoctor?.clinic_id || "",
    });
    await refetch();
  };

  useEffect(() => {
    if (!doctor) {
      return;
    }

    setFormValues({
      full_name: doctor.full_name || "",
      title: doctor.title || "",
      specialty: doctor.specialty || "",
      phone: doctor.phone || "",
      clinic_id: doctor.clinic_id || "",
    });
  }, [doctor]);

  useEffect(() => {
    if (doctor || formValues.full_name) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      full_name: identity?.name || "",
    }));
  }, [doctor, formValues.full_name, identity?.name]);

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!doctor) {
      await createDoctor.mutateAsync({
        resource: "doctors",
        values: {
          user_id: userId || null,
          full_name: formValues.full_name,
          title: formValues.title || null,
          specialty: formValues.specialty || null,
          phone: formValues.phone || null,
          clinic_id: formValues.clinic_id || null,
          is_active: true,
        },
        successNotification: {
          type: "success",
          message: "Doctor profile created",
          description: "Your doctor account is now linked to this profile.",
        },
      });

      await refetch();
      return;
    }

    await updateDoctor.mutateAsync({
      resource: "doctors",
      id: doctor.id,
      values: {
        full_name: formValues.full_name,
        title: formValues.title || null,
        specialty: formValues.specialty || null,
        phone: formValues.phone || null,
        clinic_id: formValues.clinic_id || null,
        user_id: userId || doctor.user_id || null,
      },
      successNotification: {
        type: "success",
        message: "Doctor profile updated",
        description: "Your profile changes were saved.",
      },
    });

    await refetch();
  };

  return (
    <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
      <section className="mb-5 rounded-[18px] bg-white px-6 py-6 shadow-brand-card md:px-8">
        <p className="text-sm font-medium text-brand-muted">Doctor portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
          Doctor profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          {AUTH_DISABLED
            ? "Select the signed-in doctor profile for development, then review the clinic assignment used by the appointment queue."
            : "Review the doctor record linked to your account and set the clinic assignment used by the appointment queue."}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        {AUTH_DISABLED ? (
          <Card className="h-fit rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-xl text-brand-ink">
                Development doctor
              </CardTitle>
              <p className="text-sm leading-6 text-brand-muted">
                Auth is off for now, so choose a doctor record to act as the
                logged-in doctor.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="h-11 rounded-full border-brand-border">
                  <SelectValue placeholder="Choose doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctorsList.result.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDoctor ? (
                <div className="rounded-[14px] bg-brand-paper-soft p-4 text-sm leading-6 text-brand-muted">
                  {selectedDoctor.specialty || selectedDoctor.title || "Doctor"}{" "}
                  {selectedDoctor.clinic_id
                    ? `at ${
                        clinicsById.get(selectedDoctor.clinic_id)?.name ||
                        "assigned clinic"
                      }`
                    : "with no clinic assignment yet"}
                </div>
              ) : null}
              <div className="flex gap-3">
                <Button
                  type="button"
                  className="flex-1 rounded-full bg-brand hover:bg-brand-dark"
                  disabled={!selectedDoctorId}
                  onClick={chooseDoctor}
                >
                  Use this doctor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-brand-border"
                  onClick={() => {
                    clearDevDoctorId();
                    setSelectedDoctorId("");
                    setFormValues({
                      full_name: "",
                      title: "",
                      specialty: "",
                      phone: "",
                      clinic_id: "",
                    });
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardHeader>
              <CardTitle className="text-xl text-brand-ink">
                Linked account
              </CardTitle>
              <p className="text-sm leading-6 text-brand-muted">
                {doctor
                  ? "This doctor record is connected to your login."
                  : "Create your doctor record to unlock the dashboard and queue."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-[14px] bg-brand-paper-soft p-4 text-sm leading-6 text-brand-muted">
                Signed in as {identity?.email || identity?.name || "doctor user"}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-5">
          <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
            <CardContent className="p-6">
              {doctor ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <ProfileStat
                    icon={<UserCheck className="h-5 w-5" />}
                    label="Doctor"
                    value={doctor.full_name}
                  />
                  <ProfileStat
                    icon={<Stethoscope className="h-5 w-5" />}
                    label="Specialty"
                    value={doctor.specialty || doctor.title || "Not set"}
                  />
                  <ProfileStat
                    icon={<Building2 className="h-5 w-5" />}
                    label="Clinic"
                    value={
                      currentClinic
                        ? `${currentClinic.name}, ${currentClinic.camp}`
                        : "Not assigned"
                    }
                  />
                </div>
              ) : (
                <p className="text-sm leading-6 text-brand-muted">
                  Create your doctor profile to unlock the doctor dashboard and
                  appointment queue.
                </p>
              )}
            </CardContent>
          </Card>

          {doctor || !AUTH_DISABLED ? (
            <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
              <CardHeader>
                <CardTitle className="text-xl text-brand-ink">
                  Profile details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpdateProfile}>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      value={formValues.full_name}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          full_name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formValues.title}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={formValues.specialty}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          specialty: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formValues.phone}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clinic">Clinic</Label>
                    <Select
                      value={formValues.clinic_id || "none"}
                      onValueChange={(value) =>
                        setFormValues((current) => ({
                          ...current,
                          clinic_id: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger id="clinic" className="h-11 rounded-full border-brand-border">
                        <SelectValue placeholder="Choose clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No clinic assignment</SelectItem>
                        {clinicsList.result.data.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}, {clinic.camp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-between">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-brand-border"
                    >
                      <Link to="/doctor/dashboard">Open dashboard</Link>
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full bg-brand px-6 hover:bg-brand-dark"
                      disabled={
                        updateDoctor.mutation.isPending ||
                        createDoctor.mutation.isPending ||
                        !formValues.full_name
                      }
                    >
                      {doctor ? "Save profile" : "Create profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ProfileStat = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-[14px] bg-brand-paper-soft p-4">
    <div className="flex items-center gap-2 text-brand">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-[0.14em]">
        {label}
      </span>
    </div>
    <p className="mt-3 text-sm font-semibold text-brand-ink">{value}</p>
  </div>
);
