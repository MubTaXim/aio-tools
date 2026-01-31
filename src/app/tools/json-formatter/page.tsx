"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileJson,
  Copy,
  Check,
  Download,
  Trash2,
  Wand2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Settings2,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageTransition, FadeIn, AnimatedCounter, ScaleIn } from "@/components/ui/animations";
import {
  formatJSON,
  minifyJSON,
  repairJSON,
  validateJSON,
  getJSONStats,
  DEFAULT_FORMAT_OPTIONS,
  type FormatOptions,
} from "@/lib/tools/json-formatter";
import { getToolById } from "@/lib/tools/registry";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

const SAMPLE_JSON = `{
  "name": "AIO Tools",
  "version": "1.0.0",
  "features": ["PDF Compressor", "Code Stacker", "JSON Formatter"],
  "settings": {
    "theme": "dark",
    "autoSave": true
  }
}`;

export default function JSONFormatterPage() {
  // State
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [options, setOptions] = useState<FormatOptions>(DEFAULT_FORMAT_OPTIONS);

  // Validation status
  const validation = useMemo(() => {
    if (!input.trim()) return null;
    return validateJSON(input);
  }, [input]);

  // Stats
  const stats = useMemo(() => {
    if (!input.trim() || !validation?.isValid) return null;
    return getJSONStats(input);
  }, [input, validation]);

  // Handlers
  const handleFormat = useCallback(() => {
    const result = formatJSON(input, options);
    setOutput(result.output);
  }, [input, options]);

  const handleMinify = useCallback(() => {
    const result = minifyJSON(input);
    setOutput(result.output);
  }, [input]);

  const handleRepair = useCallback(() => {
    const result = repairJSON(input);
    setOutput(result.output);
    if (result.success) {
      setInput(result.output);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [output, input]);

  const handleDownload = useCallback(() => {
    const textToDownload = output || input;
    if (!textToDownload) return;

    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, input]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setOutput("");
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setOutput("");
  }, []);

  const displayText = output || input;
  const lineCount = displayText.split("\n").length;

  return (
    <PageTransition>
      <div className="container max-w-screen-xl py-8">
        {/* Header */}
        <FadeIn className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 animate-scale-in">
              <FileJson className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">JSON Formatter</h1>
              <p className="text-sm text-muted-foreground">
                Format, validate, minify, and repair JSON
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <FadeIn delay={100}>
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleFormat} disabled={!input.trim()}>
                  <Wand2 className="h-4 w-4" />
                  Format
                </Button>
                <Button variant="secondary" onClick={handleMinify} disabled={!input.trim()}>
                  <Minimize2 className="h-4 w-4" />
                  Minify
                </Button>
                <Button variant="secondary" onClick={handleRepair} disabled={!input.trim()}>
                  <Wand2 className="h-4 w-4" />
                  Repair
                </Button>

                <Separator orientation="vertical" className="h-8 mx-2" />

                <Button variant="outline" onClick={handleCopy} disabled={!displayText}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={!displayText}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={!input}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>

                <div className="flex-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="gap-1"
                >
                  <Settings2 className="h-4 w-4" />
                  Settings
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showSettings && "rotate-180")} />
                </Button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="mt-4 pt-4 border-t border-border animate-slide-up">
                  <div className="flex flex-wrap gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Indent Size</label>
                      <div className="flex gap-2">
                        {[2, 4].map((size) => (
                          <Button
                            key={size}
                            size="sm"
                            variant={options.indentSize === size && options.indentChar === "space" ? "default" : "outline"}
                            onClick={() => setOptions({ ...options, indentSize: size, indentChar: "space" })}
                            className="transition-all hover:scale-105"
                          >
                            {size} spaces
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant={options.indentChar === "tab" ? "default" : "outline"}
                          onClick={() => setOptions({ ...options, indentChar: "tab" })}
                          className="transition-all hover:scale-105"
                        >
                          Tab
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort Keys</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={options.sortKeys ? "default" : "outline"}
                          onClick={() => setOptions({ ...options, sortKeys: true })}
                          className="transition-all hover:scale-105"
                        >
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant={!options.sortKeys ? "default" : "outline"}
                          onClick={() => setOptions({ ...options, sortKeys: false })}
                          className="transition-all hover:scale-105"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </FadeIn>

          {/* Validation Status */}
          {validation && (
            <ScaleIn>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                  validation.isValid
                    ? "bg-green-500/10 text-green-500"
                    : "bg-destructive/10 text-destructive animate-shake"
                )}
              >
                {validation.isValid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 animate-success" />
                    Valid JSON
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    {validation.error?.message}
                    {validation.error?.line && (
                      <span className="ml-2 font-mono text-xs">
                        (Line {validation.error.line}, Column {validation.error.column})
                      </span>
                    )}
                  </>
                )}
              </div>
            </ScaleIn>
          )}

          {/* Editor */}
          <FadeIn delay={200}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r border-border text-right select-none pointer-events-none">
                  <div className="p-4 font-mono text-xs text-muted-foreground leading-6">
                    {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                      <div key={i + 1}>{i + 1}</div>
                    ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={output || input}
                onChange={handleInputChange}
                placeholder="Paste your JSON here..."
                className={cn(
                  "w-full min-h-[500px] p-4 pl-16 font-mono text-sm leading-6",
                  "bg-transparent resize-none focus:outline-none",
                  "placeholder:text-muted-foreground transition-colors"
                )}
                spellCheck={false}
              />
            </div>
          </Card>
          </FadeIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <FadeIn delay={300}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start transition-all hover:scale-[1.02] hover:bg-primary/5" 
                  onClick={handleLoadSample}
                >
                  <FileJson className="h-4 w-4" />
                  Load Sample JSON
                </Button>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Statistics */}
          {stats && (
            <ScaleIn>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Keys</p>
                      <p className="text-xl font-semibold">
                        <AnimatedCounter value={stats.keys} duration={500} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Values</p>
                      <p className="text-xl font-semibold">
                        <AnimatedCounter value={stats.values} duration={500} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Depth</p>
                      <p className="text-xl font-semibold">
                        <AnimatedCounter value={stats.depth} duration={500} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="text-xl font-semibold">{formatFileSize(stats.size.original)}</p>
                    </div>
                  </div>
                  {stats.size.original !== stats.size.minified && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Minified: {formatFileSize(stats.size.minified)} (
                        {Math.round((1 - stats.size.minified / stats.size.original) * 100)}% smaller)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScaleIn>
          )}

          {/* Tips */}
          <FadeIn delay={400}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Format</strong> - Beautify with indentation</li>
                  <li>• <strong>Minify</strong> - Remove all whitespace</li>
                  <li>• <strong>Repair</strong> - Fix common errors like trailing commas</li>
                  <li>• <strong>Sort Keys</strong> - Alphabetically sort object keys</li>
                </ul>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Credits */}
          <FadeIn delay={500}>
            {(() => {
              const tool = getToolById("json-formatter");
              const credits = tool?.credits;
              if (!credits) return null;
              
              return (
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
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
          </FadeIn>

          {/* How It Works */}
          <FadeIn delay={600}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Paste or type your JSON in the editor. The tool validates it in real-time
                  and shows any syntax errors with line numbers.
                </p>
                <p>
                  <strong>100% Private:</strong> All processing happens locally in your browser.
                  Your data never leaves your device.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
