import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Stacker - AIO Tools",
  description:
    "Combine multiple code files into a single formatted document. Perfect for code reviews, documentation, or sharing. Free, fast, and private - all processing happens in your browser.",
  keywords: ["code", "stacker", "combine", "merge", "zip", "documentation", "free"],
  openGraph: {
    title: "Code Stacker - AIO Tools",
    description:
      "Combine multiple code files into a single formatted document. Free and private.",
    type: "website",
  },
};

export default function CodeStackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
