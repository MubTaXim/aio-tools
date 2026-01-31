"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ToolError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("Tool error:", error);
  }, [error]);

  return (
    <div className="container max-w-screen-md py-16">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          <CardDescription className="text-base">
            An error occurred while processing your request. This might be due to an unsupported file or a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="p-4 rounded-lg bg-muted font-mono text-sm overflow-auto max-h-32">
              {error.message}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
