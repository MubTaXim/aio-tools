import JSZip from "jszip";

export interface StackerProgress {
  phase: "loading" | "extracting" | "processing" | "complete";
  message: string;
  processedFiles: number;
  totalFiles: number;
}

export interface StackerResult {
  output: string;
  processedCount: number;
  skippedCount: number;
  skippedFiles: string[];
  filename: string;
}

// List of common image file extensions to ignore (case-insensitive)
const IGNORED_IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp", ".svg", ".ico",
  ".avif", ".apng", ".jfif", ".pjpeg", ".pjp"
]);

// List of common binary/compiled/lock files to ignore
const IGNORED_BINARY_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".o", ".a", ".lib", ".jar", ".war", ".ear", ".class",
  ".pyc", ".pyo", ".pyd", ".DS_Store", ".lock", ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".ppt", ".pptx", ".zip", ".tar", ".gz", ".rar", ".7z", ".iso", ".dmg", ".app",
  ".mp3", ".mp4", ".avi", ".mov", ".flv", ".wmv", ".mkv", ".webm", ".ogg", ".wav",
  ".eot", ".ttf", ".woff", ".woff2", // fonts
  ".psd", ".ai", ".eps", // design files
]);

// Directories to ignore
const IGNORED_DIRECTORIES = new Set([
  "node_modules", "__pycache__", ".git", ".svn", ".hg", ".vscode", ".idea",
  "vendor", "dist", "build", "target", "out", "bin", "obj", "venv", "env",
  "pods", "cmake-build-debug", "cmake-build-release"
]);

function getFileExtension(filename: string): string {
  const name = filename || "";
  const lastDot = name.lastIndexOf(".");
  if (lastDot === -1 || lastDot === 0 || lastDot === name.length - 1) {
    return "";
  }
  return name.substring(lastDot).toLowerCase();
}

function shouldIgnorePath(entryPath: string): { ignore: boolean; reason?: string } {
  const segments = entryPath.split("/").filter(s => s.length > 0);
  
  // Check for ignored directories
  for (const segment of segments) {
    if (IGNORED_DIRECTORIES.has(segment.toLowerCase())) {
      return { ignore: true, reason: "ignored directory" };
    }
  }
  
  // Check for dotfiles/dotfolders
  const isDotFileOrFolder = segments.some(
    segment => segment.startsWith(".") && segment !== ".well-known"
  );
  if (isDotFileOrFolder) {
    return { ignore: true, reason: "dotfile/dotfolder" };
  }
  
  // Check file extension
  const ext = getFileExtension(entryPath);
  if (IGNORED_IMAGE_EXTENSIONS.has(ext)) {
    return { ignore: true, reason: "image file" };
  }
  if (IGNORED_BINARY_EXTENSIONS.has(ext)) {
    return { ignore: true, reason: "binary file" };
  }
  
  return { ignore: false };
}

function isBinaryContent(content: string): boolean {
  // Check for null bytes or control characters in first 1024 chars
  const sample = content.substring(0, 1024);
  return content.includes("\u0000") || /[\x00-\x08\x0E-\x1F]/.test(sample);
}

export async function processZipFile(
  file: File,
  onProgress?: (progress: StackerProgress) => void
): Promise<StackerResult> {
  const report = (phase: StackerProgress["phase"], message: string, processed = 0, total = 0) => {
    onProgress?.({ phase, message, processedFiles: processed, totalFiles: total });
  };
  
  report("loading", "Reading ZIP file...");
  
  const arrayBuffer = await file.arrayBuffer();
  
  report("extracting", "Extracting ZIP contents...");
  
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Collect all files to process
  const entries: { path: string; entry: JSZip.JSZipObject }[] = [];
  const skippedFiles: string[] = [];
  
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    
    const normalizedPath = relativePath.replace(/\\/g, "/");
    const { ignore, reason } = shouldIgnorePath(normalizedPath);
    
    if (ignore) {
      skippedFiles.push(`${normalizedPath} (${reason})`);
    } else {
      entries.push({ path: normalizedPath, entry: zipEntry });
    }
  });
  
  report("processing", `Processing ${entries.length} files...`, 0, entries.length);
  
  let outputString = "";
  let processedCount = 0;
  
  for (let i = 0; i < entries.length; i++) {
    const { path, entry } = entries[i];
    
    try {
      const content = await entry.async("string");
      
      if (isBinaryContent(content)) {
        outputString += `\`\`\`${path}\n`;
        outputString += `[Content appears to be binary or non-UTF8, skipped]\n`;
        outputString += "```\n\n";
        skippedFiles.push(`${path} (binary content)`);
      } else {
        outputString += `\`\`\`${path}\n`;
        outputString += content.trimEnd();
        outputString += "\n```\n\n";
      }
      processedCount++;
    } catch {
      outputString += `\`\`\`${path}\n`;
      outputString += `[Error reading file content]\n`;
      outputString += "```\n\n";
      skippedFiles.push(`${path} (read error)`);
      processedCount++;
    }
    
    // Report progress every 10 files
    if (i % 10 === 0 || i === entries.length - 1) {
      report("processing", `Processing files... (${i + 1}/${entries.length})`, i + 1, entries.length);
      // Yield to browser
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  report("complete", "Processing complete!", processedCount, entries.length);
  
  // Generate output filename
  const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
  
  return {
    output: outputString.trimEnd(),
    processedCount,
    skippedCount: skippedFiles.length,
    skippedFiles,
    filename: `${originalName}_stack.txt`,
  };
}
