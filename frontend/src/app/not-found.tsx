import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl sm:text-7xl font-heading">404</h1>
      <p className="text-xs text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
