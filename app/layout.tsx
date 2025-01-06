import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: 'Reminder App - Manage your reminders',
  description:
    'A simple reminder app to help you manage your reminders.',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Toaster position="top-right" />
      <Analytics />
    </html>
  );
}
