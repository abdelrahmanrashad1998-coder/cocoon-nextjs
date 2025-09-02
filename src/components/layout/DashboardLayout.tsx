import { ReactNode } from "react";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    email?: string | null;
    displayName?: string | null;
  };
  onLogout?: () => void;
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
