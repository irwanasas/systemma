import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { AppRole, CurrentUser } from "@/features/auth/types";

export const homePathFor = (role: AppRole): string => (role === "admin" ? "/dashboard" : "/catalog");

export const requireUser = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
};

export const requireRole = async (role: AppRole): Promise<CurrentUser> => {
  const user = await requireUser();
  if (user.mustChangePassword) redirect("/change-password");
  if (user.role !== role) redirect(homePathFor(user.role));
  return user;
};
