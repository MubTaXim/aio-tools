"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Search, Wrench, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

// Animated floating tool icons
function FloatingIcon({ 
  icon: Icon, 
  className, 
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
}) {
  return (
    <div 
      className={cn(
        "absolute opacity-10 animate-float",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <Icon className="h-12 w-12 text-primary" />
    </div>
  );
}

// Glitch text effect for 404
function GlitchText() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <h1 
        className={cn(
          "text-[12rem] sm:text-[16rem] font-black leading-none tracking-tighter",
          "bg-gradient-to-b from-primary via-primary/80 to-primary/20 bg-clip-text text-transparent",
          "select-none transition-all duration-100",
          glitch && "animate-glitch"
        )}
      >
        404
      </h1>
      {/* Glow effect */}
      <div className="absolute inset-0 blur-3xl opacity-20 bg-primary rounded-full scale-50" />
    </div>
  );
}

// Animated search bar decoration
function SearchDecoration() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm">
      <Search className="h-4 w-4" />
      <span className="font-mono">searching for page{dots}</span>
      <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse" />
    </div>
  );
}

export default function NotFound() {
  const availableTools = tools.filter(t => t.isAvailable).slice(0, 3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingIcon icon={Wrench} className="top-[10%] left-[10%]" delay={0} />
        <FloatingIcon icon={Sparkles} className="top-[20%] right-[15%]" delay={0.5} />
        <FloatingIcon icon={Search} className="bottom-[30%] left-[20%]" delay={1} />
        <FloatingIcon icon={Wrench} className="bottom-[20%] right-[10%]" delay={1.5} />
        <FloatingIcon icon={Sparkles} className="top-[50%] left-[5%]" delay={2} />
      </div>

      {/* Main content */}
      <div className="container max-w-screen-lg relative z-10">
        <div 
          className={cn(
            "flex flex-col items-center justify-center py-12 text-center transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* 404 Number */}
          <GlitchText />

          {/* Search decoration */}
          <div 
            className={cn(
              "mb-8 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <SearchDecoration />
          </div>

          {/* Message */}
          <div 
            className={cn(
              "space-y-4 mb-12 transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-2xl sm:text-3xl font-bold">
              Oops! This page took a wrong turn
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. 
              But don&apos;t worry, our tools are still here!
            </p>
          </div>

          {/* Action buttons */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-4 mb-16 transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Link href="/">
              <Button size="lg" className="gap-2 text-base px-8">
                <Home className="h-5 w-5" />
                Back to Home
              </Button>
            </Link>
            <Link href="/#tools">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <Wrench className="h-5 w-5" />
                Browse Tools
              </Button>
            </Link>
          </div>

          {/* Quick access to popular tools */}
          <div 
            className={cn(
              "w-full max-w-2xl transition-all duration-700 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick access to popular tools
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {availableTools.map((tool, index) => (
                <Link key={tool.id} href={tool.href}>
                  <Card 
                    className={cn(
                      "group cursor-pointer transition-all duration-300",
                      "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
                      "hover:border-primary/50"
                    )}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
