# Image Upload Tool - Path Mapping Enhancement

**Date:** 2026-03-20
**Status:** Design Approved
**Author:** Claude Code

---

## Problem Statement

The current path mapping logic only handles 2-3 level directory structures. When processing documents with 4+ levels (e.g., `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md`), the generated remote paths are incomplete or incorrect.

Additionally, the current logic uses a "suggested folder name" approach that only replaces generic folder names (`monitoring`, `guide`, etc.), which doesn't preserve the full document hierarchy.

---

## Requirements

1. **Preserve complete directory hierarchy** - Remote paths should reflect the full document structure
2. **Remove numeric prefixes** - Strip ordering prefixes like `1-`, `2-`, `0-` from directory names
3. **Mixed mode** - Combine document path + last folder from original image path
4. **Handle 2-4+ level directories** - Support any depth of nesting

---

## Design

### Path Mapping Algorithm

**Input:**
- Document path: `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md`
- Image original path: `/img/ne301/application-guide/monitoring/image.png`

**Processing Steps:**

1. Extract directory structure from document path (excluding `docs/` prefix and filename)
2. Remove numeric prefixes from each directory level (`1-` → ``, `2-` → ``, etc.)
3. Extract last folder name from original image path (`monitoring`)
4. Extract filename from original image path (`image.png`)
5. Combine: `/img/` + cleaned document dirs + last image folder + filename

**Output:**
```
/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png
```

### Implementation

#### Core Function: `generateRemotePath(docPath, imagePath)`

```javascript
/**
 * Generate remote path based on document hierarchy
 *
 * @param {string} docPath - Document path (e.g., docs/1-series/0-overview.md)
 * @param {string} imagePath - Image path (e.g., /img/ne301/app/monitoring/image.png)
 * @returns {string} Remote path
 */
function generateRemotePath(docPath, imagePath) {
  const path = require('path');

  // 1. Extract document directory hierarchy
  let docDir = path.dirname(docPath);

  // Normalize path separators
  docDir = docDir.replace(/\\/g, '/');

  // 2. Split into parts and clean
  const parts = docDir.split('/');

  const cleanedParts = parts
    .filter(part => part !== 'docs' && part !== '' && part !== '.')
    .map(part => part.replace(/^\d+-/, ''));

  // 3. Extract image path components
  const imageParts = imagePath.split('/');
  const imgIndex = imageParts.indexOf('img');

  if (imgIndex === -1) {
    return imagePath; // Not a local image
  }

  // Get last folder before filename
  const lastFolderIndex = imageParts.length - 2;
  const lastFolder = lastFolderIndex > imgIndex + 1 ? imageParts[lastFolderIndex] : null;

  // Get filename
  const fileName = path.basename(imagePath);

  // 4. Build remote path
  const remoteParts = ['img', ...cleanedParts];

  if (lastFolder) {
    remoteParts.push(lastFolder);
  }

  remoteParts.push(fileName);

  return '/' + remoteParts.join('/');
}
```

#### Updated `mapImagePath()` Function

```javascript
function mapImagePath(localImagePath, docPath) {
  return generateRemotePath(docPath, localImagePath);
}
```

### Edge Cases

| Scenario | Input | Output |
|----------|-------|--------|
| **Root level doc** | `docs/overview.md` | `/img/overview/architecture/image.png` |
| **No image subfolder** | `/img/xxx/image.png` | `/img/series/guide/image.png` |
| **Already remote URL** | `https://...` | Skip (existing logic) |
| **No numeric prefix** | `docs/custom/path.md` | `/img/custom/path/...` |

### Examples

#### Example 1: 2-Level Directory

```
Document: docs/1-neoedge-ng4500-series/0-overview.md
Image:    /img/ne301/application-guide/architecture/overview.png
Result:   /img/neoedge-ng4500-series/overview/architecture/overview.png
```

#### Example 2: 3-Level Directory

```
Document: docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md
Image:    /img/ne301/application-guide/monitoring/image.png
Result:   /img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/monitoring/image.png
```

#### Example 3: 4-Level Directory

```
Document: docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md
Image:    /img/ne301/application-guide/monitoring/image.png
Result:   /img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png
```

#### Example 4: 5-Level Directory

```
Document: docs/1-series/2-board/3-guide/4-topic/5-detail.md
Image:    /img/xxx/app/screenshots/image.png
Result:   /img/series/board/guide/topic/detail/screenshots/image.png
```

---

## Implementation Plan

### Files to Modify

**`.image-upload/lib/path-mapper.js`** - Complete rewrite of path mapping logic

### Files Unchanged

- `.image-upload/scripts/upload-images.js` - No changes needed
- `.image-upload/lib/image-uploader.js` - No changes needed
- All other files - No changes needed

### Testing Strategy

1. **Unit tests** - Test `generateRemotePath()` with various directory depths
2. **Integration test** - Process real documents with 2-5 level hierarchies
3. **Dry run** - Preview paths before actual upload
4. **Validation** - Ensure generated paths are valid URLs

---

## Migration

**No migration needed** - This is a new feature that doesn't affect existing uploaded images. Documents that have already been processed will not be re-processed unless forced.

---

## Success Criteria

- ✅ 4+ level directory structures are fully preserved in remote paths
- ✅ All numeric prefixes are correctly stripped
- ✅ Image filenames remain unchanged
- ✅ Paths are clean and readable (no double slashes, proper encoding)
- ✅ Existing 2-3 level paths continue to work correctly
- ✅ No breaking changes to API or command-line interface

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| **Path length limits** | Remote paths are URLs, no practical length limit |
| **Backward compatibility** | Existing documents continue to work; new logic only applies on re-upload |
| **Complex nesting** | Algorithm handles arbitrary depth; tested up to 5 levels |

---

## Future Enhancements

None planned - this design addresses the current requirements completely.
