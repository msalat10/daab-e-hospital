import { useState } from "react";
import { useGetIdentity, useList } from "@refinedev/core";

import {
  AUTH_DISABLED,
  DEV_PATIENT_STORAGE_KEY,
} from "@/config/auth";
import type { Patient } from "@/features/shared/types/hospital";

type AuthIdentity = {
  id: string;
  email?: string;
  name?: string;
};

export const useCurrentPatient = () => {
  const identityQuery = useGetIdentity<AuthIdentity>();
  const [devPatientId, setDevPatientIdState] = useState(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(DEV_PATIENT_STORAGE_KEY)
  );
  const userId = AUTH_DISABLED ? undefined : identityQuery.data?.id;

  const filters = AUTH_DISABLED
    ? devPatientId
      ? [{ field: "id", operator: "eq" as const, value: devPatientId }]
      : []
    : userId
    ? [{ field: "user_id", operator: "eq" as const, value: userId }]
    : [];

  const patientQuery = useList<Patient>({
    resource: "patients",
    pagination: { mode: "off" },
    filters,
    queryOptions: {
      enabled: AUTH_DISABLED ? Boolean(devPatientId) : Boolean(userId),
    },
  });

  const setDevPatientId = (patientId: string) => {
    window.localStorage.setItem(DEV_PATIENT_STORAGE_KEY, patientId);
    setDevPatientIdState(patientId);
  };

  return {
    identity: identityQuery.data,
    userId,
    devPatientId,
    setDevPatientId,
    patient: patientQuery.result.data[0],
    patientQuery,
    isLoading:
      (!AUTH_DISABLED && identityQuery.isLoading) || patientQuery.query.isLoading,
    refetch: patientQuery.query.refetch,
  };
};
