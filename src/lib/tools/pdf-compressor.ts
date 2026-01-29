/**
 * PDF Compressor Engine
 * 
 * Compresses PDFs by re-rasterizing pages as optimized JPEG images.
 * This approach works on already-compressed PDFs where traditional
 * compression fails.
 * 
 * Process:
 * 1. Load PDF using PDF.js
 * 2. Render each page to canvas at specified DPI
 * 3. Convert canvas to JPEG with quality setting
 * 4. Combine all images into new PDF using jsPDF
 */

export interface CompressionSettings {
  quality: number; // 0.1 to 1.0 (0.5 = 50%)
  dpi: number; // 72, 96, 144, 150, 200, 300
  targetSizeMB?: number; // Optional target size in MB
}

export interface CompressionProgress {
  stage: "loading" | "rendering" | "compressing" | "generating" | "optimizing" | "complete";
  currentPage: number;
  totalPages: number;
  message: string;
  attempt?: number;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  duration: number;
  finalQuality?: number;
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 0.5, // 50% JPEG quality
  dpi: 144, // Matches user's successful NAPS2 settings
};

export const DPI_OPTIONS = [
  { value: 72, label: "72 DPI (Screen)" },
  { value: 96, label: "96 DPI (Web)" },
  { value: 144, label: "144 DPI (Recommended)" },
  { value: 150, label: "150 DPI (Print)" },
  { value: 200, label: "200 DPI (High)" },
  { value: 300, label: "300 DPI (Maximum)" },
];

export const TARGET_SIZE_OPTIONS = [
  { value: 5, label: "5 MB" },
  { value: 10, label: "10 MB" },
  { value: 25, label: "25 MB" },
  { value: 50, label: "50 MB" },
  { value: 75, label: "75 MB" },
  { value: 100, label: "100 MB" },
];

// Store for rendered canvases (used for target size optimization)
interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/**
 * Render all PDF pages to canvases (done once, reused for quality adjustments)
 */
async function renderPagesToCanvases(
  file: File,
  dpi: number,
  onProgress?: (progress: CompressionProgress) => void
): Promise<{ pages: RenderedPage[]; originalSize: number }> {
  
  onProgress?.({
    stage: "loading",
    currentPage: 0,
    totalPages: 0,
    message: "Loading libraries...",
  });

  // Dynamic imports
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  onProgress?.({
    stage: "loading",
    currentPage: 0,
    totalPages: 0,
    message: "Loading PDF...",
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pages: RenderedPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.({
      stage: "rendering",
      currentPage: pageNum,
      totalPages,
      message: `Rendering page ${pageNum} of ${totalPages}...`,
    });

    const page = await pdf.getPage(pageNum);
    const scale = dpi / 72;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d")!;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({
      canvasContext: context,
      viewport,
    }).promise;

    pages.push({
      canvas,
      width: viewport.width,
      height: viewport.height,
    });

    page.cleanup();
  }

  return { pages, originalSize: file.size };
}

/**
 * Generate PDF from canvases with specified quality
 * Yields to browser periodically to prevent freezing
 */
