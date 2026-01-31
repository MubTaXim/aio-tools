# AIO Tools - Development Roadmap

> **Philosophy**: Build tools people would pay for, then give them free. Quality over quantity.

---

## 📊 Progress Overview

| Category | Completed | In Progress | Planned |
|----------|-----------|-------------|---------|
| Document Tools | 1 | 0 | 4 |
| Developer Tools | 1 | 0 | 1 |
| Media Tools | 1 | 0 | 5 |
| **Total** | **3** | **0** | **10** |

---

## ✅ Completed Tools

### PDF Compressor
- **Status**: ✅ Complete
- **Category**: Document
- **Features**: Quality-based compression, target size mode, DPI control
- **Libraries**: pdf.js, jsPDF

### Code Stacker
- **Status**: ✅ Complete
- **Category**: Developer
- **Features**: Combine code files from ZIP, smart filtering, formatted output
- **Libraries**: JSZip

### QR Code Generator Pro
- **Status**: ✅ Complete
- **Category**: Media
- **Features**: Custom colors, logo support, 3 styles (square/rounded/dots), error correction levels, PNG/SVG/JPEG download, sizes 128-2048px, real-time preview
- **Libraries**: qrcode

---

## 🚀 Phase 1: Quick Wins

### 1. JSON Formatter
- **Status**: 🔲 Not Started
- **Category**: Developer
- **Priority**: High
- **Estimated Time**: 30-45 minutes
- **Features**:
  - [ ] Format/beautify JSON with indentation options (2/4 spaces, tabs)
  - [ ] Minify JSON (remove whitespace)
  - [ ] Validate JSON with error highlighting
  - [ ] Syntax highlighting with line numbers
  - [ ] Tree view visualization
  - [ ] Copy formatted output
  - [ ] Download as .json file
  - [ ] Fix common JSON errors (trailing commas, single quotes)
- **Libraries**: None (built-in JSON.parse/stringify)
- **Notes**: Every developer uses this daily. Competitors are full of ads.

### 2. QR Code Generator Pro
- **Status**: ✅ Complete
- **Category**: Media
- **Priority**: High
- **Estimated Time**: 2-3 hours
- **Features**:
  - [x] Generate QR codes from text/URL
  - [x] Custom colors (foreground/background)
  - [x] Logo/image in center
  - [x] Custom shapes (square, rounded, dots)
  - [x] Error correction levels (L/M/Q/H)
  - [x] Download as PNG, SVG, JPEG
  - [x] Custom sizes (128px to 2048px)
  - [ ] Frames/templates (social media, business card style)
  - [ ] Bulk generation from list
  - [x] Preview in real-time
- **Libraries**: `qrcode`
- **Notes**: Paid tools charge $5-20/mo for these features. We give FREE.

---

## 🖼️ Phase 2: Image Suite

### 3. Image Compressor
- **Status**: 🔲 Not Started
- **Category**: Media
- **Priority**: High
- **Estimated Time**: 2 hours
- **Features**:
  - [ ] Compress JPEG, PNG, WebP, GIF
  - [ ] Quality slider with preview
  - [ ] Bulk compression (multiple files)
  - [ ] Before/after comparison slider
  - [ ] Show size reduction percentage
  - [ ] Preserve EXIF data option
  - [ ] Download as ZIP for bulk
- **Libraries**: Browser Canvas API, `browser-image-compression`
- **Notes**: TinyPNG alternative. People pay for bulk processing.

### 4. Image Resizer
- **Status**: 🔲 Not Started
- **Category**: Media
- **Priority**: High
- **Estimated Time**: 1.5 hours
- **Features**:
  - [ ] Resize by dimensions (width x height)
  - [ ] Resize by percentage
  - [ ] Maintain aspect ratio toggle
  - [ ] Preset sizes (social media: Instagram, Twitter, Facebook, LinkedIn)
  - [ ] Bulk resize
  - [ ] Crop functionality
  - [ ] Rotate/flip
- **Libraries**: Browser Canvas API
- **Notes**: Essential for social media managers.

### 5. Background Remover
- **Status**: 🔲 Not Started
- **Category**: Media
- **Priority**: Medium
- **Estimated Time**: 3-4 hours
- **Features**:
  - [ ] AI-powered background removal
  - [ ] Manual refinement tools
  - [ ] Replace background with color/image
  - [ ] Download as PNG with transparency
  - [ ] Batch processing
- **Libraries**: `@imgly/background-removal` or TensorFlow.js
- **Notes**: remove.bg charges credits. We do it FREE in browser.

