import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora",
  description: "Sistem pemesanan pre-order Aurora Hijab",
};

const RootLayout = ({ children }: LayoutProps<"/">): React.ReactNode => (
  <html lang="id">
    <body>{children}</body>
  </html>
);

export default RootLayout;
