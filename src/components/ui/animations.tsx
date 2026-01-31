"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
  direction = "up",
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: "translate-y-4",
    down: "-translate-y-4",
    left: "translate-x-4",
    right: "-translate-x-4",
    none: "",
  };

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 50,
  initialDelay = 0,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={initialDelay + index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = React.useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = previousValue.current;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.round(startValue + diff * easeProgress);
      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Page wrapper that fades in content on mount
 */
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-500",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Animated card that scales on hover and fades in on mount
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <FadeIn delay={delay} className={cn(hover && "transition-transform hover:scale-[1.02] hover:shadow-lg", className)}>
      {children}
    </FadeIn>
  );
}

/**
 * Button with ripple effect on click
 */
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AnimatedButton({ children, className, onClick, ...props }: AnimatedButtonProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 500);
    onClick?.(e);
  };

  return (
    <button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripple && (
        <span
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      )}
    </button>
  );
}

/**
 * Staggered grid for tool cards or similar items
 */
interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}

export function StaggeredGrid({ children, className, itemClassName, staggerDelay = 50 }: StaggeredGridProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay} className={itemClassName}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

/**
 * Success checkmark animation
 */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <div className={cn("animate-success text-green-500", className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
      </svg>
    </div>
  );
}

/**
 * Skeleton loading placeholder
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "bg-muted animate-pulse",
        variantClasses[variant],
        className
      )}
    />
  );
}
