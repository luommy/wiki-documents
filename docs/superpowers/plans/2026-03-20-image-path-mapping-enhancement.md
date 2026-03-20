# Image Path Mapping Enhancement - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance image upload tool to preserve complete document directory hierarchy in remote paths, supporting 2-5+ level directories with security validation.

**Architecture:** Rewrite `.image-upload/lib/path-mapper.js` with new `generateRemotePath()` function that extracts document hierarchy, removes numeric prefixes, combines with last image folder, and URL-encodes filenames.

**Tech Stack:** Node.js, path module, existing image upload infrastructure

---

## File Structure

**Modified:**
- `.image-upload/lib/path-mapper.js` - Complete rewrite with new algorithm

**Created:**
- `.image-upload/test/test-path-mapper.js` - Unit tests for new logic

**Unchanged:**
- `.image-upload/scripts/upload-images.js` - Calls `mapImagePaths()`
- `.image-upload/lib/image-uploader.js` - Uses path mapper
- All other files

---

## Chunk 1: Backup and Prepare

### Task 1: Backup Current Implementation

**Files:**
- Backup: `.image-upload/lib/path-mapper.js`

- [ ] **Step 1: Create backup of current path-mapper.js**

```bash
cp /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/lib/path-mapper.js /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/lib/path-mapper.js.backup
```

- [ ] **Step 2: Verify backup exists**

```bash
ls -la /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/lib/path-mapper.js*
```

Expected: Both `path-mapper.js` and `path-mapper.js.backup` exist

- [ ] **Step 3: Commit backup**

```bash
git add .image-upload/lib/path-mapper.js.backup
git commit -m "backup: save current path-mapper.js before rewrite"
```

---

## Chunk 2: Write Unit Tests (TDD Approach)

### Task 2: Create Test File Structure

**Files:**
- Create: `.image-upload/test/test-path-mapper.js`

- [ ] **Step 1: Create test file with describe block**

```javascript
const path = require('path');
const { generateRemotePath, mapImagePath } = require('../lib/path-mapper');

describe('generateRemotePath', () => {
  // Tests will be added here
});
```

Write to: `/Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/test/test-path-mapper.js`

- [ ] **Step 2: Verify test file structure**

```bash
cat /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/test/test-path-mapper.js
```

Expected: File contains describe block

- [ ] **Step 3: Commit test file structure**

```bash
git add .image-upload/test/test-path-mapper.js
git commit -m "test: create test file structure for path mapper"
```

---

### Task 3: Write Basic Functionality Tests

**Files:**
- Modify: `.image-upload/test/test-path-mapper.js:1-50`

- [ ] **Step 1: Add test for 2-level directory**

```javascript
describe('generateRemotePath', () => {
  describe('Basic Functionality', () => {
    it('should handle 2-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/0-overview.md';
      const imagePath = '/img/ne301/application-guide/architecture/overview.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/architecture/overview.png');
    });
  });
});
```

Edit file: Replace entire describe block

- [ ] **Step 2: Add test for 3-level directory**

```javascript
    it('should handle 3-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/monitoring/image.png');
    });
```

Add after 2-level test

- [ ] **Step 3: Add test for 4-level directory**

```javascript
    it('should handle 4-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png');
    });
```

Add after 3-level test

- [ ] **Step 4: Add test for 5-level directory**

```javascript
    it('should handle 5+ level directories', () => {
      const docPath = 'docs/1-series/2-board/3-guide/4-topic/5-detail.md';
      const imagePath = '/img/xxx/app/screenshots/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/board/guide/topic/detail/screenshots/image.png');
    });
```

Add after 4-level test

- [ ] **Step 5: Commit basic functionality tests**

```bash
git add .image-upload/test/test-path-mapper.js
git commit -m "test: add basic functionality tests for path mapper"
```

---

### Task 4: Write Edge Case Tests

**Files:**
- Modify: `.image-upload/test/test-path-mapper.js:50-150`

- [ ] **Step 1: Add describe block for edge cases**

```javascript
  describe('Edge Cases', () => {
    // Edge case tests will go here
  });
```

Add after Basic Functionality describe block

- [ ] **Step 2: Add test for root-level documents**

```javascript
    it('should handle root-level documents', () => {
      const docPath = 'docs/overview.md';
      const imagePath = '/img/xxx/architecture/diagram.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/overview/architecture/diagram.png');
    });
```

Add inside Edge Cases describe block

- [ ] **Step 3: Add test for product ID in image path**

```javascript
    it('should skip product IDs in lastFolder', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/ne301/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/image.png');
    });
```

Add after root-level test

- [ ] **Step 4: Add test for special characters**

```javascript
    it('should encode special characters', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/architecture/架构图.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%E6%9E%B6%E6%9E%84%E5%9B%BE.png');
    });
```

