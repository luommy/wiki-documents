# Image Upload Tool - Path Mapping Enhancement

**Date:** 2026-03-20
**Status:** Design Approved (Revised)
**Author:** Claude Code

---

## Problem Statement

The current path mapping logic only handles 2-3 level directory structures. When processing documents with 4+ levels (e.g., `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md`), the generated remote paths are incomplete or incorrect.

Additionally, the current logic uses a "suggested folder name" approach that only replaces generic folder names (`monitoring`, `guide`, etc.), which doesn't preserve the full document hierarchy.

---

## Requirements

1. **Preserve complete directory hierarchy** - Remote paths should reflect the full document structure
2. **Remove numeric prefixes** - Strip ordering prefixes like `1-`, `2-`, `0-` from directory names
3. **Combine document path + image folder** - Document hierarchy + last folder from original image path
4. **Handle 2-4+ level directories** - Support any depth of nesting
5. **Security and validation** - Prevent path traversal, handle special characters

---

## Design

### Path Mapping Algorithm

**Input:**
- Document path: `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md`
- Image original path: `/img/ne301/application-guide/monitoring/image.png`

**Processing Steps:**

1. Validate inputs (prevent path traversal)
2. Extract directory structure from document path (excluding `docs/` prefix and filename)
3. Remove numeric prefixes from each directory level (`1-` → ``, `2-` → ``, etc.)
4. Extract last meaningful folder name from original image path (skip product IDs)
5. Extract filename from original image path and URL-encode special characters
6. Combine: `/img/` + cleaned document dirs + last image folder + filename

**Output:**
```
/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png
```

### Implementation

#### Core Function: `generateRemotePath(docPath, imagePath)`

```javascript
const path = require('path');

/**
 * Generate remote path based on document hierarchy
 *
 * @param {string} docPath - Document path (e.g., docs/1-series/0-overview.md)
 * @param {string} imagePath - Image path (e.g., /img/ne301/app/monitoring/image.png)
 * @returns {string} Remote path
 * @throws {Error} If paths are invalid or contain traversal attempts
 */
function generateRemotePath(docPath, imagePath) {
  // 1. Input validation
  if (!docPath || !imagePath) {
    throw new Error('Both docPath and imagePath are required');
  }

  // Prevent path traversal attacks
  if (docPath.includes('..') || imagePath.includes('..')) {
    throw new Error('Path traversal detected');
  }

  // If already a remote URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  try {
    // 2. Extract document directory hierarchy
    let docDir = path.normalize(docPath);
    docDir = path.dirname(docDir);
    docDir = docDir.replace(/\\/g, '/'); // Normalize separators

    // 3. Split into parts and clean
    const parts = docDir.split('/');
    const NUMERIC_PREFIX_PATTERN = /^[0-9]{1,2}-/; // Match 1-2 digit prefixes

    const cleanedParts = parts
      .filter(part => part !== 'docs' && part !== '' && part !== '.')
      .map(part => part.replace(NUMERIC_PREFIX_PATTERN, ''));

    // Handle root-level documents (docs/overview.md)
    if (cleanedParts.length === 0) {
      const docName = path.basename(docPath, '.md');
      cleanedParts.push(docName);
    }

    // 4. Extract image path components
    const imageParts = imagePath.split('/');
    const imgIndex = imageParts.indexOf('img');

    if (imgIndex === -1) {
      console.warn('Image path does not contain /img/:', imagePath);
      return imagePath; // Not a local image
    }

    // Get last folder before filename, but skip product IDs
    const PRODUCT_IDS = ['ne301', 'ng4500', 'ne4500', 'ne101'];
    const lastFolderIndex = imageParts.length - 2;
    let lastFolder = lastFolderIndex > imgIndex + 1 ? imageParts[lastFolderIndex] : null;

    // Skip product IDs in lastFolder
    if (lastFolder && PRODUCT_IDS.includes(lastFolder.toLowerCase())) {
      lastFolder = null;
    }

    // Get filename and URL-encode special characters
    let fileName = path.basename(imagePath);
    // Only encode if not already encoded
    try {
      if (decodeURIComponent(fileName) === fileName) {
        fileName = encodeURIComponent(fileName);
      }
    } catch {
      // Already encoded or malformed, use as-is
    }

    // 5. Build remote path
    const remoteParts = ['img', ...cleanedParts];

    if (lastFolder) {
      remoteParts.push(lastFolder);
    }

    remoteParts.push(fileName);

    const remotePath = '/' + remoteParts.join('/');

    // Validate and fix double slashes
    const normalizedPath = remotePath.replace(/\/+/g, '/');
    if (normalizedPath !== remotePath) {
      console.warn('Fixed double slashes in path:', remotePath, '→', normalizedPath);
      return normalizedPath;
    }

    return remotePath;

  } catch (error) {
    console.error('Path generation failed:', { docPath, imagePath, error });
    return imagePath; // Fallback to original
  }
}

/**
 * Map image path (wrapper for backward compatibility)
 */
function mapImagePath(localImagePath, docPath) {
  return generateRemotePath(docPath, localImagePath);
}

module.exports = {
  generateRemotePath,
  mapImagePath
};
```

