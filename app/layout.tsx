import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces/opsz.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Aurora",
  description: "Sistem pemesanan pre-order Aurora Hijab",
};

const RootLayout = ({ children }: LayoutProps<"/">): React.ReactNode => (
  <html lang="id" suppressHydrationWarning>
    <body>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
