import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter - AIO Tools",
  description:
    "Format, validate, minify, and repair JSON online. Free JSON beautifier with syntax highlighting, error detection, and tree view. No ads, no limits.",
  keywords: ["JSON", "formatter", "beautifier", "validator", "minify", "pretty print", "free"],
  openGraph: {
    title: "JSON Formatter - AIO Tools",
    description:
      "Format, validate, and beautify JSON online. Free with no limits.",
    type: "website",
  },
};

export default function JSONFormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
