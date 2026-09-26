import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Aurora",
  description: "Sistem pemesanan pre-order Aurora Hijab",
};

const RootLayout = ({ children }: LayoutProps<"/">): React.ReactNode => (
  <html lang="id">
    <body>
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
