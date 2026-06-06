import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find that asset or page. Try searching from the top bar.
      </p>
      <Button asChild className="mt-5">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
