---
description: NE503 Python SDK examples using the current hailo_ipc_sdk package for inference subscriptions, event publishing, device control, and graceful cleanup.
keywords: [NE503 SDK examples, hailo_ipc_sdk, InferenceClient, EventClient, DeviceClient, inference, events]
tags: [SDK Examples, NE503, Python, Inference, Event Integration]
---

# SDK Examples

This page keeps four common application skeletons. The code follows the current imports and client methods in the engineering repository; `stream`, `model`, and permissions still need to be confirmed on the target device.

For complete projects, `app.yaml`, and build files, see [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps). See the [SDK Workflow](../1-app-development/0-sdk-workflow.md) for deployment steps.

## 1. Subscribe to inference and count targets

`InferenceClient.subscribe()` yields `(frame_seq, result)`. Detection results can use `count_by_label()` or iterate through `result.objects`:

```python
from hailo_ipc_sdk import InferenceClient


def main():
    inference = InferenceClient()
    try:
        for frame_seq, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            count = result.count_by_label("person")
            if count:
                print(f"frame={frame_seq}: {count} person(s)")
    finally:
        inference.close()


if __name__ == "__main__":
    main()
```

This skeleton follows the repository's [object-detection example](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py) and [people-counting example](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py). Do not assume every model has `objects`; process classification, pose, or OCR fields according to the actual result type.

## 2. Publish inference as a business event

An app can convert detections into business events. The event topic must also be covered by the manifest's `events.publish` allowlist:

```python
from hailo_ipc_sdk import EventClient, InferenceClient


def main():
    inference = InferenceClient()
    events = EventClient()
    try:
        for frame_seq, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            count = result.count_by_label("person")
            if count > 0:
                events.publish(
                    "app/alert",
                    {
                        "type": "person_detected",
                        "count": count,
                        "frame_sequence": frame_seq,
                    },
                )
    finally:
        inference.close()
        events.close()


if __name__ == "__main__":
    main()
```

`EventClient.publish()` also supports `persistent=True`, `ttl_ms`, and `metadata`. See [Event Integration](./5-event-integration.md) for persistence, wildcard subscriptions, and message fields.

## 3. Drive device control from inference

Declare the corresponding device permission in `app.yaml` before using `DeviceClient`. The following example shows the white-light control used by the repository examples:

```python
from hailo_ipc_sdk import DeviceClient, InferenceClient


def main():
    inference = InferenceClient()
    device = DeviceClient()
    light_on = False
    try:
        for _, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            detected = result.has_person()
            if detected and not light_on:
                device.set_white_light(100)
                light_on = True
            elif not detected and light_on:
                device.set_white_light(0)
                light_on = False
    finally:
        if light_on:
            device.set_white_light(0)
        inference.close()
        device.close()


if __name__ == "__main__":
    main()
```

See the [people-counting example](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py) for thresholds, alert de-duplication, rolling statistics, and signal handling. Do not enable PTZ, lens, IR-CUT, or GPIO operations without confirming hardware capability.

## 4. Long-running apps and graceful shutdown

Streaming subscriptions block while waiting for frames. A production app should at least receive `SIGINT`/`SIGTERM`, stop its main loop, and close every SDK client:

```python
import signal

from hailo_ipc_sdk import EventClient, InferenceClient


running = True


def stop(_signum, _frame):
    global running
    running = False


signal.signal(signal.SIGINT, stop)
signal.signal(signal.SIGTERM, stop)

inference = InferenceClient()
events = EventClient()
try:
    for frame_seq, result in inference.subscribe(
        stream="main", model="person_vehicle_v1", fps=10
    ):
        if not running:
            break
        # Process result
finally:
    inference.close()
    events.close()
```

The people-counting and object-detection examples close their clients on exit. The current `main.py` under `face-cascade` is still a simple person-detection-to-alert example, not a verified crop-and-second-inference implementation; do not treat its README description as working cascade code.

## 5. Turn an example into a deployable app

1. Copy the `neoruntime-apps/examples` project closest to your use case.
2. Use `hailo_ipc_sdk` consistently in imports.
3. Replace example streams, model IDs, and event topics with values verified on the target device.
4. Declare only the permissions used by the code and configure resources, mounts, and health checks using [App Reference](./0-app-reference.md).
5. Build the image, install and start the app, then inspect app logs and device-side results.

## 6. Related documentation

- [SDK Reference](./1-sdk-reference.md) — package, modules, endpoints, and platform constraints
- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — build, deployment, and first call
- [App Reference](./0-app-reference.md) — `app.yaml` and permissions
- [Event Integration](./5-event-integration.md) — Event Bus integration
- [RESTful API Reference](./3-restful-api.md) — external management interfaces
