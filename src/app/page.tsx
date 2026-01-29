import { tools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool-card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const availableTools = tools.filter((t) => t.isAvailable);
  const comingSoonTools = tools.filter((t) => !t.isAvailable);

  return (
    <div className="container max-w-screen-2xl py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in-down">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          All-In-One{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-gradient">
            Web Tools
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional-grade utilities for PDFs, code, images, and more.
          Fast, free, and private — all processing happens in your browser.
        </p>
      </section>

      {/* Available Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 animate-fade-in">Available Tools</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </section>

      {comingSoonTools.length > 0 && (
        <>
          <Separator className="my-12" />

          {/* Coming Soon */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-muted-foreground animate-fade-in">
              Coming Soon
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {comingSoonTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index + availableTools.length} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

