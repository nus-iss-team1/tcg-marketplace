import { AppHeader } from "@/components/app-header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col max-w-640 mx-auto bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="flex flex-1 flex-col w-full max-w-480 mx-auto px-4 min-h-0">
          {children}
        </div>
      </main>
      <footer className="py-4 px-4">
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 TCG Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
