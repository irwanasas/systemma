import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { homePathFor } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/session";

const LoginPage = async (): Promise<React.ReactNode> => {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  return (
    <main>
      <h1>Masuk ke Aurora</h1>
      <LoginForm />
    </main>
  );
};

export default LoginPage;
