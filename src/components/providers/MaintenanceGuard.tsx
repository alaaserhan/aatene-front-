"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useGetGlobalSettings } from "@/src/features/(web)/settings/hooks";
import { MaintenancePage } from "../shared/MaintenancePage";

interface MaintenanceGuardProps {
  children: ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const pathname = usePathname();
  const { data: settingsData, isLoading } = useGetGlobalSettings();
  const settings = settingsData?.settings;

  // Always allow access to dashboard/admin routes so the site can be managed
  const isDashboard = pathname?.includes("/dashboard") || pathname?.includes("/admin");

  // If loading settings and we don't have data yet
  if (isLoading && !settings) {
    return <>{children}</>;
  }

  // If is_site_under_construction is truthy (e.g. true, 1, "1") and NOT in the dashboard
  if (settings && !!settings.is_site_under_construction && !isDashboard) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
