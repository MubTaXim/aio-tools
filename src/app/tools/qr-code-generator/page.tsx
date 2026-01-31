"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  QrCode,
  Copy,
  Check,
  ImagePlus,
  X,
  Sparkles,
  Palette,
  Settings,
  Link2,
  Type,
  Square,
  Circle,
  Gem,
  Diamond,
  Leaf,
  Maximize,
  Shield,
  Move,
  PaintBucket,
  Blend,
  Grid3X3,
  AlignJustify,
  AlertCircle,
  Info,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  generateQRCode,
  downloadQRCode,
  DEFAULT_QR_OPTIONS,
  STYLE_INFO,
  EYE_STYLE_INFO,
  ERROR_CORRECTION_INFO,
  SIZE_PRESETS,
  COLOR_PRESETS,
  isUrl,
  type QROptions,
  type QRGenerationResult,
  type QRStyle,
  type EyeStyle,
  type ErrorCorrectionLevel,
  type DownloadFormat,
} from "@/lib/tools/qr-code-generator";

type GenerationState = "idle" | "generating" | "ready" | "error";

// Icon mapping for style selectors
const StyleIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    square: <Square className={className} />,
    "rounded-square": <Square className={className} style={{ borderRadius: 4 }} />,
    circle: <Circle className={className} />,
    sparkles: <Sparkles className={className} />,
    gem: <Gem className={className} />,
    diamond: <Diamond className={className} />,
    leaf: <Leaf className={className} />,
    maze: <Grid3X3 className={className} />,
    stripe: <AlignJustify className={className} />,
    shield: <Shield className={className} />,
    dot: <CircleDot className={className} />,
  };
  return <>{icons[name] || <Square className={className} />}</>;
};

