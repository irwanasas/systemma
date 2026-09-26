import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type CurrentUser = {
  id: string;
  username: string;
  role: AppRole;
  fullName: string;
  mustChangePassword: boolean;
  sessionId: string;
};

export type FormState = {
  error?: string;
  message?: string;
};
