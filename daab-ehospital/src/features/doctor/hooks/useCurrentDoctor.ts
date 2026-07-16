import { useState } from "react";
import { useGetIdentity, useList } from "@refinedev/core";

import { AUTH_DISABLED, DEV_DOCTOR_STORAGE_KEY } from "@/config/auth";
import type { Doctor } from "@/features/shared/types/hospital";

type AuthIdentity = {
  id: string;
  email?: string;
  name?: string;
};

export const useCurrentDoctor = () => {
  const identityQuery = useGetIdentity<AuthIdentity>();
  const [devDoctorId, setDevDoctorIdState] = useState(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(DEV_DOCTOR_STORAGE_KEY)
  );
  const userId = AUTH_DISABLED ? undefined : identityQuery.data?.id;

  const filters = AUTH_DISABLED
    ? devDoctorId
      ? [{ field: "id", operator: "eq" as const, value: devDoctorId }]
      : []
    : userId
    ? [{ field: "user_id", operator: "eq" as const, value: userId }]
    : [];

  const doctorQuery = useList<Doctor>({
    resource: "doctors",
    pagination: { mode: "off" },
    filters,
    queryOptions: {
      enabled: AUTH_DISABLED ? Boolean(devDoctorId) : Boolean(userId),
    },
  });

  const setDevDoctorId = (doctorId: string) => {
    window.localStorage.setItem(DEV_DOCTOR_STORAGE_KEY, doctorId);
    setDevDoctorIdState(doctorId);
  };

  const clearDevDoctorId = () => {
    window.localStorage.removeItem(DEV_DOCTOR_STORAGE_KEY);
    setDevDoctorIdState(null);
  };

  return {
    identity: identityQuery.data,
    userId,
    devDoctorId,
    setDevDoctorId,
    clearDevDoctorId,
    doctor: doctorQuery.result.data[0],
    doctorQuery,
    isLoading:
      (!AUTH_DISABLED && identityQuery.isLoading) || doctorQuery.query.isLoading,
    refetch: doctorQuery.query.refetch,
  };
};
