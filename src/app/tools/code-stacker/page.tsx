"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Code, Loader2, Download, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DropZone } from "@/components/drop-zone";
import { formatFileSize } from "@/lib/format";
import { processZipFile, type StackerProgress, type StackerResult } from "@/lib/tools/code-stacker";
import { getToolById } from "@/lib/tools/registry";

type ProcessingState = "idle" | "processing" | "complete" | "error";

export default function CodeStackerPage() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState<StackerProgress | null>(null);
  const [result, setResult] = useState<StackerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handlers
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setState("idle");
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setState("idle");
    setProgress(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setState("processing");
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const stackerResult = await processZipFile(file, setProgress);
      setResult(stackerResult);
      setState("complete");
    } catch (err) {
      console.error("Processing failed:", err);
      setError(err instanceof Error ? err.message : "Processing failed. Please try again.");
      setState("error");
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!result) return;

    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [result]);

  // Progress calculation
  const progressPercent = progress
    ? progress.phase === "complete"
      ? 100
      : Math.round((progress.processedFiles / Math.max(progress.totalFiles, 1)) * 100)
    : 0;

  return (
    <div className="container max-w-screen-lg py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Code className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Code Stacker</h1>
            <p className="text-sm text-muted-foreground">
              Combine multiple code files into a single formatted document
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload ZIP</CardTitle>
              <CardDescription>
                Upload a .zip archive of your project. All code files will be combined into one text file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DropZone
                accept=".zip,application/zip"
                maxSize={169 * 1024 * 1024}
                onFileSelect={handleFileSelect}
                selectedFile={file}
                onClear={handleClear}
                disabled={state === "processing"}
              />
            </CardContent>
          </Card>

          {/* Progress */}
          {state === "processing" && progress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressPercent} className="h-2" />
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {state === "complete" && result && (
            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-500">Stack Complete!</CardTitle>
                <CardDescription>
                  {result.processedCount} file(s) processed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{result.processedCount}</p>
                    <p className="text-sm text-muted-foreground">Files</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatFileSize(result.output.length)}</p>
                    <p className="text-sm text-muted-foreground">Output Size</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{result.skippedCount}</p>
                    <p className="text-sm text-muted-foreground">Skipped</p>
                  </div>
                </div>

                {/* Skipped files details */}
                {result.skippedCount > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View {result.skippedCount} skipped files
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-lg max-h-40 overflow-y-auto">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {result.skippedFiles.slice(0, 50).map((file, i) => (
                          <li key={i}>• {file}</li>
                        ))}
                        {result.skippedFiles.length > 50 && (
                          <li>... and {result.skippedFiles.length - 50} more</li>
                        )}
                      </ul>
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download {result.filename}
                  </Button>
                  <Button variant="outline" onClick={handleCopy} className="flex-1">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {state === "error" && error && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Process Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleProcess}
                disabled={!file || state === "processing"}
                size="lg"
                className="w-full"
              >
                {state === "processing" ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Code className="h-5 w-5 mr-2" />
                    Create Stack
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Cards - Horizontal Layout */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Credits Card */}
        {(() => {
          const tool = getToolById("code-stacker");
          const credits = tool?.credits;
          if (!credits) return null;
          
          return (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Credits</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="flex justify-between">
                  <span>Author</span>
                  {credits.repoUrl ? (
                    <a 
                      href={credits.repoUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline inline-flex items-center gap-1"
                    >
                      {credits.author}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-medium text-foreground">{credits.author}</span>
                  )}
                </div>
                {credits.license && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span>License</span>
                      <span className="font-medium text-foreground">{credits.license}</span>
                    </div>
                  </>
                )}
                {credits.libraries && credits.libraries.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <span>Libraries Used</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {credits.libraries.map((lib) => (
                          <a 
                            key={lib.name}
                            href={lib.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                          >
                            {lib.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* How It Works Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Upload a ZIP archive of your project. CodeStacker extracts all text-based
              files and consolidates them into a single formatted document.
            </p>
            <p>
              <strong>Perfect for LLMs:</strong> Share your entire codebase context
              with AI assistants in one file.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