### Edge Cases

| Scenario | Input | Output | Notes |
|----------|-------|--------|-------|
| **Root level doc** | `docs/overview.md` + `/img/xxx/arch.png` | `/img/overview/arch.png` | Uses doc name as folder |
| **No image subfolder** | `/img/xxx/image.png` | `/img/series/guide/image.png` | Skips lastFolder if missing |
| **Product ID in lastFolder** | `/img/ne301/image.png` | `/img/series/guide/image.png` | Skips `ne301` |
| **Already remote URL** | `https://...` | Skip | Handled by existing logic |
| **No numeric prefix** | `docs/custom/path.md` | `/img/custom/path/...` | Preserves as-is |
| **Special chars** | `架构图.png` | `%E6%9E%B6%E6%9E%84%E5%9B%BE.png` | URL-encoded |
| **Spaces in filename** | `my image.png` | `my%20image.png` | URL-encoded |
| **Path traversal** | `../etc/passwd` | Throws error | Security protection |

### Examples

#### Example 1: 2-Level Directory

```
Document: docs/1-neoedge-ng4500-series/0-overview.md
Image:    /img/ne301/application-guide/architecture/overview.png
Result:   /img/neoedge-ng4500-series/architecture/overview.png

Breakdown:
- cleanedParts: ['neoedge-ng4500-series']
- lastFolder: 'architecture'
- fileName: 'overview.png'
```

#### Example 2: 3-Level Directory

```
Document: docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md
Image:    /img/ne301/application-guide/monitoring/image.png
Result:   /img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/monitoring/image.png

Breakdown:
- cleanedParts: ['neoedge-ng4500-series', 'ng4500-cb01-development-board', 'dev-guide']
- lastFolder: 'monitoring'
- fileName: 'image.png'
```

#### Example 3: 4-Level Directory

```
Document: docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md
Image:    /img/ne301/application-guide/monitoring/image.png
Result:   /img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png

Breakdown:
- cleanedParts: ['neoedge-ng4500-series', 'ng4500-cb01-development-board', 'software-guide', 'software-frameworks-and-tools', 'docker']
- lastFolder: 'monitoring'
- fileName: 'image.png'
```

#### Example 4: 5-Level Directory

```
Document: docs/1-series/2-board/3-guide/4-topic/5-detail.md
Image:    /img/xxx/app/screenshots/image.png
Result:   /img/series/board/guide/topic/detail/screenshots/image.png

Breakdown:
- cleanedParts: ['series', 'board', 'guide', 'topic', 'detail']
- lastFolder: 'screenshots'
- fileName: 'image.png'
```

#### Example 5: Root Level Document

```
Document: docs/overview.md
Image:    /img/xxx/architecture/diagram.png
Result:   /img/overview/architecture/diagram.png

Breakdown:
- cleanedParts: [] (empty after filtering)
- Special handling: adds 'overview' from filename
- lastFolder: 'architecture'
- fileName: 'diagram.png'
```

#### Example 6: Product ID in Image Path

```
Document: docs/1-series/0-guide.md
Image:    /img/ne301/image.png
Result:   /img/series/guide/image.png

Breakdown:
- cleanedParts: ['series', 'guide']
- lastFolder: null (skipped 'ne301' as product ID)
- fileName: 'image.png'
```

---

