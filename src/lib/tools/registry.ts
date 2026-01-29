export type IconName = "file-archive" | "code" | "image" | "file-json";

export interface ToolLibrary {
  name: string;
  url: string;
}

export interface ToolCredits {
  author: string;
  authorUrl?: string;
  repoUrl?: string;
  license?: string;
  libraries?: ToolLibrary[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  iconName: IconName;
  href: string;
  category: "document" | "developer" | "media";
  isAvailable: boolean;
  credits?: ToolCredits;
}

/**
 * Tool Registry - Single source of truth for all tools
 * To add a new tool:
 * 1. Create the tool page at /tools/[tool-id]/page.tsx
 * 2. Add an entry here with isAvailable: true
 * 3. Optionally add credits for attribution
 */
export const tools: Tool[] = [
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    description: "Compress PDFs by re-rasterizing pages as optimized images",
    iconName: "file-archive",
    href: "/tools/pdf-compressor",
    category: "document",
    isAvailable: true,
    credits: {
      author: "Mubtasim Hasan",
      repoUrl: "https://github.com/MubTaXim",
      license: "MIT",
      libraries: [
        { name: "PDF.js", url: "https://mozilla.github.io/pdf.js/" },
        { name: "jsPDF", url: "https://github.com/parallax/jsPDF" },
      ],
    },
  },
  {
    id: "code-stacker",
    name: "Code Stacker",
    description: "Combine multiple code files into a single formatted document",
    iconName: "code",
    href: "/tools/code-stacker",
    category: "developer",
    isAvailable: true,
    credits: {
      author: "Ntf Sadnan",
      repoUrl: "https://github.com/ntf-sadnan",
      license: "MIT",
      libraries: [
        { name: "JSZip", url: "https://stuk.github.io/jszip/" },
      ],
    },
  },
  {
    id: "image-optimizer",
    name: "Image Optimizer",
    description: "Compress and optimize images for web without quality loss",
    iconName: "image",
    href: "/tools/image-optimizer",
    category: "media",
    isAvailable: false,
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON with syntax highlighting",
    iconName: "file-json",
    href: "/tools/json-formatter",
    category: "developer",
    isAvailable: false,
  },
];

export const getToolById = (id: string): Tool | undefined => {
  return tools.find((tool) => tool.id === id);
};

export const getAvailableTools = (): Tool[] => {
  return tools.filter((tool) => tool.isAvailable);
};

export const getToolsByCategory = (category: Tool["category"]): Tool[] => {
  return tools.filter((tool) => tool.category === category);
};
