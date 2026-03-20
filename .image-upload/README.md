# Wiki Image Upload Tool

> Automated Markdown document image uploader with batch processing and link replacement

**Quick Links:** [Installation](#-installation) · [Usage](#-usage) · [Configuration](#-configuration) · [Full Documentation](./USAGE.md)

## ✨ Features

- 🚀 **Batch Processing** - Upload multiple images concurrently (8 simultaneous uploads)
- 🔄 **Auto Sync** - Automatically sync image links between Chinese and English documents
- 🎯 **Smart Path Mapping** - Intelligent folder naming based on document names
- ⚡ **High Reliability** - All images must successfully upload before modifying any documents
- 🔍 **Dry Run Mode** - Preview changes before execution
- 🌐 **Multi-format Support** - Standard Markdown, JSX, and custom components

## 📦 Installation

```bash
cd .image-upload
yarn install
cp .env.example .env
# Edit .env file with your credentials
yarn test-api  # Verify configuration
```

## 🚀 Usage

### Basic Commands

```bash
# Preview mode (recommended for first use)
./upload-images.sh docs --dry-run

# Upload single file
./upload-images.sh docs/guide/getting-started.md

# Upload entire directory
./upload-images.sh docs/

# Force re-upload
./upload-images.sh docs --force
```

### Command Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview only, no uploads or modifications |
| `--force` | Force re-upload all images |
| `--no-cache` | Disable cache mechanism |
| `--static-dir <path>` | Manually specify static directory |

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
FILE_BROWSER_USERNAME=your_username_here
FILE_BROWSER_PASSWORD=your_password_here
```

### Configuration File (`.upload-config.json`)

Key settings:

```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "username": "${FILE_BROWSER_USERNAME}",
    "password": "${FILE_BROWSER_PASSWORD}"
  },
  "upload": {
    "concurrency": 8,
    "retryAttempts": 3
  }
}
```

**Full configuration details:** [USAGE.md](./USAGE.md#configuration)

## 📝 Image Path Standards

**Supported formats:**
```markdown
![Description](/img/path/image.png)
<img src="/img/path/image.png" />
<ZoomableImage src="/img/path/image.png" />
```

**Requirements:**
- Local images must start with `/img/`
- Files must exist in `static/img/` directory
- Already uploaded images (`https://resources.camthink.ai/wiki/img/*`) are automatically skipped

## 🗺️ Path Mapping Algorithm

The tool uses an intelligent path mapping algorithm to preserve document hierarchy in remote paths.

### How It Works

**Algorithm Steps:**
1. Extract document directory structure (excluding `docs/` prefix and filename)
2. Remove numeric prefixes from each directory level (`1-`, `2-`, `0-` → empty)
3. Extract last meaningful folder from original image path (skip product IDs like `ne301`, `ng4500`)
4. URL-encode special characters and spaces
5. Combine: `/img/` + cleaned document dirs + last image folder + filename

### Examples

#### 2-Level Document
```
Document: docs/1-neoedge-ng4500-series/0-overview.md
Image:    /img/Overview/NG45xx/NG45XX.png
Result:   /img/neoedge-ng4500-series/overview/NG45xx/NG45XX.png
          └─ Remove "1-"    └─ Add "overview" └─ Keep last folder
```

#### 4-Level Document
```
Document: docs/1-series/2-board/2-guide/3-tools/0-docker.md
Image:    /img/ne301/application-guide/monitoring/image.png
Result:   /img/series/board/guide/tools/docker/monitoring/image.png
          └─ Strip all numeric prefixes ────────────────┘
```

### Path Mapping Rules

| Rule | Example |
|------|---------|
| **Remove numeric prefixes** | `1-neoedge-ng4500-series` → `neoedge-ng4500-series` |
| **Preserve full hierarchy** | 2-5+ level directories fully preserved |
| **Handle root documents** | `docs/overview.md` → `/img/overview/...` |
| **Skip product IDs** | `/img/ne301/image.png` → skip `ne301`, use document path only |
| **URL encoding** | `架构图.png` → `%E6%9E%B6%E6%9E%84%E5%9B%BE.png` |
| **No double slashes** | Automatic path normalization |

### Benefits

- ✅ **Complete hierarchy preservation** - Remote paths reflect full document structure
- ✅ **Readable paths** - No numeric prefixes in URLs
- ✅ **Backward compatible** - Existing 2-3 level paths continue to work
- ✅ **Security** - Path traversal protection, input validation
- ✅ **URL-safe** - Automatic encoding of special characters

**Design details:** [Path Mapping Design Document](../docs/superpowers/specs/2026-03-20-image-path-mapping-enhancement-design.md)

## 🌐 Language Synchronization

The tool automatically syncs image links between Chinese and English documents:

- **Chinese → English:** `docs/...` → `i18n/en/docusaurus-plugin-content-docs/current/...`
- **English → Chinese:** `i18n/en/...` → `docs/...`

**Example:**
```bash
./upload-images.sh docs/guide.md
# Output:
# ✓ docs/guide.md (10 images)
# ✓ i18n/en/.../guide.md (10 links) - Direction: 中文 → 英文
```

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><b>Error: Environment variable not set</b></summary>

```bash
# Solution: Create .env file
cp .env.example .env
# Edit .env with your credentials
```
</details>

<details>
<summary><b>Error: Login failed (401 Unauthorized)</b></summary>

**Possible causes:**
- Incorrect username or password
- File Browser service unavailable

**Solution:**
```bash
yarn test-api  # Test API connection
```
</details>

<details>
<summary><b>Error: Upload failed</b></summary>

**Check:**
1. Image files exist in `static/img/` directory
2. File paths are correct
3. File Browser permissions

**Debug:**
```bash
yarn upload-images ../docs --dry-run  # Preview mode
```
</details>

**Full troubleshooting guide:** [USAGE.md](./USAGE.md#troubleshooting)

## 📚 Documentation

- **[USAGE.md](./USAGE.md)** - Complete usage guide with all options and examples
- **[docs/image-uploader-impl.md](./docs/image-uploader-impl.md)** - Implementation details
- **[README_cn.md](./README_cn.md)** - 中文文档

## 🔄 Workflow

```
1. Load configuration
   ↓
2. Scan Markdown files
   ↓
3. Extract local images (/img/*)
   ↓
4. Filter already uploaded images
   ↓
5. [Dry Run] → Preview and exit
   ↓
6. Batch upload images
   ↓
7. Replace Markdown links
   ↓
8. Sync to corresponding language version
   ↓
9. Complete
```

## 🛠️ Development

### Project Structure

```
.image-upload/
├── scripts/           # CLI tools
│   ├── upload-images.js
│   └── test-api.js
├── lib/               # Core library
│   ├── api-client.js
│   ├── image-uploader.js
│   ├── markdown-parser.js
│   ├── link-replacer.js
│   ├── language-sync.js
│   └── path-mapper.js
└── test/              # Test files
```

### Running Tests

```bash
# Unit tests (Jest)
yarn test                    # Run all tests
yarn test:watch              # Watch mode

# Integration tests
node test/integration-test.js  # Test with real documents

# API connection test
yarn test-api                 # Verify File Browser API
```

**Test Coverage:** 92.5% (target: 80%)
- Unit tests: 33 test cases (path-mapper.test.js)
- Integration tests: 5 test cases (integration-test.js)

**Full development guide:** [USAGE.md](./USAGE.md#development-guide)

## 📄 License

Internal Project - CamThink AI

---

**Need help?**
- Run `yarn upload-images --help` for CLI options
- Check [USAGE.md](./USAGE.md) for detailed documentation
- Run `yarn test-api` to verify configuration
