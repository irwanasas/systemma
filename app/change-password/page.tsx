import { AuthCard } from "@/components/layout/auth-card";
import { BackLink } from "@/components/ui/back-link";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { homePathFor, requireUser } from "@/lib/auth/require-role";

const ChangePasswordPage = async (): Promise<React.ReactNode> => {
  const user = await requireUser();
  return (
    <AuthCard>
      <main>
        <h1>Ganti password</h1>
        {user.mustChangePassword ? (
          <p className="text-ui text-muted-foreground">Demi keamanan, ganti password awal Anda sebelum melanjutkan.</p>
        ) : (
          <BackLink href={homePathFor(user.role)} label="Kembali" />
        )}
        <ChangePasswordForm />
      </main>
    </AuthCard>
  );
};

export default ChangePasswordPage;
