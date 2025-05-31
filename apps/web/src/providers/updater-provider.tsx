'use client';

import { useUpdater } from '@/hooks/use-updater';

export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  useUpdater();
  return <>{children}</>;
}