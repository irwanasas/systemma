import { redirect } from "next/navigation";
import { AuthCard } from "@/components/layout/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { homePathFor } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/session";

const LoginPage = async (): Promise<React.ReactNode> => {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  return (
    <AuthCard homeLink>
      <main>
        <div className="flex flex-col gap-1">
          <h1>Masuk</h1>
          <p className="text-ui text-muted-foreground">Gunakan username dan password dari admin Aurora.</p>
        </div>
        <LoginForm />
      </main>
    </AuthCard>
  );
};

export default LoginPage;