Add after product ID test

- [ ] **Step 5: Add test for spaces in filename**

```javascript
    it('should handle spaces in paths', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/architecture/my image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('my%20image.png');
    });
```

Add after special characters test

- [ ] **Step 6: Commit edge case tests**

```bash
git add .image-upload/test/test-path-mapper.js
git commit -m "test: add edge case tests for path mapper"
```

---

### Task 5: Write Security Tests

**Files:**
- Modify: `.image-upload/test/test-path-mapper.js:150-200`

- [ ] **Step 1: Add describe block for security**

```javascript
  describe('Security', () => {
    // Security tests will go here
  });
```

Add after Edge Cases describe block

- [ ] **Step 2: Add test for null inputs**

```javascript
    it('should reject null inputs', () => {
      expect(() => generateRemotePath(null, '/img/test.png'))
        .toThrow('Both docPath and imagePath are required');

      expect(() => generateRemotePath('docs/test.md', null))
        .toThrow('Both docPath and imagePath are required');
    });
```

Add inside Security describe block

- [ ] **Step 3: Add test for path traversal in docPath**

```javascript
    it('should reject path traversal in docPath', () => {
      expect(() => generateRemotePath('../etc/passwd', '/img/test.png'))
        .toThrow('Path traversal detected');
    });
```

Add after null inputs test

- [ ] **Step 4: Add test for path traversal in imagePath**

```javascript
    it('should reject path traversal in imagePath', () => {
      expect(() => generateRemotePath('docs/test.md', '../etc/shadow'))
        .toThrow('Path traversal detected');
    });
```

Add after docPath traversal test

- [ ] **Step 5: Add test for remote URLs**

```javascript
    it('should return remote URLs as-is', () => {
      const remoteUrl = 'https://example.com/image.png';
      const result = generateRemotePath('docs/test.md', remoteUrl);

      expect(result).toBe(remoteUrl);
    });
```

Add after traversal tests

- [ ] **Step 6: Commit security tests**

```bash
git add .image-upload/test/test-path-mapper.js
git commit -m "test: add security tests for path mapper"
```

---

### Task 6: Verify Tests Fail (Red Phase)

**Files:**
- Test: `.image-upload/test/test-path-mapper.js`

- [ ] **Step 1: Run tests to verify they fail**

```bash
cd /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload && node test/test-path-mapper.js
```

Expected: Tests fail because `generateRemotePath` doesn't exist yet

Note: If you get "Cannot find module" error, that's expected and correct

- [ ] **Step 2: Document test failure**

Make note: Tests are failing as expected (RED phase of TDD)

---

## Chunk 3: Implement Core Functionality

### Task 7: Implement Input Validation

**Files:**
- Modify: `.image-upload/lib/path-mapper.js:1-30`

- [ ] **Step 1: Add module imports and constants**

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
  // Implementation will go here
}

module.exports = {
  generateRemotePath,
  mapImagePath
};
```

Replace entire file content

- [ ] **Step 2: Add input validation**

```javascript
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

  // Rest of implementation will go here
  return imagePath; // Temporary fallback
}
```

Update generateRemotePath function

- [ ] **Step 3: Run security tests**

```bash
cd /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload && node test/test-path-mapper.js
```

Expected: Security tests for null and traversal should now pass

- [ ] **Step 4: Commit input validation**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "feat: add input validation to generateRemotePath"
```

---

### Task 8: Implement Document Path Processing

**Files:**
- Modify: `.image-upload/lib/path-mapper.js:30-60`

- [ ] **Step 1: Add document path processing**

```javascript
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

    // Continue implementation...
    return imagePath; // Temporary
  } catch (error) {
    console.error('Path generation failed:', { docPath, imagePath, error });
    return imagePath; // Fallback to original
  }
```

Add after remote URL check, replace temporary return

- [ ] **Step 2: Test document path processing mentally**

Trace through with example:
- Input: `docs/1-series/0-guide.md`
- After dirname: `docs/1-series`
- After split: `['docs', '1-series']`
- After filter: `['1-series']`
- After map: `['series']`
- cleanedParts: `['series']`

- [ ] **Step 3: Commit document path processing**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "feat: add document path processing logic"
```

---

### Task 9: Implement Image Path Processing

**Files:**
- Modify: `.image-upload/lib/path-mapper.js:60-90`

- [ ] **Step 1: Add image path processing**

```javascript
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

    // Continue to build path...
    return imagePath; // Temporary
```

Add after cleanedParts handling

- [ ] **Step 2: Test image path processing mentally**

Trace through with example:
- Input: `/img/ne301/application-guide/architecture/overview.png`
- After split: `['', 'img', 'ne301', 'application-guide', 'architecture', 'overview.png']`
- imgIndex: 1
- lastFolderIndex: 4
- lastFolder: 'architecture'
- fileName: 'overview.png'

- [ ] **Step 3: Commit image path processing**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "feat: add image path processing logic"
```

