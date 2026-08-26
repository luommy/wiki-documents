---
description: "Complete guide to NE503 AI capabilities: the Applications page (app management, 6-step install wizard — Source / Basic Info / Resources / Permissions / Advanced / Review — with deep permission coverage: AI Models / Max QPS / Video Streams / Event Bus / Network Mode / Device Control), and the Models page (model lifecycle, scan/import, load/unload, threshold tuning)."
keywords: [NE503 app management, install wizard, container apps, Permissions, model management, HEF, Threshold, aipc-cli, AI inference]
tags: [User Guide, NE503, Applications, Models, AI]
---

# AI Apps and Models

NE503 runs AI apps through a container runtime, with built-in model management. **AI apps must declare the models they depend on** — once selected, the models auto-load when the app starts, and each model card shows which apps reference it. Non-AI apps (e.g., pure video recording) don't need model permissions. This chapter covers apps first, then models.

## Applications

Go to the **Applications** page: search and status filters at the top, app cards below, and an **Import** card in the top-right to install new apps.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png" />

### App List and Filters

- **Search box**: search by container name or image name.
- **Status filter**: All / Installed / Running / Stopped / Failed — quickly locate a category of apps.
- Each app card shows: running status, name, version, real-time CPU / memory usage.

### App Actions

Each app card provides:

| Button | Action |
|--------|--------|
| **Stop / Restart** | Stop / restart the app |
| **Logs** | View runtime logs |
| **Console** | Open a shell inside the container (for debugging) |
| **Visit App** | Open the app's own web UI (e.g., AI Model Showcase) |
| **Uninstall** | Remove the app |

### Install a New App (6-Step Wizard)

Click the **Import** card to launch the **Application Setup Wizard** (6 steps). The images below show Step 1 (Source) and the final Review page:

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step1-source.png" alt="Wizard Step 1 Source" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step6-review.png" alt="Wizard Review Confirmation" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

#### Step 1 · Source

| Source | Description |
|--------|-------------|
| **Registry Image** | Pull from Docker Hub or a private registry; enter the Image Address |
| **Upload Archive** | Upload a local `.tar` / `.tar.gz` image file |
| **Upload Package** | Upload an `app.yaml` manifest + image as a complete config package |

#### Step 2 · Basic Info

- **Application ID**: unique identifier, **cannot be changed after creation**
- **Application Name** / **Version** / **Description**: display and notes

#### Step 3 · Resources

- **CPU Limit**: CPU cap (%)
- **Memory Limit**: memory cap
- **Auto-start on boot**: start automatically on boot
- **Restart Policy**: restart-on-failure policy

#### Step 4 · Permissions

This is the most important step — it determines which platform capabilities the app can use.

| Permission group | Effect |
|------------------|--------|
| **AI Models Access** | Check the inference models the app may call (see Models below) |
| **Max Inference QPS** | Cap the app's inferences per second to prevent NPU hogging |
| **Max Concurrent Inference** | Cap the number of concurrent inferences |
| **Allow Dynamic Model Registration** | Let the app discover and register models at runtime |
| **Video Stream Permissions** | Check the streams the app can use (main / sub / third, each annotated with resolution and frame rate) |
| **Event Publish / Subscribe Topics** | Event Bus topics to publish / subscribe (comma-separated, e.g., `app/output`, `camera/*`) |
| **Network Mode** | Isolated (no network) / Host (share host network) |
| **Device Control** | Hardware control grants: **Light Control** (IR fill), **IR Cut Filter**, **PTZ Control**, **Lens Control** |

> Once Device Control is granted, the app can drive the lens and IR programmatically via the SDK.

#### Step 5 · Advanced

- **Environment Variables**: key-value environment variables
- **Volumes**: storage volume mounts

Both optional; add as the app requires.

#### Step 6 · Review

A summary of the previous five steps. Confirm and click **Install**. After installation, the app appears in the list (initially Stopped); click the start button on its card to run it.

## Models

Go to the **Models** page to view and manage inference models. The device comes with multiple built-in model types (object detection, OCR, semantic segmentation, keypoints, depth estimation, CLIP zero-shot, image classification, etc.); the factory preload list is in the [Version Matrix](../3-software-guide/5-version-matrix.md), and the actual list depends on the device.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-models.png" />

### Model List

Each model card shows: load status (**Loaded** / **Not Loaded**), how many apps reference it (**X Apps**), ID, type, input size, file size, path, and **Load / Unload / Detail / Delete** actions.

### Scan and Import

- **Scan Models**: scan the `/data/aipc/models/` directory to auto-register new `.hef` models.
- **Import**: a two-step import — Step 1 upload the `.hef` file, Step 2 fill in Model ID / Model Type / Threshold and other config.

### Load and Unload

A model must be **Loaded** onto the NPU before it can be used for inference:

- If an app declares a model in its Permissions, the model is **loaded automatically** when the app starts.
- You can also Load / Unload manually on this page.
- Delete removes the model file; Unload only releases it from the NPU without deleting the file.

### Model Detail and Threshold Tuning

Click **Detail** to open the model detail dialog. Key fields:

| Field | Description |
|-------|-------------|
| **Model ID / Type** | Identifier and type (detection / ocr / segmentation…) |
| **Input Size** | The input resolution the model requires. Note: the platform preprocessing pipeline outputs a fixed **384×640 NV12** format — a mismatched input size produces no inference results |
| **File Size / Path** | Size and path of the `.hef` file |
| **Threshold** | **Inference threshold (adjustable)** — raise it to reduce false positives (risk missing detections); lower it for the opposite |
| **Estimated TOPS / Memory** | Estimated inference compute and memory footprint |
| **Load Time** | When the model was last loaded |
| **Used By Apps** | Reverse reference — which apps depend on this model |
