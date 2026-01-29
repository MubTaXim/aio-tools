"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Settings2, FileArchive, Loader2, Target, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropZone } from "@/components/drop-zone";
import { formatFileSize, formatDuration, calculateCompression, formatPercentage } from "@/lib/format";
import {
  compressPDF,
  DEFAULT_SETTINGS,
  type CompressionSettings,
  type CompressionProgress,
  type CompressionResult,
} from "@/lib/tools/pdf-compressor";
import { getToolById } from "@/lib/tools/registry";

type ProcessingState = "idle" | "processing" | "complete" | "error";
type CompressionMode = "quality" | "target";

// DPI options for slider
const DPI_VALUES = [72, 96, 144, 150, 200, 300];
const DPI_LABELS: Record<number, string> = {
  72: "72 (Screen)",
  96: "96 (Web)",
  144: "144 (Recommended)",
  150: "150 (Print)",
  200: "200 (High)",
  300: "300 (Maximum)",
};

export default function PDFCompressorPage() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [targetSize, setTargetSize] = useState<number>(50); // Default 50 MB
  const [dpiIndex, setDpiIndex] = useState<number>(2); // Index 2 = 144 DPI
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const currentDpi = DPI_VALUES[dpiIndex];

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

  const handleDpiChange = useCallback(([index]: number[]) => {
    setDpiIndex(index);
    setSettings((s) => ({ ...s, dpi: DPI_VALUES[index] }));
  }, []);

  const handleTargetSizeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setTargetSize(Math.max(1, Math.min(500, value))); // Clamp between 1-500 MB
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setState("processing");
    setError(null);
    setResult(null);

    try {
      const compressionSettings: CompressionSettings = {
        ...settings,
        dpi: currentDpi,
        targetSizeMB: mode === "target" ? targetSize : undefined,
      };
      const compressionResult = await compressPDF(file, compressionSettings, setProgress);
      setResult(compressionResult);
      setState("complete");
    } catch (err) {
      console.error("Compression failed:", err);
      setError(err instanceof Error ? err.message : "Compression failed. Please try again.");
      setState("error");
    }
  }, [file, settings, mode, targetSize, currentDpi]);

  const handleDownload = useCallback(() => {
    if (!result || !file) return;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, "_compressed.pdf");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, file]);

  const progressPercent = progress
    ? progress.stage === "optimizing"
      ? 100
      : Math.round((progress.currentPage / Math.max(progress.totalPages, 1)) * 100)
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
            <FileArchive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PDF Compressor</h1>
            <p className="text-sm text-muted-foreground">
              Compress PDFs by re-rasterizing pages as optimized images
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
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>
                Select a PDF file to compress. All processing happens locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DropZone
                accept=".pdf,application/pdf"
                maxSize={500 * 1024 * 1024}
                onFileSelect={handleFileSelect}
                selectedFile={file}
                onClear={handleClear}
                disabled={state === "processing"}
              />
            </CardContent>
          </Card>

          {/* Progress / Results */}
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

          {state === "complete" && result && (
            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-500">Compression Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatFileSize(result.originalSize)}</p>
                    <p className="text-sm text-muted-foreground">Original</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatFileSize(result.compressedSize)}</p>
                    <p className="text-sm text-muted-foreground">Compressed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <p className="text-2xl font-bold text-green-500">
                      -{formatPercentage(calculateCompression(result.originalSize, result.compressedSize).savingsPercent)}
                    </p>
                    <p className="text-sm text-muted-foreground">Saved</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{result.pageCount} pages processed</span>
                  <span>Completed in {formatDuration(result.duration)}</span>
                </div>

                {result.finalQuality !== undefined && (
                  <p className="text-sm text-muted-foreground text-center">
                    Optimal quality found: {Math.round(result.finalQuality * 100)}%
                  </p>
                )}

                <Button onClick={handleDownload} size="lg" className="w-full">
                  <Download className="h-5 w-5 mr-2" />
                  Download Compressed PDF
                </Button>
              </CardContent>
            </Card>
          )}

          {state === "error" && error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={handleClear} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Toggle */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Compression Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={mode === "quality" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("quality")}
                    disabled={state === "processing"}
                    className="w-full"
                  >
                    <Settings2 className="h-4 w-4 mr-1" />
                    Manual
                  </Button>
                  <Button
                    variant={mode === "target" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("target")}
                    disabled={state === "processing"}
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Target Size
                  </Button>
                </div>
              </div>

              <Separator />

              {mode === "target" ? (
                /* Target Size Mode - Input Field */
                <div className="space-y-3">
                  <label className="text-sm font-medium">Target File Size (MB)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={targetSize}
                      onChange={handleTargetSizeInput}
                      disabled={state === "processing"}
                      className="text-center text-lg font-medium"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">MB</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter any size from 1 to 500 MB. Quality will auto-adjust.
                  </p>
                </div>
              ) : (
                /* Manual Quality Mode - Slider */
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">JPEG Quality</label>
                    <span className="text-sm text-muted-foreground font-medium">
                      {Math.round(settings.quality * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.quality * 100]}
                    onValueChange={([value]) =>
                      setSettings((s) => ({ ...s, quality: value / 100 }))
                    }
                    min={10}
                    max={100}
                    step={5}
                    disabled={state === "processing"}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smaller</span>
                    <span>Higher Quality</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* DPI Slider */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Resolution (DPI)</label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {DPI_LABELS[currentDpi]}
                  </span>
                </div>
                <Slider
                  value={[dpiIndex]}
                  onValueChange={handleDpiChange}
                  min={0}
                  max={DPI_VALUES.length - 1}
                  step={1}
                  disabled={state === "processing"}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>72 DPI</span>
                  <span>300 DPI</span>
                </div>
              </div>

              <Separator />

              {/* Compress Button */}
              <Button
                onClick={handleCompress}
                disabled={!file || state === "processing"}
                size="lg"
                className="w-full"
              >
                {state === "processing" ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <FileArchive className="h-5 w-5 mr-2" />
                    Compress PDF
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
          const tool = getToolById("pdf-compressor");
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
              This tool compresses PDFs by converting each page to an optimized JPEG image,
              then combining them into a new PDF.
            </p>
            <p>
              <strong>Target Size Mode</strong> automatically finds the best quality setting
              to achieve your desired file size.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
