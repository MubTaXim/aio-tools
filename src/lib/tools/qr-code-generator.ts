import QRCode from "qrcode";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type QRStyle = 
  | "square" 
  | "rounded" 
  | "dots" 
  | "classy" 
  | "classy-rounded"
  | "diamond"
  | "maze"
  | "stripe";

export type EyeStyle = "square" | "rounded" | "circle" | "leaf" | "diamond" | "shield" | "dot";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type DownloadFormat = "png" | "svg" | "jpeg";

export interface GradientConfig {
  enabled: boolean;
  type: "linear" | "radial";
  colors: [string, string];
  angle: number;
}

export interface QRColors {
  foreground: string;
  background: string;
  gradient?: GradientConfig;
}

export interface LogoSettings {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  shadow: boolean;
}

export interface QROptions {
  content: string;
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  style: QRStyle;
  eyeStyle: EyeStyle;
  colors: QRColors;
  logo?: File | null;
  logoSize: number;
  logoSettings: LogoSettings;
  margin: number;
}

export interface QRGenerationResult {
  dataUrl: string;
  svgString?: string;
  size: number;
}

// ============================================================================
// Defaults & Presets
// ============================================================================

export const DEFAULT_QR_OPTIONS: QROptions = {
  content: "",
  size: 512,
  errorCorrection: "H",
  style: "classy-rounded",
  eyeStyle: "rounded",
  colors: {
    foreground: "#1a1a2e",
    background: "#ffffff",
    gradient: {
      enabled: false,
      type: "linear",
      colors: ["#667eea", "#764ba2"],
      angle: 135,
    },
  },
  logo: null,
  logoSize: 22,
  logoSettings: {
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    shadow: true,
  },
  margin: 2,
};

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  borderWidth: 3,
  borderColor: "#ffffff",
  borderRadius: 12,
  padding: 8,
  shadow: true,
};

export const STYLE_INFO: Record<QRStyle, { label: string; description: string; iconName: string }> = {
  square: { label: "Classic", description: "Traditional square modules", iconName: "square" },
  rounded: { label: "Soft", description: "Rounded corners on modules", iconName: "rounded-square" },
  dots: { label: "Dots", description: "Circular dot pattern", iconName: "circle" },
  classy: { label: "Classy", description: "Connected modules with style", iconName: "sparkles" },
  "classy-rounded": { label: "Premium", description: "Smooth connected pattern", iconName: "gem" },
  diamond: { label: "Diamond", description: "Diamond-shaped modules", iconName: "diamond" },
  maze: { label: "Maze", description: "Labyrinth maze pattern", iconName: "maze" },
  stripe: { label: "Stripe", description: "Striped bar pattern", iconName: "stripe" },
};

export const EYE_STYLE_INFO: Record<EyeStyle, { label: string; iconName: string }> = {
  square: { label: "Square", iconName: "square" },
  rounded: { label: "Rounded", iconName: "square" },
  circle: { label: "Circle", iconName: "circle" },
  leaf: { label: "Leaf", iconName: "leaf" },
  diamond: { label: "Diamond", iconName: "diamond" },
  shield: { label: "Shield", iconName: "shield" },
  dot: { label: "Dot", iconName: "dot" },
};

export const ERROR_CORRECTION_INFO: Record<ErrorCorrectionLevel, { label: string; recovery: string }> = {
  L: { label: "Light", recovery: "7%" },
  M: { label: "Medium", recovery: "15%" },
  Q: { label: "Quality", recovery: "25%" },
  H: { label: "High", recovery: "30%" },
};

export const SIZE_PRESETS = [
  { label: "S", value: 256, desc: "256px" },
  { label: "M", value: 512, desc: "512px" },
  { label: "L", value: 768, desc: "768px" },
  { label: "XL", value: 1024, desc: "1024px" },
  { label: "2K", value: 2048, desc: "2048px" },
];

