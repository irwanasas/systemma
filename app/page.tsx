import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { cityFromAddress } from "@/features/landing/city";
import { getSettings } from "@/features/settings/server/queries";
import { homePathFor } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/session";

const HomePage = async (): Promise<React.ReactNode> => {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));
  const settings = await getSettings();
  return (
    <LandingPage
      businessName={settings.invoice_header.name}
      city={cityFromAddress(settings.invoice_header.address)}
      dpPercent={settings.dp_percent}
      dpWindowHours={settings.dp_window_hours}
      etaDays={settings.eta_days_default}
    />
  );
};

export default HomePage;
