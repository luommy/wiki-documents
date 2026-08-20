---
description: "NE503 device management tools: CT-Disc device discovery (protocol packets, the ct-disc CLI and GUI tools) and the aipc-cli command-line tool."
keywords: [NE503, CT-Disc, ct-disc, aipc-cli, device discovery, command line, UDP multicast, MQTT]
tags: [User Guide, NE503, Device Management, CLI]
---

# Device Management Tools

NE503 device management has two sides: **the device** continuously broadcasts its own information on the LAN (the CT-Disc protocol, implemented by the device-discovery service), while **your computer** uses the official ct-disc tool to discover and manage those devices; for details on a single device, use the on-device aipc-cli. Pick by what you're trying to do:

| Your task | Use |
|-----------|-----|
| Find the IPs and SNs of every device on the segment during bulk deployment | ct-disc CLI or GUI (runs on your computer) |
| Watch devices come online/offline, send remote commands | ct-disc |
| Change a device's network configuration remotely | ct-disc GUI |
| Manage apps, streams, models, lens on **one** device | aipc-cli (device-builtin, runs on the device) |

## CT-Disc Device Discovery

### Typical scenario: bulk deployment without hunting IPs

Deploying 10 NE503s? Instead of matching MACs to IPs in the router one by one, run a single scan from any computer on the same segment — every device's IP, SN, and firmware version in one table:

```bash
$ ct-disc scan
MAC               SN            PRODUCT   IP              PORT   FW       CAPS              LAST_SEEN
aa:bb:cc:00:11:22 CT503A001234  NE503     192.168.1.101   443    1.12.0   ai,camera,http   2026-08-20 10:32:01
aa:bb:cc:00:11:23 CT503A001235  NE503     192.168.1.102   443    1.12.0   ai,camera,http   2026-08-20 10:32:01

2 device(s) found.
```

This works because of what the protocol does underneath — mechanism first, then the full command set.

### How the Protocol Works

Each device keeps announcing itself on the LAN: the device-discovery service sends a `ct-announce` JSON packet via UDP multicast `239.255.255.250:19850` every 5 seconds. The packet carries:

| Field | What you can do with it |
|------|--------------------------|
| `sn` / `mac` | Uniquely identify a device; bulk asset registration |
| `product` | Distinguish product models (e.g., `NE503`) |
| `ip` / `port` | Go straight to the web console |
| `fw` | Check firmware versions; spot devices needing upgrades |
| `caps` | Capability list (e.g., `ai,camera,http,mqtt`) |
| `hw` | Hardware platform |

The management side learns about devices two ways: **passively**, by listening on the multicast address; or **actively**, by sending `ct-probe` packets that trigger immediate responses. Two further packet types exist:

- `ct-set-network` — remotely deliver network configuration (DHCP/static IP, gateway, DNS) to a specific device, sent unicast + multicast + broadcast to guarantee delivery;
- CAT1 cellular devices bypass UDP and register over MQTT, with command topic `ct/cmd/{sn}` and response `ct/resp/{sn}`.

### The ct-disc CLI

A cross-platform CLI (Windows / Linux / macOS), source at `tools/ct-disc/` in the neoruntime repo:

```bash
cd tools/ct-disc && make build        # local build; make build-all produces binaries for all platforms
```

Five subcommands, one job each:

| Command | What it does | When to use |
|------|--------|-----------|
| `ct-disc scan` | Send probes, collect responses immediately | Need the device list right now |
| `ct-disc list` | Listen silently for a few seconds, then list | Devices are already announcing; no probes needed |
| `ct-disc watch` | Continuously watch online/offline | Monitoring deployment stability |
| `ct-disc send` | Send a command by SN over MQTT | Managing CAT1 cellular devices |
| `ct-disc announce` | Simulate device announcements | Debugging your own management software |

```bash
ct-disc scan --timeout 3                        # scan 3 s; --count probes (default 3)
ct-disc list --product NE503 --timeout 5        # NE503 only; also filterable by --sn / --mac
ct-disc watch                                   # offline after 30 s without announcements; Ctrl+C to stop
ct-disc send <sn> reboot --broker tcp://broker:1883   # command a CAT1 device
ct-disc announce --product NE503 --interval 5   # simulate a device on a test machine
```

All commands support `-o json` / `-o yaml` (default table) for scripts, plus `--iface` to pick a network interface and `--timeout` to control the wait.

> The NE503 web console itself has no CT-Disc scanning UI; scanning is done by these tools or by host software integrating the protocol. Packet definitions live in the source at `tools/ct-disc/pkg/discover/announce.go`.

### CT-Disc GUI

Prefer not to use the command line? The repo also ships a graphical version (`tools/ct-disc/gui/ct-disc-gui/`, a Wails desktop app; build with `make gui`). It covers the CLI's scanning, watching, and command sending, plus one extra practical capability: **remotely reading/writing device network configuration** — pick a device and change its IP mode, gateway, or DNS right in the GUI, without logging into the device's web page first (backed by the device API `GET/POST /api/v1/network/config`).

## aipc-cli Command-Line Tool

aipc-cli manages **a single device**: app start/stop, stream status, model registration, lens control, and more. Two entry points:

- **Web terminal**: console **Maintenance → Terminal**, right in the browser;
- **SSH**: `ssh root@<device-ip>` and run it from the shell.

The most common commands, grouped by task:

```bash
# Overall device state
aipc-cli system info              # device info
aipc-cli system health            # health check

# Apps
aipc-cli app list                 # list apps
aipc-cli app start <id>           # start / aipc-cli app stop <id> stop
aipc-cli app logs <id> -f         # follow app logs (first stop when debugging)

# Streams
aipc-cli stream list              # stream status (check here first when pulling fails)
aipc-cli stream url <id>          # get a stream's RTSP URL

# Lens
aipc-cli device zoom in 5         # zoom (in / out / stop, speed 1-10)
aipc-cli device focus auto        # autofocus

# Models
aipc-cli model list               # list / aipc-cli model register <path> register a new model
```

Output also supports `-o table` (default) / `-o json` / `-o yaml`. The full command tree is authoritative in `aipc-cli --help` and each subcommand's `<command> --help`.

## Related Documentation

- [System Architecture](../3-software-guide/0-system-architecture.md) — device-discovery service responsibility and source pointers
- [Applications and Models](./2-applications-and-models.md) — managing apps and models from the web console
- [Troubleshooting](../5-troubleshooting.md) — device troubleshooting
