import type { AuthProvider } from "@refinedev/core";
import type { User } from "@supabase/supabase-js";

import type { Profile, UserRole } from "@/features/shared/types/hospital";
import {
  defaultRole,
  getRoleHomePath,
  isUserRole,
} from "@/features/auth/utils/roles";
import { supabaseClient } from "./supabase";

type AuthParams = {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
};

const getProfile = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();

  if (error) {
    return null;
  }

  return data;
};

const ensureProfile = async (user: User, fallbackRole?: UserRole) => {
  const existingProfile = await getProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const metadataRole = user.user_metadata?.role;
  const role = isUserRole(metadataRole)
    ? metadataRole
    : fallbackRole || defaultRole;
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Hospital user";

  const { data, error } = await supabaseClient
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      role,
    })
    .select("*")
    .single<Profile>();

  if (error) {
    return {
      id: user.id,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } satisfies Profile;
  }

  return data;
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }: AuthParams) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data?.user) {
        const profile = await ensureProfile(data.user);

        return {
          success: true,
          redirectTo: getRoleHomePath(profile.role),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }

    return {
      success: false,
      error: {
        message: "Invalid email or password",
        name: "Login failed",
      },
    };
  },
  register: async ({
    email,
    password,
    fullName,
    role = defaultRole,
  }: AuthParams) => {
    try {
      const selectedRole = isUserRole(role) ? role : defaultRole;
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data?.user) {
        if (data.session) {
          const profile = await ensureProfile(data.user, selectedRole);

          return {
            success: true,
            redirectTo: getRoleHomePath(profile.role),
            successNotification: {
              message: "Account created",
              description: "Your portal is ready.",
            },
          };
        }

        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: "Account created",
            description:
              "Check your email if confirmation is enabled, then sign in.",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }

    return {
      success: false,
      error: {
        message: "Unable to create account",
        name: "Register failed",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
      logout: true,
    };
  },
  onError: async (error) => {
    if (error?.statusCode === 401 || error?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }

    return {};
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    if (!user) {
      return null;
    }

    const profile = await ensureProfile(user);

    return {
      id: user.id,
      name:
        profile.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "Hospital user",
      email: user.email,
      avatar: user.user_metadata?.avatar_url,
      role: profile.role,
    };
  },
  getPermissions: async () => {
    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    if (!user) {
      return null;
    }

    const profile = await ensureProfile(user);

    return profile.role;
  },
};
