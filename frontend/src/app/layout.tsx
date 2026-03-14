import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
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
      <body className={`${inter.variable} ${bebasNeue.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          {process.env.NEXT_PUBLIC_IMAGE_TAG && (
            <div className="fixed bottom-1 right-2 z-50">
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {process.env.NEXT_PUBLIC_IMAGE_TAG}
              </span>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
