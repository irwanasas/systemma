import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { requireUser } from "@/lib/auth/require-role";

const ChangePasswordPage = async (): Promise<React.ReactNode> => {
  const user = await requireUser();
  return (
    <main>
      <h1>Ganti password</h1>
      {user.mustChangePassword && <p>Demi keamanan, ganti password awal Anda sebelum melanjutkan.</p>}
      <ChangePasswordForm />
    </main>
  );
};

export default ChangePasswordPage;