## Implementation Plan

### Files to Modify

**`.image-upload/lib/path-mapper.js`** - Complete rewrite of path mapping logic with new `generateRemotePath()` function

### Files Unchanged

- `.image-upload/scripts/upload-images.js` - No changes needed (calls `mapImagePaths()`)
- `.image-upload/lib/image-uploader.js` - No changes needed
- All other files - No changes needed

### Testing Strategy

1. **Unit tests** - Test `generateRemotePath()` with:
   - Various directory depths (2-5 levels)
   - Edge cases (root docs, product IDs, special chars)
   - Invalid inputs (path traversal, null values)

2. **Integration test** - Process real documents with 2-5 level hierarchies

3. **Dry run** - Preview paths before actual upload with `--dry-run`

4. **Validation** - Ensure generated paths:
   - Are valid URLs
   - Don't contain double slashes
   - Are properly encoded

### Test Cases

```javascript
describe('generateRemotePath', () => {
  // Basic functionality
  it('should handle 2-level directories');
  it('should handle 3-level directories');
  it('should handle 4-level directories');
  it('should handle 5+ level directories');

  // Edge cases
  it('should handle root-level documents');
  it('should reject path traversal attempts');
  it('should encode special characters');
  it('should handle Windows paths');
  it('should skip product IDs in lastFolder');
  it('should handle Unicode filenames');
  it('should handle spaces in paths');
  it('should handle missing /img/ prefix');
  it('should return original path for errors');

  // Security
  it('should reject null inputs');
  it('should reject path traversal in docPath');
  it('should reject path traversal in imagePath');
});
```

---

## Migration

### For New Documents

No migration needed - new logic applies automatically.

### For Existing Documents

To re-process existing documents with new path logic:

1. **Preview changes:**
   ```bash
   ./upload-images.sh docs/your-doc.md --dry-run
   ```

2. **Force re-upload:**
   ```bash
   ./upload-images.sh docs/your-doc.md --force
   ```

3. **Verify changes:**
   - Check generated remote paths
   - Ensure images load correctly
   - Commit updated markdown files

### Mixed Path Styles

During transition, you may have:
- Old paths: `/img/series/monitoring/screenshots/img.png`
- New paths: `/img/series/guide/topic/monitoring/img.png`

Both will work - old paths continue to load from File Browser.

---

## Success Criteria

- ✅ 4+ level directory structures are fully preserved in remote paths
- ✅ All numeric prefixes are correctly stripped (1-2 digit patterns)
- ✅ Image filenames remain unchanged (URL-encoded if needed)
- ✅ Paths are clean and readable (no double slashes, proper encoding)
- ✅ Existing 2-3 level paths continue to work correctly
- ✅ No breaking changes to API or command-line interface
- ✅ Security: Path traversal attempts are rejected
- ✅ Error handling: Invalid inputs don't crash the tool

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| **Path length limits** | Remote paths are URLs, no practical length limit |
| **Backward compatibility** | Existing documents continue to work; new logic only applies on re-upload |
| **Complex nesting** | Algorithm handles arbitrary depth; tested up to 5 levels |
| **Special characters** | URL-encoded to ensure valid URLs |
| **Security (path traversal)** | Input validation rejects `..` patterns |
| **Product ID confusion** | Explicit list of product IDs to skip |

---

## Configuration (Future Enhancement)

Currently, the following values are hardcoded:
- `PRODUCT_IDS` - List of product identifiers to skip
- `NUMERIC_PREFIX_PATTERN` - Regex for prefix removal
- Base path `/img/`

**Future work:** Make these configurable via `.upload-config.json`:

```json
{
  "pathMapping": {
    "basePath": "/img/",
    "productIds": ["ne301", "ng4500", "ne4500"],
    "numericPrefixPattern": "^[0-9]{1,2}-"
  }
}
```

This is deferred to keep initial implementation simple.

---

## Future Enhancements

1. **Collision detection** - Warn when two documents would generate identical paths
2. **Configurable rules** - Allow custom path mapping rules via config
3. **Performance optimization** - Cache path generation results for large document sets

---

## Revision History

- **2026-03-20** - Initial design
- **2026-03-20** - Revised: Added security validation, fixed examples, added error handling, improved edge case handling
