import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator Pro - AIO Tools",
  description:
    "Generate professional QR codes with custom colors, logos, and styles. Download as PNG, SVG, or JPEG. Free, fast, and private - all processing happens in your browser.",
  keywords: [
    "QR code",
    "QR generator",
    "custom QR",
    "QR with logo",
    "free QR code",
    "QR code maker",
  ],
  openGraph: {
    title: "QR Code Generator Pro - AIO Tools",
    description:
      "Generate professional QR codes with custom colors, logos, and styles. Free and private.",
    type: "website",
  },
};

export default function QRCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
