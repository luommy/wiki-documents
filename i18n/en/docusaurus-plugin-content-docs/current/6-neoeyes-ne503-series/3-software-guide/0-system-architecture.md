---
description: "NE503 software platform architecture overview: the relationship between application containers, platform services, HAL, and hardware, plus the main path from image capture to inference results. Implementation details and interface definitions link to the NeoRuntime source repository."
keywords: [NE503 architecture, AIPC platform, platform services, HAL, data flow, application containers, AI inference, NeoRuntime]
tags: [Platform Architecture, NE503, Edge AI, Developer Documentation, System Design]
---

# System Architecture

The NE503 software platform has four layers: **application containers → platform services → HAL hardware abstraction → hardware**. This page explains only how the layers divide responsibilities and how data moves between them. For service APIs, configuration fields, sockets, startup dependencies, and HAL implementation details, use the source-repository links at the end of the page.

## 1. Four-Layer Platform Architecture

```mermaid
flowchart TB
APP["Application Layer<br/>Containers & AI Pipelines"]

subgraph PLATFORM["Platform Services Layer"]
direction LR

DP["Data Plane<br/>camera-daemon<br/>ai-runtime"]

CP["Control Plane<br/>API · Lifecycle<br/>Events · Device"]

end

HAL["HAL v2<br/>Unified Hardware Interfaces<br/>Video · AI · Codec · IO"]

HW["Hardware Layer<br/>Sensor · NPU · MCU"]


APP -->|SDK / gRPC| CP

APP -->|Media API| DP

CP -->|Control| DP

DP -->|DMA-BUF<br/>Inference Buffer| HAL

HAL --> HW


classDef app fill:#e3f2fd,stroke:#1565c0,color:#000
classDef platform fill:#e8f5e9,stroke:#2e7d32,color:#000
classDef hal fill:#fce4ec,stroke:#ad1457,color:#000
classDef hw fill:#efebe9,stroke:#4e342e,color:#000


class APP app
class DP,CP platform
class HAL hal
class HW hw
```

| Layer | Main Responsibility | Relationship to Upper Layer |
|:---|:---|:---|
| Application Containers | Run business applications, model pipelines, and integration logic | Use device capabilities through SDK or platform interfaces; do not access hardware directly |
| Platform Services · Data Plane | `camera-daemon` manages media pipeline outputting encoded streams & raw frames; `ai-runtime` schedules NPU inference | Receive application requests, orchestrate video/inference data flows |
| Platform Services · Control Plane | `platform-api` provides HTTP gateway, `app-manager` manages containers, `event-bus` distributes events, `device-control` drives peripherals, `device-discovery` discovers devices | Handle control commands, lifecycle, event distribution; do not move video frames directly |
| HAL v2 | Unified C interfaces for video, inference, codec, peripherals, and buffers | Hides SoC and vendor runtime differences; dynamically loads platform implementations |
| Hardware & Vendor Runtimes | Execute image capture, encoding, NPU inference, and MCU peripheral control | Driven by platform-specific HAL implementations (Hailo-15 / Stub) |

## 2. End-to-End Data Flow

Video, AI inference, and peripheral control are separated into three independent paths, corresponding to media processing, inference service, and device control flows in the source repository.

### Video and Media Path

```mermaid
flowchart LR
    SENSOR[Sensor / ISP] --> CAM["camera-daemon"]
    CAM --> SHM["Raw Frames SHM / DMA-BUF\n→ ai-runtime"]
    CAM --> ENC["Encoded H.264 / H.265\n→ RTSP / Remote Access"]
    CAM --> HBUF[hal_buffer.h\nUnified Frame Buffer]

    classDef src fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef svc fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef out fill:#fff3e0,stroke:#ef6c00,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000

    class SENSOR src
    class CAM svc
    class SHM,ENC out
    class HBUF hal
```

- `camera-daemon` manages the imaging pipeline via HAL, provides zero-copy raw frames (DMA-BUF) to `ai-runtime`, and outputs encoded streams for RTSP/remote access.

### AI Inference and Event Path

