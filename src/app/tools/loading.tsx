import { Loader2 } from "lucide-react";

export default function ToolLoading() {
  return (
    <div className="container max-w-screen-lg py-16">
      <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading tool...</p>
      </div>
    </div>
  );
}
