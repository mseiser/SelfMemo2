'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider><SessionProvider>{children}</SessionProvider ></TooltipProvider>;
}
