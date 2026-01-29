"use client";

import Link from "next/link";
import { FileArchive, Code, Image, FileJson } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tool, IconName } from "@/lib/tools/registry";

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  "file-archive": FileArchive,
  "code": Code,
  "image": Image,
  "file-json": FileJson,
};

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const Icon = iconMap[tool.iconName];

  if (!tool.isAvailable) {
    return (
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Card className="relative overflow-hidden opacity-60 cursor-not-allowed">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={tool.href}>
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 active:scale-[0.98] cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {tool.name}
            </CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