---

### Task 10: Implement Path Building

**Files:**
- Modify: `.image-upload/lib/path-mapper.js:90-120`

- [ ] **Step 1: Add path building logic**

```javascript
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
```

Replace temporary return statement

- [ ] **Step 2: Run all tests**

```bash
cd /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload && node test/test-path-mapper.js
```

Expected: All tests should pass (GREEN phase of TDD)

- [ ] **Step 3: Fix any failing tests**

If any tests fail:
1. Check error messages
2. Verify logic matches spec
3. Update implementation or tests as needed
4. Re-run tests

- [ ] **Step 4: Commit path building logic**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "feat: complete generateRemotePath implementation"
```

---

### Task 11: Update mapImagePath Function

**Files:**
- Modify: `.image-upload/lib/path-mapper.js:120-140`

- [ ] **Step 1: Update mapImagePath to use generateRemotePath**

```javascript
/**
 * Map image path (wrapper for backward compatibility)
 *
 * @param {string} localImagePath - Local image path
 * @param {string} docPath - Document path
 * @returns {string} Remote path
 */
function mapImagePath(localImagePath, docPath) {
  return generateRemotePath(docPath, localImagePath);
}

/**
 * Batch map image paths
 *
 * @param {string[]} localImagePaths - Array of local image paths
 * @param {string} docPath - Document path
 * @returns {Object} Mapping { originalPath: remotePath }
 */
function mapImagePaths(localImagePaths, docPath) {
  const mapping = {};

  for (const localPath of localImagePaths) {
    mapping[localPath] = mapImagePath(localPath, docPath);
  }

  return mapping;
}

module.exports = {
  generateRemotePath,
  mapImagePath,
  mapImagePaths
};
```

Add after generateRemotePath, update module.exports

- [ ] **Step 2: Verify backward compatibility**

Check that existing code calling `mapImagePaths()` still works:
- Input: `mapImagePaths(['/img/test.png'], 'docs/1-series/0-guide.md')`
- Output: `{ '/img/test.png': '/img/series/guide/test.png' }`

- [ ] **Step 3: Commit backward compatibility**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "feat: update mapImagePath for backward compatibility"
```

---

## Chunk 4: Integration Testing

### Task 12: Create Integration Test Document

**Files:**
- Create: `.image-upload/test/fixtures/4-level-test.md`

- [ ] **Step 1: Create test markdown file**

```markdown
---
id: test-4-level
title: 4-Level Directory Test
---

# Test Document

## Images

![Test Image 1](/img/ne301/application-guide/monitoring/image1.png)
![Test Image 2](/img/ne301/application-guide/screenshots/image2.png)
![Chinese Image](/img/ne301/architecture/架构图.png)
```

Write to: `/Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/test/fixtures/4-level-test.md`

Note: Place in a 4-level directory like `docs/1-series/2-board/3-guide/4-topic/0-test.md`

- [ ] **Step 2: Verify test document exists**

```bash
cat /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/test/fixtures/4-level-test.md
```

Expected: File contains test markdown

- [ ] **Step 3: Commit integration test document**

```bash
git add .image-upload/test/fixtures/4-level-test.md
git commit -m "test: add integration test document"
```

---

### Task 13: Run Integration Test

**Files:**
- Test: `.image-upload/test/fixtures/4-level-test.md`

- [ ] **Step 1: Run upload tool in dry-run mode**

```bash
cd /Users/harryhua/Documents/GitHub/wiki-documents
./upload-images.sh .image-upload/test/fixtures/4-level-test.md --dry-run
```

Expected: Shows generated remote paths without uploading

- [ ] **Step 2: Verify output paths**

Check that output shows:
- 4-level directory structure preserved
- Numeric prefixes removed
- Image folders included
- Special characters encoded

- [ ] **Step 3: Fix any issues**

If paths are incorrect:
1. Compare with spec examples
2. Check implementation logic
3. Update code as needed
4. Re-run dry-run

- [ ] **Step 4: Document integration test results**

Note: Integration test successful, paths match spec

---

### Task 14: Test with Real Document

**Files:**
- Test: Real document with 4+ levels

- [ ] **Step 1: Find a real 4+ level document**

```bash
find /Users/harryhua/Documents/GitHub/wiki-documents/docs -name "*.md" -type f | grep -E "(docs/[^/]+){4,}" | head -1
```

Expected: Returns a path to a 4+ level document

- [ ] **Step 2: Run dry-run on real document**

```bash
./upload-images.sh <path-to-real-doc> --dry-run
```

Expected: Shows generated remote paths

- [ ] **Step 3: Verify paths are reasonable**

