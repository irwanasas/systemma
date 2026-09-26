import { redirect } from "next/navigation";
import { AuthCard } from "@/components/layout/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { homePathFor } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/session";

const LoginPage = async (): Promise<React.ReactNode> => {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  return (
    <AuthCard>
      <main>
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary-strong uppercase">Aurora Hijab</p>
          <h1>Masuk</h1>
        </div>
        <LoginForm />
      </main>
    </AuthCard>
  );
};

export default LoginPage;
