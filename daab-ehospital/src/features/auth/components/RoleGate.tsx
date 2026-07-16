import { usePermissions } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";

import type { UserRole } from "@/features/shared/types/hospital";
import { getRoleHomePath } from "../utils/roles";

export const RoleRedirect = () => {
  const permissions = usePermissions<UserRole>({});

  if (permissions.isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-brand-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Opening your portal...
      </div>
    );
  }

  return <Navigate to={getRoleHomePath(permissions.data)} replace />;
};
