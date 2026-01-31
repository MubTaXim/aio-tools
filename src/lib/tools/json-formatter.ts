/**
 * JSON Formatter Engine
 * 
 * Provides formatting, validation, minification, and repair for JSON data.
 */

export interface FormatOptions {
  indentSize: number; // 2, 4, or tab
  indentChar: "space" | "tab";
  sortKeys: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
    position?: number;
  };
}

export interface FormatResult {
  success: boolean;
  output: string;
  error?: string;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indentSize: 2,
  indentChar: "space",
  sortKeys: false,
};

/**
 * Validate JSON string and return detailed error info
 */
export function validateJSON(input: string): ValidationResult {
  if (!input.trim()) {
    return { isValid: false, error: { message: "Input is empty" } };
  }

  try {
    JSON.parse(input);
    return { isValid: true };
  } catch (e) {
    const error = e as SyntaxError;
    const match = error.message.match(/at position (\d+)/);
    const position = match ? parseInt(match[1], 10) : undefined;
    
    // Calculate line and column from position
    let line: number | undefined;
    let column: number | undefined;
    
    if (position !== undefined) {
      const lines = input.substring(0, position).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      isValid: false,
      error: {
        message: error.message,
        line,
        column,
        position,
      },
    };
  }
}

/**
 * Format JSON with specified options
 */
export function formatJSON(input: string, options: FormatOptions = DEFAULT_FORMAT_OPTIONS): FormatResult {
  const validation = validateJSON(input);
  
  if (!validation.isValid) {
    return {
      success: false,
      output: input,
      error: validation.error?.message,
    };
  }

  try {
    let parsed = JSON.parse(input);
    
    // Sort keys if requested
    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    
    const indent = options.indentChar === "tab" ? "\t" : " ".repeat(options.indentSize);
    const formatted = JSON.stringify(parsed, null, indent);
    
    return {
      success: true,
      output: formatted,
    };
  } catch (e) {
    return {
      success: false,
      output: input,
      error: (e as Error).message,
    };
  }
}

/**
 * Minify JSON (remove all whitespace)
 */
export function minifyJSON(input: string): FormatResult {
  const validation = validateJSON(input);
  
  if (!validation.isValid) {
    return {
      success: false,
      output: input,
      error: validation.error?.message,
    };
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    
    return {
      success: true,
      output: minified,
    };
  } catch (e) {
    return {
      success: false,
      output: input,
      error: (e as Error).message,
    };
  }
}

/**
 * Attempt to fix common JSON errors
 */
export function repairJSON(input: string): FormatResult {
  let repaired = input;
  
  // Fix trailing commas in arrays and objects
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
  
  // Fix single quotes to double quotes
  repaired = repaired.replace(/'/g, '"');
  
  // Fix unquoted keys (simple cases)
  repaired = repaired.replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  
  // Fix missing quotes around string values (simple cases)
  // This is tricky and might not work for all cases
  
  // Validate the repaired JSON
  const validation = validateJSON(repaired);
  
  if (validation.isValid) {
    return formatJSON(repaired);
  }
  
  return {
    success: false,
    output: repaired,
    error: "Could not automatically repair JSON. " + (validation.error?.message || ""),
  };
}

/**
 * Recursively sort object keys alphabetically
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    
    for (const key of keys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    
    return sorted;
  }
  
  return obj;
}

/**
 * Get statistics about the JSON
 */
export function getJSONStats(input: string): {
  keys: number;
  values: number;
  depth: number;
  size: { original: number; minified: number };
} | null {
  const validation = validateJSON(input);
  if (!validation.isValid) return null;

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    
    let keys = 0;
    let values = 0;
    let maxDepth = 0;

    function traverse(obj: unknown, depth: number) {
      maxDepth = Math.max(maxDepth, depth);
      
      if (Array.isArray(obj)) {
        values += obj.length;
        obj.forEach((item) => traverse(item, depth + 1));
      } else if (obj !== null && typeof obj === "object") {
        const objKeys = Object.keys(obj as Record<string, unknown>);
        keys += objKeys.length;
        objKeys.forEach((key) => traverse((obj as Record<string, unknown>)[key], depth + 1));
      } else {
        values++;
      }
    }

    traverse(parsed, 0);

    return {
      keys,
      values,
      depth: maxDepth,
      size: {
        original: new Blob([input]).size,
        minified: new Blob([minified]).size,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Convert JSON to different formats
 */
export function convertToFormat(input: string, format: "typescript" | "yaml-like"): FormatResult {
  const validation = validateJSON(input);
  if (!validation.isValid) {
    return { success: false, output: input, error: validation.error?.message };
  }

  try {
    const parsed = JSON.parse(input);
    
    if (format === "typescript") {
      return {
        success: true,
        output: `const data = ${JSON.stringify(parsed, null, 2)} as const;`,
      };
    }
    
    // Simple YAML-like output (not full YAML spec)
    if (format === "yaml-like") {
      return {
        success: true,
        output: toYamlLike(parsed, 0),
      };
    }

    return { success: false, output: input, error: "Unknown format" };
  } catch (e) {
    return { success: false, output: input, error: (e as Error).message };
  }
}

function toYamlLike(obj: unknown, indent: number): string {
  const spaces = "  ".repeat(indent);
  
  if (obj === null) return "null";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") return `"${obj}"`;
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => `${spaces}- ${toYamlLike(item, indent + 1).trimStart()}`).join("\n");
  }
  
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        const valueStr = toYamlLike(value, indent + 1);
        if (typeof value === "object" && value !== null) {
          return `${spaces}${key}:\n${valueStr}`;
        }
        return `${spaces}${key}: ${valueStr}`;
      })
      .join("\n");
  }
  
  return String(obj);
}
