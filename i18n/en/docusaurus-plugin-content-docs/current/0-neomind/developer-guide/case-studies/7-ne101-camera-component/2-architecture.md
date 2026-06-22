---
description: "ne101_camera component architecture deep-dive: 5-layer decomposition of the 1972-line IIFE (helper / hook / sub-component / export), 3 exported components (NE101CameraPanel / ConfigPanel / AdvancedPanel), the WebSocket-priority + REST-fallback data flow, the ROI overlay pipeline, and an architectural comparison with metric_card"
keywords: [NeoMind, ne101_camera, IIFE architecture, React-in-IIFE, device-bound component]
tags: [NeoMind, case study, architecture]
sidebar_label: "2. Architecture"
---

# §2 Architecture Overview

> This section cracks open [`bundle.js`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js) — the 1972-line hand-written IIFE — and lays it flat. After reading you should be able to: (1) draw the IIFE top-level structure and the `window.*` injection boundary; (2) explain the responsibilities of the five layers (helper / template / sub-component / main / export); (3) reproduce the component tree (root `NE101CameraPanel` plus the `ConfigPanel` / `AdvancedPanel` exported siblings) and the semantics of the core hooks; (4) describe the dual-channel "WebSocket-priority + REST-fallback" data flow; and (5) articulate, via the comparison with [#6 metric_card](../6-metric-card-component.md), the architectural gulf between a "device-bound component" and a "display component". All line numbers reference the `main` branch of the source repo; links carry `#L<start>-L<end>` anchors.

---

## §2.1 IIFE Top-Level Structure

The first line of ne101_camera's `bundle.js` is not an import — it is a contract declaration against `window`. See source: [`bundle.js` L1-L5](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1-L5).

```javascript
var NE101CameraPanel = (function () {
  var React = window.React;
  var jsx = window.jsxRuntime.jsx;
  var jsxs = window.jsxRuntime.jsxs;
  // ... 1965 lines of component logic ...
  return { default: NE101CameraPanel, NE101CameraPanel: NE101CameraPanel, ConfigPanel: ConfigPanel, AdvancedPanel: AdvancedPanel };
})();
```

These three lines (`var React = window.React`, `var jsx = window.jsxRuntime.jsx`, `var jsxs = window.jsxRuntime.jsxs`) are the NeoMind component market's standard "injection triple", shared with metric_card ([#6 metric_card §3.2](../6-metric-card-component.md)). The implication is that **the bundle does not pack React** — it borrows a single instance already loaded by the host page, guaranteeing one React instance for the whole dashboard and preventing cross-instance hook failures (the classic `useContext` returns undefined / `useRef` throws symptoms).

Why use `var Name = (function(){ ... })()` (an IIFE) instead of UMD / CommonJS / ESM? The root cause is that **the Dashboard host injects the bundle via a `<script>` tag**. A `<script>` tag has no module scope, so an IIFE is the only zero-dependency mechanism that emulates private naming via function scope + closure: every `function classColor` / `var white` inside the function body stays out of `window`, and only the final `return { ... }` object is attached to `window.NE101CameraPanel`. UMD also works under `<script>` but adds a `define` / `module.exports` detection branch that is redundant for NeoMind's "no bundler" philosophy; CommonJS's `require` simply does not work in the browser.

The final line [`bundle.js` L1971](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1971) is a **named-export + default dual exposure**: `return { default: NE101CameraPanel, NE101CameraPanel: ..., ConfigPanel: ..., AdvancedPanel: ... }`. Note that `manifest.json`'s [`export_name: "NE101CameraPanel"`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/manifest.json#L39) selects the named export (it reads the main component from `NE101CameraPanel.NE101CameraPanel`), not the default; but the default is also retained for backward compatibility with older Dashboard loaders that still write `bundle.default` (see §2.5 decision #2). This dual exposure is one detail that distinguishes ne101_camera from metric_card — metric_card also exposes `default + MetricCard` but only exports a single component, whereas ne101_camera must also carry `ConfigPanel` and `AdvancedPanel` out for the configuration dialog.

The diagram below draws the main line from window injection to IIFE closure to five layers to return object.

```mermaid
graph TB
    subgraph HOST["Host page (NeoMind Dashboard)"]
        RT["Dashboard Runtime"]
        REACT["window.React<br/>(singleton React instance)"]
        JSX["window.jsxRuntime<br/>jsx / jsxs functions"]
    end

    subgraph IIFE["ne101_camera bundle.js (1972-line IIFE)"]
        ENTRY["L1: var NE101CameraPanel = (function () {<br/>L2-L4: var React = window.React<br/>var jsx/jsxs = window.jsxRuntime.*"]
        L1["Layer 1 Helper L7-L230<br/>batteryMeta / formatValue<br/>classColor / pipeRois"]
        L2["Layer 2 Template engine L239-L456<br/>generateTransformJsCode<br/>fillTemplate"]
        L3["Layer 3 Sub-component L458-L1970<br/>NoDevice / ConfigPanel<br/>AdvancedPanel / SwitchControl"]
        L4["Layer 4 Main component L470-L1333<br/>NE101CameraPanel body<br/>hooks / events / render"]
        L5["Layer 5 Export L1971<br/>return default + named exports"]
        ENTRY --> L1
        L1 --> L2
        L2 --> L3
        L3 --> L4
        L4 --> L5
    end

    RT -->|"&lt;script&gt; tag loads bundle.js"| ENTRY
    ENTRY -.->|"reads window.*"| REACT
    ENTRY -.->|"reads window.*"| JSX
    L5 -->|"attached to window.NE101CameraPanel"| HOST
```

Solid arrows are load/inject direction; dotted arrows are read direction. The five layers inside the IIFE closure are not physically separate files but logical layers segmented by line number — which is also why reading ne101_camera source is harder than reading metric_card: helper, sub-component, and main interleave within the same file, and you must first build the five-layer model in your head.

---

## §2.2 Five-Layer Architecture Decomposition

The 1972 lines of ne101_camera's IIFE can be sliced into five layers by responsibility. This section gives each layer a 2-3 sentence responsibility statement and marks key line numbers for deep links, making cross-references in later sections easier.

### Layer 1: Helper (L7-L230)

The Helper layer is a stateless collection of utility functions that **do pure computation and never touch React**. The design principle is "each function could be lifted out and run in Node.js", because none of them have side effects. See source: [`bundle.js` L7-L230](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L7-L230).

Core helpers:

- `batteryMeta(level)` ([L7](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L7-L12)) — maps a battery percentage to a green/yellow/red bar color.
- `formatValue(val, metric)` / `unitStr(metric)` / `timeAgo(iso)` — value formatting and relative time; metric_card has equivalents.
- `getVal(obj, key)` / `getFirst(obj, keys)` — dot-path value accessors for nested telemetry fields like `values.xxx.yyy`.
- `classColor(label)` ([L57](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L55-L72)) — **golden-angle HSV coloring**: hashes the class string, multiplies the hash by the golden angle 137.508° to obtain hue, ensuring visually separable colors for any class count. Introduced by commit [`c276c23`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/c276c23) (`feat(ne101): per-class detection colors via golden-angle HSV rotation`).
- `PinIcon` / `ModeIcon` ([L86-L100](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L86-L100)) — inline SVG icon components, no external dependencies.
- `pipeRois(pipe)` ([L204-L230](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L204-L230)) — extracts ROI arrays from a pipeline config, supporting both the new format (`pipe.rois = [{points:[...]}`) and the legacy format (`pipe.roiX/Y/W/H` single rectangle). This is the code-level landing of §1.6 decision #4's backward-compatible field evolution.

The Helper layer exists as a distinct layer because these functions are called repeatedly across both main component and sub-components; scattering them would produce the maintenance nightmare of "grep the whole file to change one function".

### Layer 2: Template Engine (L239-L456)

This is ne101_camera's signature capability that no other NeoMind component has: **dynamically generating the transform's `js_code` string**. See source: [`bundle.js` L239-L456](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L239-L456).

`generateTransformJsCode(pipe)` ([L239](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L239-L264)) takes a pipeline config object (containing `extId` / `template` / `categories` / `phrase` / `classFilter` / `roiEnabled` / `roiAction` / `roiX/Y/W/H`) and returns a JavaScript code string. This string is stuffed into a TransformAutomation entity on the NeoMind controller, which schedules it after each capture, invokes `extensions.invoke()`, and writes results back to virtual metrics.

Why code generation instead of hardcoded branches? Because different `processingTemplate` values (`object_detection` / `ocr` / `describe` / `barcode`) need radically different post-processing (OCR assembles polygons, describe assembles description text, object_detection aggregates by class). Writing `if (template === 'ocr') { ... } else if ...` would bloat the main component's render function to the point of unreadability. Generating the post-processing as an independent string and letting the controller `eval` it in a sandbox effectively physically strips the "variable post-processing" out of the component code. The trade-offs of this decision are discussed in §2.5 #4.

### Layer 3: Sub-component (L458-L1970)

This layer contains every React function component that is either rendered by the main component or rendered by the Dashboard's configuration dialog. Unlike metric_card, which only exports one `MetricCard`, ne101_camera's sub-component layer has **five public/private components**, which is the main source of its 1972-line bulk:

- `NoDevice` ([L458](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L458-L469)) — placeholder card shown when no device is bound, telling the user to bind a device in the config panel.
- `SwitchControl(checked, onChangeFn)` ([L1334-L1348](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1334-L1348)) — hand-written replica of shadcn Switch, using `data-state` to trigger the host page's CSS rules and avoid pulling in extra dependencies.
- `ConfigPanel(props)` ([L1353-L1357](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1353-L1357)) — content of the Display tab; currently an empty shell (the platform owns the title field) but kept exported to preserve the three-piece contract.
- `ExtDropdown(props)` ([L1371-L1446](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1371-L1446)) — shadcn-style extension picker dropdown that replaces the native `<select>`, with loading state and outside-click close.
- `AdvancedPanel(props)` ([L1448-L1970](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1448-L1970)) — **the advanced configuration panel**: AI processing toggle, extension picker, template picker, ROI editor, ROI overlap threshold slider, NMS threshold pass-through. This single component is 522 lines — the longest span in the bundle.

### Layer 4: Main Component (L470-L1333)

`NE101CameraPanel(props)` ([L472](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L470-L1333)) is the main component mounted into the grid at runtime. It consumes platform-injected props (`config` / `deviceContext` / `deviceImageSrc` / `virtualMetrics` / `sendDeviceCommand`) and manages command-loading state, extension state, transform lifecycle, detection cache, and image layout via a group of hooks. Core hooks are covered in §2.3.

### Layer 5: Export (L1971)

A single line: `return { default: NE101CameraPanel, NE101CameraPanel: NE101CameraPanel, ConfigPanel: ConfigPanel, AdvancedPanel: AdvancedPanel };`. This line is also the IIFE's closing `})()`, packaging every declaration inside the closure onto `window.NE101CameraPanel`. Both `global_name` and `export_name` in manifest point to `NE101CameraPanel`, and the platform loader uses the named export accordingly.

---

## §2.3 Component Tree (NE101CameraPanel / ConfigPanel / AdvancedPanel)

The NeoMind Dashboard contract for a "device-bound component" is: **main component + optional Display tab config panel + optional Advanced tab config panel**. ne101_camera fills all three roles, producing a three-export component tree.

```mermaid
graph TB
    subgraph RUNTIME["Runtime (rendered in the grid)"]
        MAIN["NE101CameraPanel<br/>(main component, L470-L1333)"]
        NODEVICE["NoDevice<br/>(placeholder, L458)"]
        INNER["Internal jsx render branches<br/>image + metrics + command buttons<br/>+ ROI / detection-box Canvas"]
        MAIN -->|"deviceContext == null"| NODEVICE
        MAIN -->|"deviceContext != null"| INNER
    end

    subgraph CONFIG["Configuration dialog (not in the grid)"]
        CFG["ConfigPanel<br/>(Display tab, L1353)"]
        ADV["AdvancedPanel<br/>(Advanced tab, L1448)"]
        DD["ExtDropdown<br/>(extension picker, L1371)"]
        SW["SwitchControl<br/>(toggle, L1334)"]
        ADV --> DD
        ADV --> SW
    end

    HOST["Dashboard Runtime"]
    HOST -->|"render in grid"| MAIN
    HOST -->|"render in dialog"| CFG
    HOST -->|"render in dialog"| ADV
```

`ConfigPanel` is the Display tab content, responsible for user-visible display configuration (title, location, etc.). ne101_camera currently cedes the title field to the platform's `ComponentConfigDialog` (see the comment at [`bundle.js` L1354-L1356](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1353-L1357)), so `ConfigPanel` itself returns `null`, but it remains exported to avoid breaking the "main + Display + Advanced" three-piece contract.

`AdvancedPanel` ([L1448](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1448-L1970)) is where the real complexity lands: (1) the AI processing master toggle; (2) the extension picker dropdown (`ExtDropdown`); (3) template picker (object_detection / ocr / describe / barcode); (4) class filter / phrase input; (5) ROI toggle + polygon editor (user drags points on a canvas); (6) ROI overlap threshold slider (`processingRoiOverlap`, commit [`636a8ae`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/636a8ae)); (7) NMS IoU threshold pass-through to `locate-anything-v2` (commit [`8656148`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/8656148)).

The core hooks of `NE101CameraPanel` (located at [`bundle.js` L484-L513](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L484-L513)) form its state machine skeleton:

| Hook | Line | Purpose |
|------|------|---------|
| `cmdState = React.useState({})` | [L484](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L484-L486) | Loading-state dictionary for device commands, keyed by command name |
| `extStatusState = React.useState('idle')` | [L504-L506](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L504-L506) | Extension-invocation state machine: `idle` / `running` / `done` / `error` |
| `transformIdRef = React.useRef(null)` | [L509](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L509) | ID of the current Transform, used for cleanup on unmount |
| `lastDetsRef = React.useRef([])` | [L512](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L512) | Caches the previous frame's detections to avoid image/detection misalignment |
| `lastDetsTsRef = React.useRef(null)` | [L513](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L513) | The source_ts that the previous frame's detections correspond to |

This group of hooks reveals the three axes of ne101_camera's state machine: **the command axis** (short-term state for user-initiated actions), **the extension axis** (medium-term state for AI scheduling), and **the detection cache axis** (long-term refs for cross-frame alignment). metric_card has only one axis (the loading/data/error of data fetching) — this is the clearest illustration of the complexity gap between the two.

> **Hook-order pitfall**: commit [`0601cd4`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/0601cd4) (`fix(ne101_camera): move conditional useState hook to fix React error #310`) specifically fixes a bug where a conditional `useState` caused inconsistent hook ordering. When writing hooks inside an IIFE, the absence of ESLint's `rules-of-hooks` makes this class of bug easy to miss — a hidden cost of the hand-written IIFE philosophy.

---

## §2.4 Data Flow: WebSocket Priority + REST Fallback

ne101_camera's data flow is where it diverges most from metric_card. metric_card uses a `fetchData` prop for polled pulling, while ne101_camera runs a dual-channel strategy: **WebSocket push (incremental) + REST pull (full fallback)**.

The diagram below shows the full link from device capture to component render, with emphasis on the priority relationship between the WebSocket and REST channels.

```mermaid
sequenceDiagram
    autonumber
    participant DEV as NE101 device
    participant MQTT as MQTT Broker
    participant NM as NeoMind controller
    participant STORE as Platform Store<br/>(deviceImageSrc / virtualMetrics)
    participant WS as WebSocket channel
    participant REST as REST channel<br/>(fetchDeviceValues)
    participant UI as NE101CameraPanel

    DEV->>MQTT: publish telemetry<br/>(image_url + battery + signal + temp + virtual.detections)
    MQTT->>NM: forward to devices/{id}/telemetry
    NM->>STORE: write device.currentValues
    STORE->>WS: push incremental<br/>(deviceImageSrc / virtualMetrics change)
    WS->>UI: props.deviceImageSrc updated<br/>props.virtualMetrics updated

    Note over UI: Priority 1: deviceImageSrc prop<br/>(explicit comment L1601-L1602)

    UI->>UI: render <img> + Canvas

    Note over UI,REST: On first mount / during WS reconnect<br/>when deviceImageSrc is empty

    UI->>REST: neomind.fetchDeviceValues(deviceId)<br/>(L1613-L1628)
    REST->>NM: GET /devices/{id}/values
    NM-->>REST: full currentValues
    REST-->>UI: parse imageUrl + detections
    UI->>UI: JSON.parse detections string<br/>(L857, commit e3a70be)
```

The core contract of this data flow is written in the comment at [`bundle.js` L1601-L1602](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1601-L1602):

```javascript
// Fetch preview image from bound device
// Priority: 1. deviceImageSrc prop (from platform store, populated by WebSocket)
//           2. REST fetch via fetchDeviceValues (fallback)
```

**Priority 1: `deviceImageSrc` prop.** This prop comes from the platform's device store, populated by WebSocket push. The platform subscribes to the `devices/{device_id}/telemetry` topic, updates the store on every message, and injects `deviceImageSrc` into the component via React props. This is the **realtime channel** — low latency (millisecond-level), but reliability is bounded by the WebSocket connection state (messages can be lost during reconnect), and large base64 images may exceed WS message-size limits (see the comment at [`bundle.js` L515-L517](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L515-L517)).

**Priority 2: REST fallback.** When `deviceImageSrc` is empty (first mount, WS reconnect, or oversized image), the component calls `window.neomind.fetchDeviceValues(deviceId)` to pull the full `currentValues` (see the `fetchPreview` function at [`bundle.js` L1613-L1628](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1613-L1628)). This is the **reliable channel** — it always returns, but with higher latency (HTTP round-trip).

Two commits mark the introduction of this dual-channel strategy:

- commit [`b0be12b`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/b0be12b) (`fix(ne101): initial fetch on mount for image + virtual metrics`) — fixes "if WebSocket has not pushed the first message by the time the component mounts, the screen is blank", by triggering an active REST fetch in the mount effect.
- commit [`0eedd27`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/0eedd27) (`fix(ne101): update virtual data on WS-triggered REST fetch`) — fixes "WS push only carries small metrics (battery/ts), large images need REST to backfill", by making the WS-triggered REST fetch also refresh virtual metrics.

Detection parsing has one easy-to-miss pitfall: the backend stores the `detections` virtual metric as a **JSON string** rather than an array. [`bundle.js` L857](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L853-L867) does a defensive parse with try/catch:

```javascript
var vDet = getFirst(vals, [pfx + 'detections', 'values.' + pfx + 'detections']);
if (typeof vDet === 'string') { try { vDet = JSON.parse(vDet); } catch(e) { vDet = null; } }
```

This fix comes from commit [`e3a70be`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/e3a70be) (`fix(ne101): parse JSON string detections from backend virtual metrics`). Before this, the component assumed `vDet` was always an array and crashed on a string. This is a common contract-ambiguity zone for device-bound components — the backend's serialization strategy and the frontend's deserialization assumption disagree. §4 Data Contract discusses this in depth.

---

## §2.5 Key Design Decisions (>=4, with trade-offs and alternatives)

This section lists five architectural decisions that shape ne101_camera's current form. Each decision uses a three-part "we chose X / alternative Y / rationale Z" framing, plus the cost paid.

### Decision #1: IIFE + window.React instead of bundling React

**Choice**: the IIFE form `var NE101CameraPanel = (function(){ var React = window.React; ... })()`, without packing React, borrowing the singleton from the host page.

**Alternative**: use Rollup / Webpack to externalize React or bundle it directly.

**Rationale**: (1) The Dashboard host already provides React; each component packing its own copy would produce N React instances across the dashboard, breaking hooks across instances (`useContext` returns undefined, `useRef` throws); (2) IIFE shared singleton saves about 140KB per component (React + ReactDOM minified), which is 1.4MB across 10 components; (3) it guarantees the component's React version matches the host, avoiding "component uses React 18's `useSyncExternalStore`, host is still on React 17" version mismatches.

**Cost**: (1) No tree-shaking — the entire helper layer ships in the bundle even if some functions are unused; (2) no TypeScript type checking — the parameter types of `getFirst(vals, keys)` and similar functions live only in comments and convention; (3) no ESLint `rules-of-hooks` — hook-order bugs can only be caught at runtime (commit `0601cd4` is exactly such a bug). metric_card accepts this cost because it is 352 lines; ne101_camera accepts it at 1972 lines because `test_bundle.js` provides logic-test coverage as a safety net.

### Decision #2: Named export + default dual exposure

**Choice**: [`bundle.js` L1971](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L1971) return object contains both `default` and named exports (`NE101CameraPanel` / `ConfigPanel` / `AdvancedPanel`).

**Alternative**: expose only `default` and have the platform read the main component from `bundle.default`.

**Rationale**: (1) manifest's [`export_name: "NE101CameraPanel"`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/manifest.json#L39) explicitly selects the named export, and the platform loader reads the main component from `window.NE101CameraPanel.NE101CameraPanel`; (2) keeping `default` preserves backward compatibility with older Dashboard loaders (v1.x era wrote `bundle.default`), avoiding a one-shot breaking upgrade; (3) `ConfigPanel` and `AdvancedPanel` must be named exports because the configuration dialog references them individually to render the Display tab and Advanced tab.

**Cost**: the return object has one layer of redundancy (`default` and `NE101CameraPanel` point to the same function), but this is the standard cost of forward compatibility and is negligible.

### Decision #3: WebSocket-priority + REST-fallback dual channel

**Choice**: image data flows through two channels — Priority 1 is `props.deviceImageSrc` (WebSocket push), Priority 2 is `neomind.fetchDeviceValues(deviceId)` (REST pull).

**Alternative**: use only WebSocket and rely on the platform store's push to cover every scenario.

**Rationale**: (1) WebSocket can drop messages (during reconnect, network jitter), so on first mount when WS has not pushed yet, the screen would be blank; (2) large base64 images may exceed WS message-size limits (see the comment at [`bundle.js` L515-L517](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L515-L517)) — WS only pushes small metrics (battery/ts), images must come via REST; (3) REST guarantees "first mount always has data", which is the user-experience floor. commit [`b0be12b`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/b0be12b) adds exactly this mount effect for that floor.

**Cost**: (1) the component maintains two data paths, roughly doubling code complexity; (2) WebSocket push and REST pull can race (REST returning stale data overwriting fresh WS data), requiring deduplication via `lastFetchTsRef` and `fetchingRef` ([`bundle.js` L523-L524](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L523-L524)). commit [`0eedd27`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/0eedd27) once fixed this race.

### Decision #4: Dynamically generating transform JS code

**Choice**: use `generateTransformJsCode(pipe)` ([L239](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L239-L456)) to serialize the pipeline config into a JavaScript code string, stuffed into the TransformAutomation entity's `js_code` field.

**Alternative**: hardcode the processing logic inside the component with conditional branches (`if (template === 'ocr') { ... } else if (template === 'describe') { ... }`).

**Rationale**: (1) Different `processingTemplate` values (`object_detection` / `ocr` / `describe` / `barcode`) have radically different post-processing — OCR assembles polygons and extracts text, describe assembles description strings, object_detection aggregates by class — hardcoding would bloat the main render function beyond readability; (2) code generation physically strips the "variable post-processing" out of the component code and lets the controller execute it in an isolated sandbox, keeping the AI scheduling logic out of the component bundle; (3) generated code is declarative (user changes config -> regenerate), easier to reason about than imperative `if/else`.

**Cost**: (1) string-concatenated code has no syntax checking — typos only surface at runtime; (2) the controller must `eval` this code in a sandbox, introducing (controlled) security risk; (3) debugging is hard — stack frames point into the generated string, not the source. `test_bundle.js` contains snapshot tests specifically for `generateTransformJsCode` to mitigate this.

### Decision #5: Golden-angle HSV for class coloring

**Choice**: `classColor(label)` ([L57-L72](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L55-L72)) uses string hashing + golden-angle 137.508° rotation to generate HSV hue.

**Alternative**: fixed palette (`['#ef4444', '#3b82f6', '#10b981', ...]`, taking color by class index).

**Rationale**: (1) golden-angle rotation guarantees visually separable colors for any class count — a fixed palette starts repeating after the 9th color, while ne101_camera may encounter COCO's 80 classes or OpenImages' 500+; (2) the same class label always hashes to the same color, consistent across frames and devices, with no "class -> color" mapping table to maintain; (3) hashing is a pure function with no side effects, suitable for the helper layer. commit [`c276c23`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/c276c23) introduced this rule; the prior implementation was a fixed palette.

**Cost**: (1) hash collisions are rare but non-zero (two labels could hash to nearby hues); (2) generated colors are not designer-controlled, possibly producing "brand-color dissonance"; (3) HSV is not perceptually uniform (the blue region is harder for the eye to distinguish), theoretically inferior to OKLCH. In practice, with fewer than 50 classes, the effect is acceptable.

---

## §2.6 Architectural Comparison with #6 metric_card

The table below compares ne101_camera and [#6 metric_card](../6-metric-card-component.md) across six dimensions, to help readers build a mental model of the architectural gulf between "display component" and "device-bound component". For metric_card's relevant fields, see its [§3.1 manifest contract](../6-metric-card-component.md).

| Dimension | #6 metric_card | #7 ne101_camera | Gap interpretation |
|-----------|----------------|-----------------|---------------------|
| **Code volume** | 352-line IIFE | 1972-line IIFE | The extra 1620 lines in ne101 mostly live in the sub-component layer (`AdvancedPanel` 522 lines) and the template engine layer (`generateTransformJsCode` 217 lines) — both are complexity unique to "device binding + AI processing pipeline". |
| **Component count** | 1 exported component (`MetricCard`) | 3 exported components (`NE101CameraPanel` + `ConfigPanel` + `AdvancedPanel`) + 5 internal sub-components | metric_card's "single component" means it has no configuration-dialog tab structure; ne101's three-piece set is the platform's requirement for components with `has_device_binding` or complex `config_schema`. |
| **Data access** | `has_data_source: true` + `fetchData` prop (generic) | `has_device_binding: true` + `device_type_filter: ["ne101_camera"]` (specific) | metric_card consumes any DataSource (device telemetry / extension metrics / system metrics); ne101 only consumes devices where `device.type === "ne101_camera"`. This is the fundamental "generic vs specific" divide. |
| **Configuration complexity** | Simple display config (`label` / `unit` / `decimalPlaces`) | 18-field `default_config` ([manifest.json L18-L37](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/manifest.json#L18-L37)): processing pipeline + ROI + NMS + categories + phrase | ne101 has 3x the config fields of metric_card, each with defaults and compatibility fallback (`processingRois` array vs single rectangle). |
| **Export style** | `default + MetricCard` dual exposure (but only default is used) | `default + NE101CameraPanel + ConfigPanel + AdvancedPanel` four-field exposure | metric_card's default dual exposure is "forward-compatible insurance"; ne101's named exports are "a contract the configuration dialog must use". |
| **Applicable scenarios** | Any scalar metric (temperature, battery, latency, count) | Only `ne101_camera` device type | metric_card is a "universal value card"; ne101 is a "dedicated camera panel". If the NE101 device is retired, the ne101 component is also deprecated; metric_card never becomes invalid because some device type disappears. |

**One-sentence summary**: metric_card is "thin component + thick generality"; ne101_camera is "thick component + thin specificity". The former's value is wide coverage; the latter's value is collapsing a complex device link into a single panel. The two are not substitutes but a progression — ne101_camera builds on metric_card's three-piece set (IIFE injection + manifest contract + inline style) and adds four new capability layers: device binding, image canvas, AI processing pipeline, and ROI overlay.

---

## §2.7 Summary

This section decomposed ne101_camera's five-layer IIFE architecture, the three-export component tree, the WebSocket-priority + REST-fallback dual-channel data flow, and five key design decisions. Three core takeaways:

1. **The five-layer architecture** (helper / template / sub-component / main / export) is not a physical separation but a logical layering within one file. When reading the source, first build the five-layer model in your head, or the 1972 lines will overwhelm you.
2. **The dual-channel data flow** (WebSocket + REST) is the core feature that distinguishes a device-bound component from a display component. metric_card is fine with a single `fetchData` channel; ne101 must run dual channels to balance realtime responsiveness and reliability.
3. **Code generation (`generateTransformJsCode`)** is an architectural innovation unique to ne101_camera that physically strips "variable post-processing" out of the component code. This pattern will be reused in later case studies.

### Evolution Milestone Table

The six commits below are key nodes in ne101_camera's architectural evolution, in chronological order. The full commit history is available via `git log --oneline -- components/ne101_camera/` in the source repo.

| Commit | Type | One-line description | Affected layer |
|--------|------|----------------------|----------------|
| [`c276c23`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/c276c23) | feat | per-class detection colors via golden-angle HSV rotation | Helper (`classColor` L57) |
| [`8656148`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/8656148) | feat | pass NMS IoU threshold 0.5 to locate-anything-v2 | Template engine (NMS parameter pass-through) |
| [`636a8ae`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/636a8ae) | feat | make ROI overlap threshold configurable | Sub-component (`AdvancedPanel` slider) |
| [`b0be12b`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/b0be12b) | fix | initial fetch on mount for image + virtual metrics | Main component (mount-effect REST fallback) |
| [`e3a70be`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/e3a70be) | fix | parse JSON string detections from backend virtual metrics | Main component ([`L857`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/blob/main/components/ne101_camera/bundle.js#L853-L867) JSON.parse) |
| [`0601cd4`](https://github.com/camthink-ai/NeoMind-Dashboard-Components/commit/0601cd4) | fix | move conditional useState hook to fix React error #310 | Main component (hook-order fix) |

### Bridge to Later Chapters

- [§3 Extension Side](./3-extension-side.md) (v1.1) — dives into the `processingExtensionId` contract, how extensions consume images, how they write back detections, and how the code generated by `generateTransformJsCode` executes in the controller's sandbox.
- [§4 Data Contract](./4-data-contract.md) (MVP) — MQTT topic naming, WebSocket incremental message format, the `detections` field schema, and the ROI polygon vs single-rectangle JSON structure. The JSON-string parsing pitfall (commit `e3a70be`) mentioned here is expanded into a full schema discussion there.
- [§5 Frontend Consumption](./5-frontend-consume.md) (MVP) — how the component pulls detections, parses JSON strings, applies per-class coloring (`classColor` golden-angle HSV), and draws detection boxes and ROI polygons.
- [§6 Component Build](./6-component-build.md) (MVP) — the named-export pattern for `NE101CameraPanel`, React-hook pitfalls inside an IIFE (commit `0601cd4`), and the layered design of `AdvancedPanel`.
- Back to [§1 Business Background](./1-background.md) — if you have not read it yet, read §1 first for narrative continuity.

---

*Last updated: 2026-06-23*
