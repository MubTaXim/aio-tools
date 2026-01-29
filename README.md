<p align="center">
  <img src="public/logo.svg" alt="AIO Tools Logo" width="80" height="80" />
</p>

<h1 align="center">AIO Tools</h1>

<p align="center">
  <strong>Professional-grade web utilities that run entirely in your browser</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tools">Tools</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
</p>

---

## ✨ Features

- **🔒 Privacy First** — All processing happens locally in your browser. Your files never leave your device.
- **⚡ Lightning Fast** — No server round-trips. Instant processing powered by modern Web APIs.
- **🎨 Modern UI** — Beautiful, responsive interface with smooth animations and dark mode.
- **📱 Works Everywhere** — Fully responsive design that works on desktop, tablet, and mobile.
- **🆓 Completely Free** — No sign-ups, no subscriptions, no hidden costs.

---

## 🛠️ Tools

### Available Now

| Tool | Description |
|------|-------------|
| **PDF Compressor** | Compress PDFs by re-rasterizing pages as optimized images. Reduce file sizes significantly while maintaining readability. |
| **Code Stacker** | Combine multiple code files into a single formatted document. Perfect for code reviews, documentation, or sharing. |

### Coming Soon

| Tool | Description |
|------|-------------|
| **Image Optimizer** | Compress and optimize images for web without quality loss |
| **JSON Formatter** | Format, validate, and minify JSON with syntax highlighting |

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Components** | [Radix UI](https://www.radix-ui.com/) Primitives |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **PDF Processing** | [PDF.js](https://mozilla.github.io/pdf.js/) + [jsPDF](https://github.com/parallax/jsPDF) |
| **Archive Handling** | [JSZip](https://stuk.github.io/jszip/) |
| **Animations** | Custom CSS Keyframes + [Framer Motion](https://www.framer.com/motion/) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/MubTaXim/aio-tools.git

# Navigate to the project directory
cd aio-tools

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Build for Production

```bash
# Create an optimized production build
npm run build

# The static export will be in the 'out' directory
```

---

## 📦 Deployment

### GitHub Pages

This project is configured for static export and GitHub Pages deployment.

1. **Update `next.config.ts`** — Uncomment and set the `basePath` to your repository name:

   ```typescript
   const nextConfig: NextConfig = {
     output: "export",
     images: { unoptimized: true },
     basePath: "/aio-tools", // Your repo name
   };
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Deploy the `out` directory** to GitHub Pages using:
   - GitHub Actions (recommended)
   - Manual upload to `gh-pages` branch
   - Or use `gh-pages` npm package

### Other Platforms

The static export in the `out` directory can be deployed to any static hosting service:

- **Vercel** — Zero-config deployment
- **Netlify** — Drag and drop the `out` folder
- **Cloudflare Pages** — Connect your GitHub repo

---

## 📁 Project Structure

```
aio-tools/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── tools/            # Individual tool pages
│   │   │   ├── pdf-compressor/
│   │   │   └── code-stacker/
│   │   ├── layout.tsx        # Root layout with header/footer
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles & animations
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── tool-card.tsx     # Tool display card
│   │   └── drop-zone.tsx     # File upload component
│   └── lib/
│       ├── tools/            # Tool logic & registry
│       ├── utils.ts          # Utility functions
│       └── format.ts         # Formatting helpers
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-tool`
3. **Make your changes** and commit: `git commit -m 'Add amazing tool'`
4. **Push to your fork:** `git push origin feature/amazing-tool`
5. **Open a Pull Request**

### Adding a New Tool

1. Create the tool page at `src/app/tools/[tool-id]/page.tsx`
2. Add the tool logic in `src/lib/tools/[tool-id].ts`
3. Register the tool in `src/lib/tools/registry.ts`
4. Add the icon to the icon map in `src/components/tool-card.tsx`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/MubTaXim">MubTaXim</a>
</p>