async function generatePDFFromCanvases(
  pages: RenderedPage[],
  quality: number
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const firstPage = pages[0];
  const pdfDoc = new jsPDF({
    orientation: firstPage.width > firstPage.height ? "landscape" : "portrait",
    unit: "px",
    format: [firstPage.width, firstPage.height],
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    if (i > 0) {
      pdfDoc.addPage(
        [page.width, page.height],
        page.width > page.height ? "landscape" : "portrait"
      );
    }

    const dataUrl = page.canvas.toDataURL("image/jpeg", quality);
    pdfDoc.addImage(dataUrl, "JPEG", 0, 0, page.width, page.height, undefined, "FAST");

    // Yield to browser every 20 pages to prevent freezing
    if (i % 20 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return pdfDoc.output("blob");
}

/**
 * Compress a PDF file with optional target size
 */
export async function compressPDF(
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const startTime = performance.now();

  // Render pages once
  const { pages, originalSize } = await renderPagesToCanvases(file, settings.dpi, onProgress);
  const totalPages = pages.length;

  let finalBlob: Blob;
  let finalQuality = settings.quality;

  if (settings.targetSizeMB) {
    // Target size mode: find highest quality that fits within target
    const targetBytes = settings.targetSizeMB * 1024 * 1024;
    let minQuality = 0.1;
    let maxQuality = 1.0;
    let bestBlob: Blob | null = null;
    let bestQuality = 0.1;

    onProgress?.({
      stage: "optimizing",
      currentPage: totalPages,
      totalPages,
      message: `Finding optimal quality for ${settings.targetSizeMB} MB target...`,
      attempt: 0,
    });

    // Yield to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // First, test 100% quality to see if we even need to reduce
    onProgress?.({
      stage: "optimizing",
      currentPage: totalPages,
      totalPages,
      message: "Testing maximum quality...",
      attempt: 1,
    });
    
    const maxQualityBlob = await generatePDFFromCanvases(pages, 1.0);
    
    if (maxQualityBlob.size <= targetBytes) {
      // Even max quality fits! Use it.
      bestBlob = maxQualityBlob;
      bestQuality = 1.0;
      finalQuality = 1.0;
    } else {
      // Binary search with 6 attempts (converges to ~1.5% precision)
      const maxAttempts = 6;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const testQuality = (minQuality + maxQuality) / 2;

        onProgress?.({
          stage: "optimizing",
          currentPage: totalPages,
          totalPages,
          message: `Attempt ${attempt}/${maxAttempts}: Testing ${Math.round(testQuality * 100)}% quality...`,
          attempt,
        });

        // Yield to browser
        await new Promise(resolve => setTimeout(resolve, 0));

        const testBlob = await generatePDFFromCanvases(pages, testQuality);
        
        if (testBlob.size <= targetBytes) {
          // This quality fits, try higher quality
          bestBlob = testBlob;
          bestQuality = testQuality;
          minQuality = testQuality;
        } else {
          // Too big, need lower quality
          maxQuality = testQuality;
        }
      }

      // Multi-pass refinement: keep trying between best and max until we can't improve
      // This squeezes out maximum quality within the target
      let refinementPasses = 0;
      const maxRefinementPasses = 4;
      
      while (bestBlob && bestQuality < maxQuality - 0.005 && refinementPasses < maxRefinementPasses) {
        refinementPasses++;
        const refinedQuality = (bestQuality + maxQuality) / 2;
        
        onProgress?.({
          stage: "optimizing",
          currentPage: totalPages,
          totalPages,
          message: `Refining: Testing ${Math.round(refinedQuality * 100)}% quality...`,
        });

        await new Promise(resolve => setTimeout(resolve, 0));
        const refinedBlob = await generatePDFFromCanvases(pages, refinedQuality);
        
        if (refinedBlob.size <= targetBytes) {
          // This works, try even higher
          bestBlob = refinedBlob;
          bestQuality = refinedQuality;
        } else {
          // Too big, narrow the range
          maxQuality = refinedQuality;
        }
      }

      finalQuality = bestQuality;
    }

    // If no blob fit (target too small), use minimum quality
    if (!bestBlob) {
      onProgress?.({
        stage: "optimizing",
        currentPage: totalPages,
        totalPages,
        message: "Target too small - using minimum quality...",
      });
      bestBlob = await generatePDFFromCanvases(pages, 0.1);
      finalQuality = 0.1;
    }

    finalBlob = bestBlob;
  } else {
    // Standard mode: use specified quality
    onProgress?.({
      stage: "generating",
      currentPage: totalPages,
      totalPages,
      message: "Generating compressed PDF...",
    });

    finalBlob = await generatePDFFromCanvases(pages, settings.quality);
  }

  const duration = performance.now() - startTime;

  onProgress?.({
    stage: "complete",
    currentPage: totalPages,
    totalPages,
    message: "Compression complete!",
  });

  return {
    blob: finalBlob,
    originalSize,
    compressedSize: finalBlob.size,
    pageCount: totalPages,
    duration,
    finalQuality: settings.targetSizeMB ? finalQuality : undefined,
  };
}
