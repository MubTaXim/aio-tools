"use client";

import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  accept: string;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function DropZone({
  accept,
  maxSize = 500 * 1024 * 1024, // 500MB default
  onFileSelect,
  disabled = false,
  selectedFile,
  onClear,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Check file type
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(new RegExp(type.replace("*", ".*")));
      });

      if (!isValidType) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        setError(`File too large. Maximum: ${formatFileSize(maxSize)}`);
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [disabled, validateFile, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [validateFile, onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="border-2 border-dashed border-primary/50 rounded-xl p-6 bg-primary/5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 animate-success">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={disabled}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 animate-fade-in",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        error && "border-destructive animate-shake"
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragging ? "bg-primary/20 scale-110" : "bg-muted animate-pulse-subtle"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isDragging ? "text-primary scale-110" : "text-muted-foreground"
            )}
          />
        </div>

        <div>
          <p className="text-lg font-medium text-foreground">
            {isDragging ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse • Max {formatFileSize(maxSize)}
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