Check:
- Complete hierarchy preserved
- No double slashes
- Special characters encoded
- Product IDs skipped

- [ ] **Step 4: Document real document test**

Note: Test with real document successful

---

## Chunk 5: Finalization

### Task 15: Code Review and Cleanup

**Files:**
- Review: `.image-upload/lib/path-mapper.js`

- [ ] **Step 1: Review code for clarity**

Check:
- Comments are clear
- Variable names are descriptive
- Error messages are helpful
- No console.logs left in production code

- [ ] **Step 2: Remove debug code**

Remove any temporary console.log statements (keep console.error and console.warn)

- [ ] **Step 3: Verify JSDoc comments**

Ensure all functions have proper JSDoc comments matching spec

- [ ] **Step 4: Commit cleanup**

```bash
git add .image-upload/lib/path-mapper.js
git commit -m "refactor: cleanup and improve code clarity"
```

---

### Task 16: Update Documentation

**Files:**
- Modify: `.image-upload/README.md`

- [ ] **Step 1: Update README with new algorithm**

Add note about enhanced path mapping:
```markdown
### Path Mapping

The tool automatically generates remote paths that preserve the complete document directory hierarchy:

- **Preserves 2-5+ levels** of directory nesting
- **Removes numeric prefixes** (1-, 2-, 0-)
- **Combines** document path + last image folder
- **URL-encodes** special characters
- **Skips product IDs** (ne301, ng4500, etc.)

**Example:**
```
Document: docs/1-series/2-board/3-guide/4-topic/0-detail.md
Image:    /img/ne301/app/monitoring/image.png
Result:   /img/series/board/guide/topic/detail/monitoring/image.png
```
```

Add to README.md in appropriate section

- [ ] **Step 2: Update README_cn.md with same information**

Translate the path mapping section to Chinese

- [ ] **Step 3: Commit documentation updates**

```bash
git add .image-upload/README.md .image-upload/README_cn.md
git commit -m "docs: update README with path mapping algorithm details"
```

---

### Task 17: Final Testing

**Files:**
- Test: All test files

- [ ] **Step 1: Run all unit tests**

```bash
cd /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload && node test/test-path-mapper.js
```

Expected: All tests pass

- [ ] **Step 2: Run integration test**

```bash
./upload-images.sh .image-upload/test/fixtures/4-level-test.md --dry-run
```

Expected: Paths generated correctly

- [ ] **Step 3: Test error handling**

Try various invalid inputs:
```bash
# Test with non-existent file
./upload-images.sh docs/nonexistent.md --dry-run

# Test with file without images
echo "# Empty" > /tmp/empty.md
./upload-images.sh /tmp/empty.md --dry-run
```

Expected: Tool handles errors gracefully

- [ ] **Step 4: Document final test results**

Note: All tests pass, ready for deployment

---

### Task 18: Remove Backup and Finalize

**Files:**
- Remove: `.image-upload/lib/path-mapper.js.backup`

- [ ] **Step 1: Remove backup file**

```bash
rm /Users/harryhua/Documents/GitHub/wiki-documents/.image-upload/lib/path-mapper.js.backup
```

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete path mapping enhancement

- Support 2-5+ level directory structures
- Remove numeric prefixes from directory names
- Combine document hierarchy with image folder
- Add security validation (path traversal protection)
- URL-encode special characters
- Skip product IDs in image paths
- Add comprehensive unit tests
- Update documentation

Implements: docs/superpowers/specs/2026-03-20-image-path-mapping-enhancement-design.md"
```

- [ ] **Step 3: Verify final state**

```bash
git status
```

Expected: Working tree clean

- [ ] **Step 4: Create summary**

Summary:
- ✅ All tests pass
- ✅ Documentation updated
- ✅ Code reviewed and cleaned
- ✅ Ready for production use

---

## Success Criteria Checklist

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] 4+ level directories handled correctly
- [ ] Numeric prefixes removed
- [ ] Special characters URL-encoded
- [ ] Path traversal blocked
- [ ] Product IDs skipped
- [ ] Backward compatibility maintained
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code is clean and well-commented

---

## Notes for Implementation

1. **TDD Approach**: Write tests first, then implement
2. **Small Commits**: Commit after each logical change
3. **Test Frequently**: Run tests after each implementation step
4. **Keep It Simple**: Don't add features not in spec
5. **Backward Compatibility**: Ensure existing code continues to work

---

## Rollback Plan

If issues arise:

1. **Immediate rollback:**
   ```bash
   git revert HEAD
   ```

2. **Restore from backup:**
   ```bash
   git checkout HEAD~1 -- .image-upload/lib/path-mapper.js
   ```

3. **Report issue:**
   - Document the problem
   - Include test case that fails
   - Note expected vs actual behavior
