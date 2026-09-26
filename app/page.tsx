import { redirect } from "next/navigation";
import { homePathFor } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/session";

const HomePage = async (): Promise<never> => {
  const user = await getCurrentUser();
  redirect(user ? homePathFor(user.role) : "/login");
};

export default HomePage;
