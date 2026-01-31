import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Compressor - AIO Tools",
  description:
    "Compress PDFs by re-rasterizing pages as optimized images. Reduce file size while maintaining readability. Free, fast, and private - all processing happens in your browser.",
  keywords: ["PDF", "compress", "reduce size", "optimize", "rasterize", "free"],
  openGraph: {
    title: "PDF Compressor - AIO Tools",
    description:
      "Compress PDFs by re-rasterizing pages as optimized images. Free and private.",
    type: "website",
  },
};

export default function PDFCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
