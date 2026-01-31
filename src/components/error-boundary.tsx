"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable Error Boundary component for wrapping tool sections
 * Use this to catch errors in specific parts of a page
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button onClick={this.handleReset} variant="default" size="sm">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