export const COLOR_PRESETS = [
  {
    name: "Midnight",
    foreground: "#1a1a2e",
    background: "#ffffff",
    gradient: { enabled: true, type: "linear" as const, colors: ["#1a1a2e", "#16213e"] as [string, string], angle: 135 },
  },
  {
    name: "Ocean",
    foreground: "#0077b6",
    background: "#ffffff",
    gradient: { enabled: true, type: "linear" as const, colors: ["#0077b6", "#00b4d8"] as [string, string], angle: 45 },
  },
  {
    name: "Sunset",
    foreground: "#ff6b6b",
    background: "#ffffff",
    gradient: { enabled: true, type: "linear" as const, colors: ["#ff6b6b", "#feca57"] as [string, string], angle: 135 },
  },
  {
    name: "Forest",
    foreground: "#2d6a4f",
    background: "#ffffff",
    gradient: { enabled: true, type: "linear" as const, colors: ["#2d6a4f", "#40916c"] as [string, string], angle: 180 },
  },
  {
    name: "Purple",
    foreground: "#7209b7",
    background: "#ffffff",
    gradient: { enabled: true, type: "linear" as const, colors: ["#7209b7", "#560bad"] as [string, string], angle: 45 },
  },
  {
    name: "Ember",
    foreground: "#dc2f02",
    background: "#ffffff",
    gradient: { enabled: true, type: "radial" as const, colors: ["#dc2f02", "#e85d04"] as [string, string], angle: 0 },
  },
  {
    name: "Classic",
    foreground: "#000000",
    background: "#ffffff",
    gradient: { enabled: false, type: "linear" as const, colors: ["#000000", "#333333"] as [string, string], angle: 0 },
  },
  {
    name: "Inverted",
    foreground: "#ffffff",
    background: "#1a1a2e",
    gradient: { enabled: false, type: "linear" as const, colors: ["#ffffff", "#e0e0e0"] as [string, string], angle: 0 },
  },
];

// ============================================================================
// QR Code Generation
// ============================================================================

export async function generateQRCode(options: QROptions): Promise<QRGenerationResult> {
  const { content, size, logo, logoSize, logoSettings } = options;

  if (!content.trim()) {
    throw new Error("Content is required");
  }

  let dataUrl = await generateStyledQR(content, options);

  if (logo) {
    dataUrl = await addLogoToQR(dataUrl, logo, size, logoSize, logoSettings);
  }

  const svgString = await generateSVG(content, options);

  return { dataUrl, svgString, size };
}

async function generateStyledQR(content: string, options: QROptions): Promise<string> {
  const { size, errorCorrection, colors, margin, style, eyeStyle } = options;

  const qrData = await QRCode.create(content, { errorCorrectionLevel: errorCorrection });
  const modules = qrData.modules;
  const moduleCount = modules.size;
  const totalSize = size;
  const marginSize = margin * (totalSize / (moduleCount + margin * 2));
  const moduleSize = (totalSize - marginSize * 2) / moduleCount;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Create fill style (solid or gradient)
  let fillStyle: string | CanvasGradient = colors.foreground;
  if (colors.gradient?.enabled) {
    const { type, colors: gradColors, angle } = colors.gradient;
    if (type === "linear") {
      const rad = (angle * Math.PI) / 180;
      const x1 = totalSize / 2 - (Math.cos(rad) * totalSize) / 2;
      const y1 = totalSize / 2 - (Math.sin(rad) * totalSize) / 2;
      const x2 = totalSize / 2 + (Math.cos(rad) * totalSize) / 2;
      const y2 = totalSize / 2 + (Math.sin(rad) * totalSize) / 2;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, gradColors[0]);
      gradient.addColorStop(1, gradColors[1]);
      fillStyle = gradient;
    } else {
      const gradient = ctx.createRadialGradient(totalSize / 2, totalSize / 2, 0, totalSize / 2, totalSize / 2, totalSize / 2);
      gradient.addColorStop(0, gradColors[0]);
      gradient.addColorStop(1, gradColors[1]);
      fillStyle = gradient;
    }
  }

  ctx.fillStyle = fillStyle;

  // Draw data modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col, moduleCount)) continue;
      if (modules.get(row, col)) {
        const x = marginSize + col * moduleSize;
        const y = marginSize + row * moduleSize;
        drawModule(ctx, x, y, moduleSize, style, row, col, modules);
      }
    }
  }

  // Draw finder patterns
  const finderPositions = [
    { x: 0, y: 0 },
    { x: moduleCount - 7, y: 0 },
    { x: 0, y: moduleCount - 7 },
  ];

  ctx.fillStyle = fillStyle;
  for (const pos of finderPositions) {
    drawFinderPattern(ctx, marginSize + pos.x * moduleSize, marginSize + pos.y * moduleSize, moduleSize * 7, eyeStyle, fillStyle, colors.background);
  }

  return canvas.toDataURL("image/png");
}