export default function QRCodeGeneratorPage() {
  const [options, setOptions] = useState<QROptions>(DEFAULT_QR_OPTIONS);
  const [state, setState] = useState<GenerationState>("idle");
  const [result, setResult] = useState<QRGenerationResult | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"style" | "colors" | "advanced">("style");
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoKey, setLogoKey] = useState(0); // Used to trigger re-generation when logo changes
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isIdle = !options.content.trim();

  // Auto-generate with animation
  useEffect(() => {
    if (isIdle) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setIsGenerating(true);

    debounceRef.current = setTimeout(async () => {
      setState("generating");
      setError(null);

      try {
        const qrResult = await generateQRCode(options);
        setResult(qrResult);
        setState("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate QR code");
        setState("error");
      } finally {
        setIsGenerating(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [options, isIdle, logoKey]);

  const updateOption = useCallback(<K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateColor = useCallback((key: "foreground" | "background", value: string) => {
    setOptions((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }, []);

  const applyColorPreset = useCallback((preset: typeof COLOR_PRESETS[number]) => {
    setOptions((prev) => ({
      ...prev,
      colors: {
        foreground: preset.foreground,
        background: preset.background,
        gradient: preset.gradient,
      },
    }));
  }, []);

  const toggleGradient = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        gradient: prev.colors.gradient
          ? { ...prev.colors.gradient, enabled: !prev.colors.gradient.enabled }
          : { enabled: true, type: "linear", colors: ["#667eea", "#764ba2"], angle: 135 },
      },
    }));
  }, []);

  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setLogoError("Please select an image file (PNG, JPG, GIF, WebP)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setLogoError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB allowed.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      updateOption("logo", file);
      setLogoPreview(URL.createObjectURL(file));
      setLogoKey((prev) => prev + 1); // Force re-generation
      if (options.errorCorrection === "L") updateOption("errorCorrection", "H");
    }
  }, [options.errorCorrection, updateOption]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a synthetic change event
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleLogoSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  }, [handleLogoSelect]);

  const handleRemoveLogo = useCallback(() => {
    updateOption("logo", null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoError(null);
    setLogoKey((prev) => prev + 1); // Force re-generation
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [logoPreview, updateOption]);

  const updateLogoSetting = useCallback((
    key: keyof QROptions["logoSettings"], 
    value: string | number | boolean
  ) => {
    setOptions((prev) => ({
      ...prev,
      logoSettings: { ...prev.logoSettings, [key]: value },
    }));
  }, []);

  const handleDownload = useCallback(async (format: DownloadFormat) => {
    if (!result) return;
    const filename = isUrl(options.content)
      ? new URL(options.content).hostname.replace(/\./g, "_")
      : "qrcode";
    await downloadQRCode(result, format, filename);
  }, [result, options.content]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Fixed Preview Sidebar - Desktop Only */}
      <div className="hidden lg:fixed lg:flex lg:flex-col lg:top-14 lg:left-0 lg:bottom-0 lg:w-[420px] lg:border-r lg:bg-background/95 lg:backdrop-blur-xl lg:z-40">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* QR Preview Card */}
          <Card className="overflow-hidden border-0 shadow-2xl shadow-primary/5">
            <div className="relative">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[length:20px_20px]" />
              
              <div className="relative p-6">
                <div 
                  className={`
                    relative mx-auto aspect-square max-w-[280px] rounded-3xl 
                    bg-gradient-to-br from-muted/50 to-muted/30 
                    border-2 border-dashed border-muted-foreground/20
                    flex items-center justify-center
                    transition-all duration-500 ease-out
                    ${isGenerating ? "scale-[0.98]" : "scale-100"}
                  `}
                  style={{
                    background: result ? options.colors.background : undefined,
                  }}
                >
                  {/* Shimmer effect during generation */}
                  {isGenerating && (
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  )}

                  {isIdle && (
                    <div className="text-center text-muted-foreground p-8 animate-pulse">
                      <div className="relative mx-auto w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl animate-pulse" />
                        <div className="absolute inset-2 bg-background rounded-xl flex items-center justify-center">
                          <QrCode className="h-6 w-6 opacity-40" />
                        </div>
                      </div>
                      <p className="text-sm font-medium">Enter content to generate</p>
                      <p className="text-xs mt-1 opacity-60">URL, text, or any data</p>
                    </div>
                  )}

                  {!isIdle && result && (
                    <div className={`transition-all duration-500 ${isGenerating ? "opacity-50 blur-sm" : "opacity-100"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={result.dataUrl}
                        alt="Generated QR Code"
                        className="w-full h-full object-contain rounded-2xl shadow-lg"
                      />
                    </div>
                  )}

                  {state === "error" && (
                    <div className="text-center text-destructive p-8">
                      <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </div>

                {/* Download buttons */}
                {state === "ready" && result && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleDownload("png")}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PNG
                      </Button>
                      <Button
                        onClick={() => handleDownload("svg")}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 hover:bg-primary/5"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        SVG
                      </Button>
                      <Button
                        onClick={() => handleDownload("jpeg")}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 hover:bg-primary/5"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        JPG
                      </Button>
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-xl hover:bg-primary/5"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? "Copied!" : "Copy as Data URL"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Content Input - Desktop */}
          <Card className="border-0 shadow-xl shadow-primary/5">
            <CardContent className="p-4">
              <div className="relative">
                <textarea
                  value={options.content}
                  onChange={(e) => updateOption("content", e.target.value)}
                  placeholder="Enter URL, text, or any content..."
                  className="w-full min-h-[80px] p-3 rounded-xl border-2 border-muted bg-muted/30 text-sm resize-none focus:outline-none focus:border-primary/50 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/50"
                />
                {options.content && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="rounded-lg bg-primary/10 text-primary border-0 text-xs"
                    >
                      {isUrl(options.content) ? (
                        <><Link2 className="h-3 w-3 mr-1" /> URL</>
                      ) : (
                        <><Type className="h-3 w-3 mr-1" /> Text</>
                      )}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area - Offset on desktop for fixed sidebar */}
      <div className="lg:ml-[420px]">
        <div className="container max-w-screen-lg py-8 px-4 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-xl" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
                  <QrCode className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  QR Code Generator Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create stunning QR codes with premium styles
                </p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-6">
            {/* Content Input - Mobile only (shown at top of settings) */}
            <Card className="lg:hidden border-0 shadow-xl shadow-primary/5">
              <CardContent className="p-5">
                <div className="relative">
                  <textarea
                    value={options.content}
                    onChange={(e) => updateOption("content", e.target.value)}
                    placeholder="Enter URL, text, or any content..."
                    className="w-full min-h-[100px] p-4 rounded-2xl border-2 border-muted bg-muted/30 text-sm resize-none focus:outline-none focus:border-primary/50 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/50"
                  />
                  {options.content && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="rounded-lg bg-primary/10 text-primary border-0"
                      >
                        {isUrl(options.content) ? (
                          <><Link2 className="h-3 w-3 mr-1" /> URL</>
                        ) : (
                          <><Type className="h-3 w-3 mr-1" /> Text</>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl">
              {(["style", "colors", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${activeTab === tab 
                      ? "bg-background text-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }
                  `}
                >
                  {tab === "style" && <Sparkles className="h-4 w-4" />}
                  {tab === "colors" && <Palette className="h-4 w-4" />}
                  {tab === "advanced" && <Settings className="h-4 w-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Style Tab */}
            {activeTab === "style" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Pattern Style */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Pattern Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(STYLE_INFO) as QRStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateOption("style", style)}
                          className={`
                            relative p-3 rounded-xl text-center transition-all duration-300
                            ${options.style === style 
                              ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50 shadow-lg shadow-primary/10" 
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted hover:border-muted-foreground/20"
                            }
                          `}
                        >
                          <StyleIcon name={STYLE_INFO[style].iconName} className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-xs font-medium">{STYLE_INFO[style].label}</span>
                          {options.style === style && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Eye Style */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Circle className="h-5 w-5 text-primary" /> Corner Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.keys(EYE_STYLE_INFO) as EyeStyle[]).map((eye) => (
                        <button
                          key={eye}
                          onClick={() => updateOption("eyeStyle", eye)}
                          className={`
                            relative p-3 rounded-xl text-center transition-all duration-300
                            ${options.eyeStyle === eye 
                              ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50" 
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                            }
                          `}
                        >
                          <StyleIcon name={EYE_STYLE_INFO[eye].iconName} className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-[10px] font-medium">{EYE_STYLE_INFO[eye].label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Logo Upload */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ImagePlus className="h-5 w-5 text-primary" /> Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />

                    {/* Logo Error Alert */}
                    {logoError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p className="text-sm">{logoError}</p>
                        <button onClick={() => setLogoError(null)} className="ml-auto">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!options.logo ? (
                      <div className="space-y-3">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`
                            w-full h-24 rounded-2xl border-2 border-dashed transition-all duration-300 
                            flex flex-col items-center justify-center gap-2 cursor-pointer
                            ${isDragOver 
                              ? "border-primary bg-primary/10" 
                              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                            }
                          `}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImagePlus className="h-6 w-6" />
                          <span className="text-sm font-medium">
                            {isDragOver ? "Drop logo here" : "Drag & drop or click to add"}
                          </span>
                        </div>
                        {/* Requirements Info */}
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>Supported: PNG, JPG, GIF, WebP</p>
                            <p>Max size: 5MB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                          {logoPreview && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{options.logo.name}</p>
                            <p className="text-xs text-muted-foreground">{(options.logo.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={handleRemoveLogo} className="rounded-xl">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Logo Size */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Logo Size</span>
                            <span className="font-medium">{options.logoSize}%</span>
                          </div>
                          <Slider
                            value={[options.logoSize]}
                            onValueChange={([v]) => updateOption("logoSize", v)}
                            min={10}
                            max={40}
                            step={2}
                            className="py-2"
                          />
                        </div>

                        {/* Border Width */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Border Width</span>
                            <span className="font-medium">{options.logoSettings.borderWidth === 0 ? "None" : options.logoSettings.borderWidth}</span>
                          </div>
                          <Slider
                            value={[options.logoSettings.borderWidth]}
                            onValueChange={([v]) => updateLogoSetting("borderWidth", v)}
                            min={0}
                            max={20}
                            step={1}
                            className="py-2"
                          />
                        </div>

                        {/* Border Color */}
                        {options.logoSettings.borderWidth > 0 && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm text-muted-foreground">Border Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={options.logoSettings.borderColor}
                                onChange={(e) => updateLogoSetting("borderColor", e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                              />
                              <Input
                                value={options.logoSettings.borderColor}
                                onChange={(e) => updateLogoSetting("borderColor", e.target.value)}
                                className="flex-1 font-mono text-xs rounded-xl"
                              />
                            </div>
                          </div>
                        )}

                        {/* Border Radius */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Corner Radius</span>
                            <span className="font-medium">{options.logoSettings.borderRadius}%</span>
                          </div>
                          <Slider
                            value={[options.logoSettings.borderRadius]}
                            onValueChange={([v]) => updateLogoSetting("borderRadius", v)}
                            min={0}
                            max={50}
                            step={2}
                            className="py-2"
                          />
                        </div>

                        {/* Padding */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Padding</span>
                            <span className="font-medium">{options.logoSettings.padding}</span>
                          </div>
                          <Slider
                            value={[options.logoSettings.padding]}
                            onValueChange={([v]) => updateLogoSetting("padding", v)}
                            min={0}
                            max={20}
                            step={1}
                            className="py-2"
                          />
                        </div>

                        {/* Shadow Toggle */}
                        <button
                          onClick={() => updateLogoSetting("shadow", !options.logoSettings.shadow)}
                          className={`
                            w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300
                            ${options.logoSettings.shadow 
                              ? "bg-primary/10 border-2 border-primary/30" 
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                            }
                          `}
                        >
                          <span className="text-sm font-medium">Drop Shadow</span>
                          <div className={`
                            w-10 h-6 rounded-full p-0.5 transition-colors duration-300
                            ${options.logoSettings.shadow ? "bg-primary" : "bg-muted"}
                          `}>
                            <div className={`
                              w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                              ${options.logoSettings.shadow ? "translate-x-4" : "translate-x-0"}
                            `} />
                          </div>
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === "colors" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Color Presets */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" /> Presets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="group relative p-3 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300"
                        >
                          <div 
                            className="w-full aspect-square rounded-lg mb-2 shadow-inner"
                            style={{
                              background: preset.gradient.enabled
                                ? `linear-gradient(${preset.gradient.angle}deg, ${preset.gradient.colors[0]}, ${preset.gradient.colors[1]})`
                                : preset.foreground,
                            }}
                          />
                          <span className="text-[10px] font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Colors */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <PaintBucket className="h-5 w-5 text-primary" /> Custom Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Foreground - only show when gradient is disabled */}
                    {!options.colors.gradient?.enabled && (
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Foreground</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={options.colors.foreground}
                            onChange={(e) => updateColor("foreground", e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-muted"
                          />
                          <Input
                            value={options.colors.foreground}
                            onChange={(e) => updateColor("foreground", e.target.value)}
                            className="flex-1 font-mono text-xs rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    {/* Background - always visible */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={options.colors.background}
                          onChange={(e) => updateColor("background", e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-muted"
                        />
                        <Input
                          value={options.colors.background}
                          onChange={(e) => updateColor("background", e.target.value)}
                          className="flex-1 font-mono text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Gradient Toggle */}
                    <div className="pt-4 border-t">
                      <button
                        onClick={toggleGradient}
                        className={`
                          w-full p-4 rounded-xl flex items-center justify-between transition-all duration-300
                          ${options.colors.gradient?.enabled 
                            ? "bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/30" 
                            : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Blend className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Gradient Mode</p>
                            <p className="text-xs text-muted-foreground">Enable beautiful color transitions</p>
                          </div>
                        </div>
                        <div className={`
                          w-12 h-7 rounded-full p-1 transition-colors duration-300
                          ${options.colors.gradient?.enabled ? "bg-primary" : "bg-muted"}
                        `}>
                          <div className={`
                            w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300
                            ${options.colors.gradient?.enabled ? "translate-x-5" : "translate-x-0"}
                          `} />
                        </div>
                      </button>

                      {options.colors.gradient?.enabled && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm text-muted-foreground">Start Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={options.colors.gradient.colors[0]}
                                  onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    colors: {
                                      ...prev.colors,
                                      gradient: prev.colors.gradient ? {
                                        ...prev.colors.gradient,
                                        colors: [e.target.value, prev.colors.gradient.colors[1]]
                                      } : undefined
                                    }
                                  }))}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                />
                                <Input
                                  value={options.colors.gradient.colors[0]}
                                  onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    colors: {
                                      ...prev.colors,
                                      gradient: prev.colors.gradient ? {
                                        ...prev.colors.gradient,
                                        colors: [e.target.value, prev.colors.gradient.colors[1]]
                                      } : undefined
                                    }
                                  }))}
                                  className="flex-1 font-mono text-xs rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-muted-foreground">End Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={options.colors.gradient.colors[1]}
                                  onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    colors: {
                                      ...prev.colors,
                                      gradient: prev.colors.gradient ? {
                                        ...prev.colors.gradient,
                                        colors: [prev.colors.gradient.colors[0], e.target.value]
                                      } : undefined
                                    }
                                  }))}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                />
                                <Input
                                  value={options.colors.gradient.colors[1]}
                                  onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    colors: {
                                      ...prev.colors,
                                      gradient: prev.colors.gradient ? {
                                        ...prev.colors.gradient,
                                        colors: [prev.colors.gradient.colors[0], e.target.value]
                                      } : undefined
                                    }
                                  }))}
                                  className="flex-1 font-mono text-xs rounded-xl"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Angle</span>
                              <span className="font-medium">{options.colors.gradient.angle}°</span>
                            </div>
                            <Slider
                              value={[options.colors.gradient.angle]}
                              onValueChange={([v]) => setOptions(prev => ({
                                ...prev,
                                colors: {
                                  ...prev.colors,
                                  gradient: prev.colors.gradient ? { ...prev.colors.gradient, angle: v } : undefined
                                }
                              }))}
                              min={0}
                              max={360}
                              step={15}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Size */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" /> Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                      {SIZE_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => updateOption("size", preset.value)}
                          className={`
                            p-3 rounded-xl text-center transition-all duration-300
                            ${options.size === preset.value 
                              ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50" 
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                            }
                          `}
                        >
                          <span className="text-sm font-bold block">{preset.label}</span>
                          <span className="text-[10px] text-muted-foreground">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Error Correction */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" /> Error Correction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(ERROR_CORRECTION_INFO) as ErrorCorrectionLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => updateOption("errorCorrection", level)}
                          className={`
                            p-3 rounded-xl text-center transition-all duration-300
                            ${options.errorCorrection === level 
                              ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50" 
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                            }
                          `}
                        >
                          <span className="text-lg font-bold block">{level}</span>
                          <span className="text-[10px] text-muted-foreground">{ERROR_CORRECTION_INFO[level].recovery}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Higher correction allows more damage recovery but increases QR size
                    </p>
                  </CardContent>
                </Card>

                {/* Margin */}
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Move className="h-5 w-5 text-primary" /> Quiet Zone (Margin)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Modules</span>
                        <span className="font-medium">{options.margin}</span>
                      </div>
                      <Slider
                        value={[options.margin]}
                        onValueChange={([v]) => updateOption("margin", v)}
                        min={0}
                        max={6}
                        step={1}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Preview Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t shadow-2xl">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="w-full flex items-center gap-4"
          >
            {/* Mini Preview */}
            <div 
              className="relative w-16 h-16 rounded-xl border-2 border-muted flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: result ? options.colors.background : undefined }}
            >
              {isIdle ? (
                <QrCode className="h-6 w-6 text-muted-foreground/40" />
              ) : result ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.dataUrl}
                  alt="QR Preview"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="animate-pulse bg-muted rounded w-10 h-10" />
              )}
              {isGenerating && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">
                {isIdle ? "QR Code Preview" : "Tap to view full size"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isIdle ? "Enter content above to generate" : `${options.size}×${options.size}px • ${options.style}`}
              </p>
            </div>
            
            {/* Expand icon */}
            <Maximize className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Full Preview Modal */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">QR Code Preview</h3>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
              <div 
                className="relative w-full max-w-[300px] aspect-square rounded-3xl border-2 border-muted flex items-center justify-center"
                style={{ background: result ? options.colors.background : undefined }}
              >
                {isIdle ? (
                  <div className="text-center text-muted-foreground p-8">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-40" />
                    <p className="text-sm">Enter content to generate</p>
                  </div>
                ) : result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.dataUrl}
                    alt="Generated QR Code"
                    className="w-full h-full object-contain rounded-2xl p-2"
                  />
                ) : null}
              </div>
              
              {/* Size info */}
              {result && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {options.size} × {options.size} pixels
                </p>
              )}
            </div>
            
            {/* Download Buttons */}
            {state === "ready" && result && (
              <div className="p-4 border-t space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => { handleDownload("png"); setMobilePreviewOpen(false); }}
                    className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    PNG
                  </Button>
                  <Button
                    onClick={() => { handleDownload("svg"); setMobilePreviewOpen(false); }}
                    variant="outline"
                    className="rounded-xl border-2"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    SVG
                  </Button>
                  <Button
                    onClick={() => { handleDownload("jpeg"); setMobilePreviewOpen(false); }}
                    variant="outline"
                    className="rounded-xl border-2"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    JPG
                  </Button>
                </div>
                <Button
                  onClick={() => { handleCopy(); }}
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-xl"
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy as Data URL"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add bottom padding on mobile to account for sticky bar */}
      <div className="lg:hidden h-24" />

      {/* Custom CSS for shimmer animation and hidden scrollbar */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
