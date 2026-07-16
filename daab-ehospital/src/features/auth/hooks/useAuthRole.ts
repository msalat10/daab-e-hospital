import { useEffect, useState } from "react";

import type { UserRole } from "@/features/shared/types/hospital";
import { supabaseClient } from "@/providers/supabase";
import { defaultRole, isUserRole } from "../utils/roles";

export const useAuthRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      const { data } = await supabaseClient.auth.getUser();
      const user = data.user;

      if (!isMounted) {
        return;
      }

      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: UserRole }>();

      const metadataRole = user.user_metadata?.role;
      const nextRole = isUserRole(profile?.role)
        ? profile.role
        : isUserRole(metadataRole)
        ? metadataRole
        : defaultRole;

      setRole(nextRole);
      setIsLoading(false);
    };

    void loadRole();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(() => {
      setIsLoading(true);
      void loadRole();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { role, isLoading };
};