### 6. Image Enhancer
- **Status**: 🔲 Not Started
- **Category**: Media
- **Priority**: Medium
- **Estimated Time**: 2-3 hours
- **Features**:
  - [ ] AI upscaling (2x, 4x)
  - [ ] Sharpen/denoise
  - [ ] Brightness/contrast adjustment
  - [ ] Auto-enhance with one click
  - [ ] Before/after comparison
- **Libraries**: TensorFlow.js, waifu2x models
- **Notes**: Most AI enhancers are paid or have limits.

### 7. Image Converter
- **Status**: 🔲 Not Started
- **Category**: Media
- **Priority**: Medium
- **Estimated Time**: 1 hour
- **Features**:
  - [ ] Convert between PNG, JPG, WebP, AVIF, GIF
  - [ ] Bulk conversion
  - [ ] Quality settings per format
  - [ ] Preserve transparency where supported
- **Libraries**: Browser Canvas API
- **Notes**: Simple but essential utility.

---

## 📄 Phase 3: PDF Suite Expansion

### 8. PDF Merger
- **Status**: 🔲 Not Started
- **Category**: Document
- **Priority**: High
- **Estimated Time**: 1.5 hours
- **Features**:
  - [ ] Combine multiple PDFs into one
  - [ ] Drag to reorder pages
  - [ ] Preview thumbnails
  - [ ] Select specific pages from each PDF
- **Libraries**: pdf-lib
- **Notes**: Very common need, simple to implement.

### 9. PDF Splitter
- **Status**: 🔲 Not Started
- **Category**: Document
- **Priority**: High
- **Estimated Time**: 1.5 hours
- **Features**:
  - [ ] Extract specific pages
  - [ ] Split by page ranges
  - [ ] Split into individual pages
  - [ ] Preview pages before splitting
- **Libraries**: pdf-lib
- **Notes**: Companion to PDF Merger.

### 10. PDF to Image
- **Status**: 🔲 Not Started
- **Category**: Document
- **Priority**: Medium
- **Estimated Time**: 1 hour
- **Features**:
  - [ ] Convert PDF pages to PNG/JPG
  - [ ] Select DPI/quality
  - [ ] Batch convert all pages
  - [ ] Download as ZIP
- **Libraries**: pdf.js (already have)
- **Notes**: Reuses existing PDF.js setup.

### 11. Image to PDF
- **Status**: 🔲 Not Started
- **Category**: Document
- **Priority**: Medium
- **Estimated Time**: 1 hour
- **Features**:
  - [ ] Combine multiple images into PDF
  - [ ] Drag to reorder
  - [ ] Page size options (A4, Letter, fit to image)
  - [ ] Margin settings
  - [ ] Compression options
- **Libraries**: jsPDF (already have)
- **Notes**: Reuses existing jsPDF setup.

---

## 🚫 Tools We're NOT Building

These are low-value or already available everywhere:

| Tool | Reason |
|------|--------|
| Lorem Ipsum Generator | Too simple, everywhere |
| Random Password Generator | Browsers do this |
| Unit Converters | Google handles it |
| Countdown Timer | Not a utility tool |
| Simple text counters | Too basic |
| Emoji Picker | OS built-in |
| Calculator | Every device has one |

---

## 🏗️ Technical Debt & Improvements

- [ ] Add filter tabs to homepage when tools > 6
- [ ] Add search functionality when tools > 10
- [ ] Implement service worker for offline support
- [ ] Add PWA manifest for installability
- [ ] Performance audit and optimization
- [ ] Add analytics (privacy-respecting)
- [ ] SEO optimization for each tool page

---

## 📝 Implementation Checklist (Per Tool)

When building a new tool, follow this checklist:

1. **Planning**
   - [ ] Define all features
   - [ ] Choose libraries
   - [ ] Design UI mockup

2. **Implementation**
   - [ ] Create `lib/tools/[tool-name].ts` (logic)
   - [ ] Create `app/tools/[tool-name]/page.tsx` (UI)
   - [ ] Create `app/tools/[tool-name]/layout.tsx` (SEO metadata)
   - [ ] Update `lib/tools/registry.ts` (add to registry)

3. **Testing**
   - [ ] Test with various inputs
   - [ ] Test edge cases
   - [ ] Test on mobile
   - [ ] Performance check

4. **Polish**
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Add helpful tooltips
   - [ ] Write clear descriptions

---

## 📅 Development Log

### January 30, 2026
- ✅ Project setup complete
- ✅ PDF Compressor built
- ✅ Code Stacker built
- ✅ 404 page designed
- ✅ Error boundaries added
- ✅ Loading states added
- ✅ SEO metadata per tool
- 📝 Roadmap created

---

## 🎯 Next Up

**Starting with**: JSON Formatter

Ready to implement? Let's go! 🚀
