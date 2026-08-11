import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default function RecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
