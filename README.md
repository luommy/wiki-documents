<div align="center">

# CamThink Wiki Documentation

[![License](https://img.shields.io/badge/Proprietary-blue?style=flat-square)](LICENSE)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.6.1-25C2A0?style=flat-square&logo=docusaurus)](https://docusaurus.io/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

**Official documentation for CamThink AI hardware products**

[🌐 Live Site](https://wiki.camthink.ai) · [📚 Preview](https://camthink-ai.github.io/wiki-documents/) · [🐛 Report Bug](https://github.com/camthink-ai/wiki-documents/issues)

</div>

---

## Overview

Product documentation website built with Docusaurus 3.6.1, featuring bilingual support (Chinese/English), local search, image zoom, and Mermaid diagrams.

**Product Lines:** NG4500 (Edge Computing) · NE101 (Smart Cameras) · NE301 (Advanced Cameras) · Hardware Resources · AI Applications

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0
- **Yarn** 1.22+

### Installation

```bash
git clone https://github.com/camthink-ai/wiki-documents.git
cd wiki-documents
yarn install
```

### Development

```bash
yarn start        # Start dev server at localhost:3000
yarn build        # Build for production
yarn serve        # Serve production build
```

---

## 📖 Documentation Guide

### Structure

```
wiki-documents/
├── docs/                    # Chinese documentation
├── i18n/en/                 # English translations
├── static/img/              # Static images
└── .image-upload/           # Image upload tool
```

### Writing Docs

**Frontmatter (required):**
```yaml
---
id: unique-doc-id
title: Document Title
sidebar_position: 1
---
```

**Image formats:**
```markdown
![Description](/img/path/image.png)
<img src="/img/path/image.png" style={{maxWidth: '80%'}} />
<ZoomableImage src="/img/path/image.png" alt="Description" />
```

---

## 🖼️ Image Upload Tool

Upload local images to File Browser and replace paths with remote URLs.

```bash
cd .image-upload
yarn install
cp .env.example .env    # Configure credentials

# Usage from project root
./upload-images.sh docs/your-document.md
./upload-images.sh docs --dry-run    # Preview mode
```

**Features:** Concurrent uploads · Auto-sync CN/EN docs · Smart folder naming

**📖 [Full Documentation](./.image-upload/README.md)**

---

## 📚 Resources

- [Docusaurus Docs](https://docusaurus.io/)
- [CamThink Website](https://www.camthink.ai)
- [Image Upload Tool](./.image-upload/README.md)

---

<div align="center">

**Built with ❤️ using Docusaurus**

</div>
