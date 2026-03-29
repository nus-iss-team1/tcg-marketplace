import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "VAULT OF CARDS",
  description: "VAULT OF CARDS",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${bebasNeue.variable} antialiased bg-card`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV=${JSON.stringify({
              COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID ?? "",
              COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ?? "",
            })}`,
          }}
        />
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
          {process.env.IMAGE_TAG && (
            <div className="fixed bottom-1 right-2 z-50">
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {process.env.IMAGE_TAG}
              </span>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
