import { Loader2 } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="container max-w-screen-2xl py-12">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Loading AIO Tools...</p>
      </div>
    </div>
  );
}
