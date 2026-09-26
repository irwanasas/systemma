import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { homePathFor, requireUser } from "@/lib/auth/require-role";

const ChangePasswordPage = async (): Promise<React.ReactNode> => {
  const user = await requireUser();
  return (
    <AuthCard>
      <main>
        <h1>Ganti password</h1>
        {user.mustChangePassword ? (
          <p>Demi keamanan, ganti password awal Anda sebelum melanjutkan.</p>
        ) : (
          <p>
            <Link href={homePathFor(user.role)}>Kembali</Link>
          </p>
        )}
        <ChangePasswordForm />
      </main>
    </AuthCard>
  );
};

export default ChangePasswordPage;
