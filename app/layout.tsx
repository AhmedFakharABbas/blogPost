import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// import {
//   ClerkProvider,
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   SignedOut,
//   UserButton,
// } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "My Next App",
  description: "Practice with separate layouts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'> 
      <body className="min-h-screen bg-background">

        {children}
        <Toaster />
      </body>
    </html>
  );
}