function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= moduleCount - 7) return true;
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: QRStyle,
  row: number,
  col: number,
  modules: { get: (r: number, c: number) => number; size: number }
): void {
  const padding = size * 0.08;
  const innerSize = size - padding * 2;

  switch (style) {
    case "square":
      ctx.fillRect(x + padding / 2, y + padding / 2, innerSize + padding, innerSize + padding);
      break;

    case "rounded":
      drawRoundedRect(ctx, x + padding / 2, y + padding / 2, innerSize + padding, innerSize + padding, size * 0.35);
      break;

    case "dots":
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.48, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "classy":
    case "classy-rounded":
      drawClassyModule(ctx, x, y, size, style === "classy-rounded", row, col, modules);
      break;

    case "diamond": {
      // Draw actual diamond shape rotated 45 degrees, fills most of cell
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size * 0.52; // Large enough to fill ~70% of cell area
      ctx.beginPath();
      ctx.moveTo(cx, cy - r); // top
      ctx.lineTo(cx + r, cy); // right
      ctx.lineTo(cx, cy + r); // bottom
      ctx.lineTo(cx - r, cy); // left
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "maze":
      drawMazeModule(ctx, x, y, size, row, col, modules);
      break;

    case "stripe":
      drawStripe(ctx, x, y, size, row, col, modules);
      break;
  }
}

function drawClassyModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rounded: boolean,
  row: number,
  col: number,
  modules: { get: (r: number, c: number) => number; size: number }
): void {
  const moduleCount = modules.size;
  const hasTop = row > 0 && !!modules.get(row - 1, col) && !isFinderPattern(row - 1, col, moduleCount);
  const hasBottom = row < moduleCount - 1 && !!modules.get(row + 1, col) && !isFinderPattern(row + 1, col, moduleCount);
  const hasLeft = col > 0 && !!modules.get(row, col - 1) && !isFinderPattern(row, col - 1, moduleCount);
  const hasRight = col < moduleCount - 1 && !!modules.get(row, col + 1) && !isFinderPattern(row, col + 1, moduleCount);

  const r = rounded ? size * 0.42 : size * 0.12;
  const p = size * 0.04;

  ctx.beginPath();

  if (!hasTop && !hasLeft) {
    ctx.moveTo(x + p + r, y + p);
    ctx.arc(x + p + r, y + p + r, r, -Math.PI / 2, Math.PI, true);
  } else {
    ctx.moveTo(x + p, y + p);
  }

  if (!hasBottom && !hasLeft) {
    ctx.lineTo(x + p, y + size - p - r);
    ctx.arc(x + p + r, y + size - p - r, r, Math.PI, Math.PI / 2, true);
  } else {
    ctx.lineTo(x + p, y + size - p);
  }

  if (!hasBottom && !hasRight) {
    ctx.lineTo(x + size - p - r, y + size - p);
    ctx.arc(x + size - p - r, y + size - p - r, r, Math.PI / 2, 0, true);
  } else {
    ctx.lineTo(x + size - p, y + size - p);
  }

  if (!hasTop && !hasRight) {
    ctx.lineTo(x + size - p, y + p + r);
    ctx.arc(x + size - p - r, y + p + r, r, 0, -Math.PI / 2, true);
  } else {
    ctx.lineTo(x + size - p, y + p);
  }

  ctx.closePath();
  ctx.fill();
}

function drawMazeModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  row: number,
  col: number,
  modules: { get: (r: number, c: number) => number; size: number }
): void {
  const moduleCount = modules.size;
  const hasTop = row > 0 && !!modules.get(row - 1, col) && !isFinderPattern(row - 1, col, moduleCount);
  const hasBottom = row < moduleCount - 1 && !!modules.get(row + 1, col) && !isFinderPattern(row + 1, col, moduleCount);
  const hasLeft = col > 0 && !!modules.get(row, col - 1) && !isFinderPattern(row, col - 1, moduleCount);
  const hasRight = col < moduleCount - 1 && !!modules.get(row, col + 1) && !isFinderPattern(row, col + 1, moduleCount);

  // 85% fill for reliable scanning
  const wall = size * 0.85;
  const p = (size - wall) / 2;

  ctx.beginPath();
  
  // Always draw a large center square
  ctx.rect(x + p, y + p, wall, wall);
  
  // Connect to neighbors
  if (hasTop) ctx.rect(x + p, y, wall, p);
  if (hasBottom) ctx.rect(x + p, y + size - p, wall, p);
  if (hasLeft) ctx.rect(x, y + p, p, wall);
  if (hasRight) ctx.rect(x + size - p, y + p, p, wall);
  
  ctx.fill();
}