```mermaid
flowchart TB
    FRAME["Raw Frames<br/>SHM / DMA-BUF<br/>camera-daemon"]
    AIRT["ai-runtime<br/>Model · Session · Scheduler"]
    HAL["HAL Inference API<br/>hal_inference.h"]
    NPU[NPU]
    POST["Post-processing"]
    RES["Inference Results"]
    EB["event-bus"]

    subgraph SUBS["Result Subscribers"]
        direction LR
        BIZ["Business Service<br/>Container"]
        MODEL["Model Service<br/>Container"]
        WEB["Web Console<br/>via platform-api"]
    end

    FRAME -->|DMA-BUF / SHM| AIRT
    AIRT --> HAL
    HAL --> NPU
    NPU --> POST
    POST --> RES
    RES -->|When event publishing is enabled| EB
    EB -->|Pub/Sub| BIZ
    EB -->|Pub/Sub| MODEL
    EB -->|HTTP API| WEB

    classDef src fill:#e1f5fe,stroke:#01579b,color:#000
    classDef svc fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000
    classDef hw fill:#efebe9,stroke:#3e2723,color:#000
    classDef out fill:#fff3e0,stroke:#e65100,color:#000
    classDef bus fill:#f3e5f5,stroke:#4a148c,color:#000

    class FRAME src
    class AIRT svc
    class HAL hal
    class NPU hw
    class POST,RES out
    class EB bus
    class BIZ,MODEL,WEB src
```

- `ai-runtime` receives raw frames from `camera-daemon`, schedules the NPU through the HAL inference API, and performs model inference and post-processing.
- When event publishing is enabled, `ai-runtime` publishes inference results to `event-bus`: business and model containers receive them through Pub/Sub, while the Web Console obtains them through `platform-api`.

### Peripheral Control Path

```mermaid
flowchart TB
    APP["Application / Web / SDK"]
    API["platform-api"]
    DC["device-control<br/>gRPC"]
    HIO["HAL.IO<br/>hal_io.h"]
    MCU["MCU<br/>UART"]
    PERI["Light · PTZ · GPIO · Lens"]
    FB["Status Feedback"]

    APP -->|HTTP / gRPC| API
    API -->|gRPC| DC
    DC --> HIO
    HIO -->|MCU protocol| MCU
    MCU --> PERI
    PERI --> FB
    FB -->|Status / Events| DC

    classDef app fill:#e1f5fe,stroke:#01579b,color:#000
    classDef svc fill:#fff3e0,stroke:#e65100,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000
    classDef hw fill:#efebe9,stroke:#3e2723,color:#000
    classDef peri fill:#fff3e0,stroke:#ef6c00,color:#000
    classDef feedback fill:#f3e5f5,stroke:#4a148c,color:#000

    class APP app
    class API,DC svc
    class HIO hal
    class MCU hw
    class PERI peri
    class FB feedback
```

- External requests are normally forwarded through `platform-api` to `device-control`; `device-control` drives lights, PTZ, GPIO, and lenses through `HAL.IO` and the MCU protocol, with status and events returning along the feedback path.
- In the current implementation, lens control may also use `device-control`'s CameraControl interface to `camera-daemon`; see the source repository for the complete branch.

> These paths describe only platform component relationships. For detailed service responsibilities, API methods, message formats, configuration, and deployment, see the [NeoRuntime architecture overview](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/README.md) and the corresponding documents in the source repository.

## 3. Go Deeper in the Source Repository

The following implementation and interface references are maintained in the source repository rather than duplicated on this page:

- [Architecture overview and complete data flows](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/README.md) — layered architecture, core components, data flows, deployment, and security design
- [HAL v2 overview](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/hal_v2_overview.md) — HAL interfaces, platform implementations, and hardware-abstraction boundaries
- [Platform-service documentation](https://github.com/camthink-ai/neoruntime/tree/main/docs/services) — detailed documentation for `ai-runtime`, `camera-daemon`, `event-bus`, `device-control`, and other services
- [Service configurations](https://github.com/camthink-ai/neoruntime/tree/main/configs) — configuration templates for the platform services
- [Platform source and protos](https://github.com/camthink-ai/neoruntime/tree/main/platform) — service implementations, gRPC interfaces, and message definitions
- [NE503 SDK repository](https://github.com/camthink-ai/neoruntime-sdks) — Python / C++ SDKs and shared protos
- [NE503 application repository](https://github.com/camthink-ai/neoruntime-apps) — application templates and examples

**Related Wiki pages**:

- [Developer Guide](./1-developer-guide.md) — development environment, build, and deployment entry points
- [Application Development Reference](../4-application-guide/3-reference/0-app-reference.md) — application and SDK usage
