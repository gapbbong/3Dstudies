"use client";

import { useConfigSubscription } from "@/hooks/useConfig";

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  useConfigSubscription();
  return <>{children}</>;
}