function drawStripe(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  row: number, 
  col: number,
  modules: { get: (r: number, c: number) => number; size: number }
): void {
  const moduleCount = modules.size;
  const hasRight = col < moduleCount - 1 && !!modules.get(row, col + 1) && !isFinderPattern(row, col + 1, moduleCount);
  const hasBottom = row < moduleCount - 1 && !!modules.get(row + 1, col) && !isFinderPattern(row + 1, col, moduleCount);
  
  const p = size * 0.04;
  const barThick = size * 0.8; // Very thick for scanability
  const barThin = (size - barThick) / 2;
  
  // Always draw center square
  ctx.fillRect(x + barThin, y + barThin, barThick, barThick);
  
  // Horizontal extension to right
  if (hasRight) {
    ctx.fillRect(x + barThin + barThick - p, y + barThin, barThin + p * 2, barThick);
  }
  
  // Vertical extension to bottom
  if (hasBottom) {
    ctx.fillRect(x + barThin, y + barThin + barThick - p, barThick, barThin + p * 2);
  }
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: EyeStyle,
  fillStyle: string | CanvasGradient,
  bgColor: string
): void {
  const m = size / 7;
  ctx.fillStyle = fillStyle;

  switch (style) {
    case "square":
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = bgColor;
      ctx.fillRect(x + m, y + m, m * 5, m * 5);
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x + m * 2, y + m * 2, m * 3, m * 3);
      break;

    case "rounded":
      drawRoundedRect(ctx, x, y, size, size, m * 1.8);
      ctx.fillStyle = bgColor;
      drawRoundedRect(ctx, x + m, y + m, m * 5, m * 5, m * 1.2);
      ctx.fillStyle = fillStyle;
      drawRoundedRect(ctx, x + m * 2, y + m * 2, m * 3, m * 3, m * 0.8);
      break;

    case "circle":
      const c = size / 2;
      ctx.beginPath();
      ctx.arc(x + c, y + c, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(x + c, y + c, size / 2 - m, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(x + c, y + c, m * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "leaf":
      drawLeafEye(ctx, x, y, size, fillStyle, bgColor);
      break;

    case "diamond":
      drawDiamondEye(ctx, x, y, size, fillStyle, bgColor);
      break;

    case "shield":
      drawShieldEye(ctx, x, y, size, fillStyle, bgColor);
      break;

    case "dot":
      drawDotEye(ctx, x, y, size, fillStyle, bgColor);
      break;
  }
}

function drawLeafEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string | CanvasGradient, bg: string): void {
  const m = size / 7;
  const r = size * 0.42;

  // Outer
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + size - r);
  ctx.arc(x + size - r, y + size - r, r, 0, Math.PI / 2);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Middle (white)
  ctx.fillStyle = bg;
  const ir = r * 0.7;
  ctx.beginPath();
  ctx.moveTo(x + m + ir, y + m);
  ctx.lineTo(x + size - m, y + m);
  ctx.lineTo(x + size - m, y + size - m - ir);
  ctx.arc(x + size - m - ir, y + size - m - ir, ir, 0, Math.PI / 2);
  ctx.lineTo(x + m, y + size - m);
  ctx.lineTo(x + m, y + m + ir);
  ctx.arc(x + m + ir, y + m + ir, ir, Math.PI, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Inner
  ctx.fillStyle = fill;
  const cr = r * 0.4;
  ctx.beginPath();
  ctx.moveTo(x + m * 2 + cr, y + m * 2);
  ctx.lineTo(x + size - m * 2, y + m * 2);
  ctx.lineTo(x + size - m * 2, y + size - m * 2 - cr);
  ctx.arc(x + size - m * 2 - cr, y + size - m * 2 - cr, cr, 0, Math.PI / 2);
  ctx.lineTo(x + m * 2, y + size - m * 2);
  ctx.lineTo(x + m * 2, y + m * 2 + cr);
  ctx.arc(x + m * 2 + cr, y + m * 2 + cr, cr, Math.PI, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();
}

function drawDiamondEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string | CanvasGradient, bg: string): void {
  const c = size / 2;
  const m = size / 7;

  // Outer
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + size, y + c);
  ctx.lineTo(x + c, y + size);
  ctx.lineTo(x, y + c);
  ctx.closePath();
  ctx.fill();

  // Middle
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x + c, y + m);
  ctx.lineTo(x + size - m, y + c);
  ctx.lineTo(x + c, y + size - m);
  ctx.lineTo(x + m, y + c);
  ctx.closePath();
  ctx.fill();

  // Inner
  ctx.fillStyle = fill;
  const core = m * 1.5;
  ctx.beginPath();
  ctx.moveTo(x + c, y + c - core);
  ctx.lineTo(x + c + core, y + c);
  ctx.lineTo(x + c, y + c + core);
  ctx.lineTo(x + c - core, y + c);
  ctx.closePath();
  ctx.fill();
}

function drawShieldEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string | CanvasGradient, bg: string): void {
  const c = size / 2;
  const m = size / 7;

  // Outer shield shape
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + size * 0.6);
  ctx.quadraticCurveTo(x + size, y + size, x + c, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Middle
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x + m, y + m);
  ctx.lineTo(x + size - m, y + m);
  ctx.lineTo(x + size - m, y + size * 0.55);
  ctx.quadraticCurveTo(x + size - m, y + size - m, x + c, y + size - m);
  ctx.quadraticCurveTo(x + m, y + size - m, x + m, y + size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Inner
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + m * 2, y + m * 2);
  ctx.lineTo(x + size - m * 2, y + m * 2);
  ctx.lineTo(x + size - m * 2, y + size * 0.5);
  ctx.quadraticCurveTo(x + size - m * 2, y + size - m * 2, x + c, y + size - m * 2);
  ctx.quadraticCurveTo(x + m * 2, y + size - m * 2, x + m * 2, y + size * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawDotEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string | CanvasGradient, bg: string): void {
  const c = size / 2;
  const m = size / 7;

  // Outer rounded square
  ctx.fillStyle = fill;
  drawRoundedRect(ctx, x, y, size, size, m * 2);

  // Middle
  ctx.fillStyle = bg;
  drawRoundedRect(ctx, x + m, y + m, m * 5, m * 5, m * 1.5);

  // Inner dot (circle instead of square)
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x + c, y + c, m * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

async function generateSVG(content: string, options: QROptions): Promise<string> {
  const { errorCorrection, colors, margin } = options;
  return QRCode.toString(content, {
    type: "svg",
    errorCorrectionLevel: errorCorrection,
    margin,
    color: { dark: colors.foreground, light: colors.background },
  });
}

async function addLogoToQR(
  qrDataUrl: string, 
  logoFile: File, 
  qrSize: number, 
  logoSizePercent: number,
  settings: LogoSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

      // Read logo file as data URL directly
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string;
        const logoImage = new Image();

        logoImage.onload = () => {
          const logoSize = (qrSize * logoSizePercent) / 100;
          const logoX = (qrSize - logoSize) / 2;
          const logoY = (qrSize - logoSize) / 2;
          
          // Use settings for customization
          const paddingPx = (settings.padding / 100) * logoSize;
          const borderWidthPx = (settings.borderWidth / 100) * logoSize * 2;
          const radiusPx = (settings.borderRadius / 100) * logoSize;
          
          const bgSize = logoSize + paddingPx * 2 + borderWidthPx * 2;
          const bgX = logoX - paddingPx - borderWidthPx;
          const bgY = logoY - paddingPx - borderWidthPx;

          // Shadow (optional)
          if (settings.shadow) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
            ctx.shadowBlur = logoSize * 0.1;
            ctx.shadowOffsetY = logoSize * 0.04;
          }

          // Border background
          if (borderWidthPx > 0) {
            ctx.fillStyle = settings.borderColor;
            drawRoundedRectPath(ctx, bgX, bgY, bgSize, bgSize, radiusPx);
            ctx.fill();
          }

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          // White padding background (inner area)
          if (paddingPx > 0 || borderWidthPx === 0) {
            const innerBgSize = logoSize + paddingPx * 2;
            const innerBgX = logoX - paddingPx;
            const innerBgY = logoY - paddingPx;
            const innerRadius = radiusPx * 0.8;
            
            ctx.fillStyle = "#ffffff";
            drawRoundedRectPath(ctx, innerBgX, innerBgY, innerBgSize, innerBgSize, innerRadius);
            ctx.fill();
          }

          // Logo with rounded corners
          ctx.save();
          const logoRadius = radiusPx * 0.6;
          drawRoundedRectPath(ctx, logoX, logoY, logoSize, logoSize, logoRadius);
          ctx.clip();
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          resolve(canvas.toDataURL("image/png"));
        };

        logoImage.onerror = () => {
          reject(new Error("Failed to load logo image"));
        };
        logoImage.src = logoDataUrl;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read logo file"));
      };
      reader.readAsDataURL(logoFile);
    };

    qrImage.onerror = () => reject(new Error("Failed to load QR image"));
    qrImage.src = qrDataUrl;
  });
}

function drawRoundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================================
// Download
// ============================================================================

export async function downloadQRCode(result: QRGenerationResult, format: DownloadFormat, filename = "qrcode"): Promise<void> {
  const name = filename.replace(/[^a-z0-9]/gi, "_");

  if (format === "svg" && result.svgString) {
    downloadBlob(new Blob([result.svgString], { type: "image/svg+xml" }), `${name}.svg`);
  } else if (format === "jpeg") {
    downloadBlob(await toJpegBlob(result.dataUrl), `${name}.jpg`);
  } else {
    const res = await fetch(result.dataUrl);
    downloadBlob(await res.blob(), `${name}.png`);
  }
}

async function toJpegBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("JPEG conversion failed"))), "image/jpeg", 0.95);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Utilities
// ============================================================================

export function isUrl(content: string): boolean {
  try {
    new URL(content);
    return true;
  } catch {
    return content.startsWith("http://") || content.startsWith("https://") || content.startsWith("www.");
  }
}

export function formatContentPreview(content: string, maxLength = 50): string {
  return content.length <= maxLength ? content : content.substring(0, maxLength - 3) + "...";
}
