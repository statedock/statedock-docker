# StateDock Docker

A shared workspace for people and coding agents to track project goals, tasks, and outcomes.

> **One container. Built-in SQLite. No external database. No mandatory email service.**  
> Your tasks, projects, and agent handoffs — under your control.

---

## Quick Start

### Method 1: Single Container (Fastest)

Run on any server, VPS, or local machine with Docker installed:

```sh
docker run -d \
  --name statedock \
  --restart unless-stopped \
  -p 3000:3000 \
  -v ~/statedock-data:/data \
  statedock/statedock:latest
```

#### First-Run Secure Setup (Anti-Hijacking)

When started for the first time, StateDock generates a high-entropy one-time `Setup Token`. Check your container logs:

```sh
docker logs statedock
```

You will see the activation output:

```text
======================================================================
 [StateDock Setup Required] Initial Setup Security Token:
 Setup Token: sd_setup_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 Setup URL:   http://<YOUR_IP>:3000/setup?token=sd_setup_...
 Once configured, this setup endpoint will be permanently disabled.
======================================================================
```

Open the activation link in your browser to create your administrator account. Once setup is complete, the `/setup` endpoint is permanently closed to prevent unauthorized public registrations.

---

### Method 2: Docker Compose + Automatic HTTPS (Recommended for Public VPS)

Ideal for servers with a domain name. Caddy automatically provisions and renews Let's Encrypt TLS certificates:

1. Clone or download this repository:
   ```sh
   git clone https://github.com/statedock/statedock-docker.git
   cd statedock-docker
   ```

2. Edit `caddy/Caddyfile`, replacing `dock.example.com` with your actual domain:
   ```caddy
   dock.example.com {
       reverse_proxy statedock:3000
   }
   ```

3. Start services:
   ```sh
   docker compose up -d
   ```

> **Note:** If you use an existing reverse proxy (e.g. Nginx, 1Panel, or Traefik), you can use **Method 1** and proxy traffic to `localhost:3000`.

---

## Connecting Coding Agents (MCP)

StateDock provides a standard Streamable HTTP Model Context Protocol (MCP) endpoint:

* **Endpoint URL**: `http://<YOUR_IP>:3000/mcp` (or `https://dock.example.com/mcp`)
* **Supported Clients**: Cursor, VS Code, Codex, Claude Desktop, Antigravity, etc.

### Client Configuration Example (Cursor / Claude Desktop / Codex)

```json
{
  "mcpServers": {
    "statedock": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_AGENT_TOKEN"
      }
    }
  }
}
```

Once connected, agents can call `get_instance_info`, `resume_project`, `claim_next_task`, and `submit_handoff` to collaborate on projects across coding sessions.

### StateDock coding-tool plugins

The separate [StateDock plugins repository](https://github.com/statedock/statedock-plugins) contains MIT-licensed shared Skills for saving plans, restoring task context, and recording progress. The published packages currently default to the hosted StateDock service at `https://statedock.dev/mcp`. To use them with this Docker instance, configure the agent host to connect to the endpoint above and follow the platform-specific setup; that self-hosted plugin configuration has not been verified as part of the published packages.

- **Codex:** installable from the GitHub repository as a local marketplace.
- **DeepSeek Harness:** [`@statedock/dsh-plugin`](https://www.npmjs.com/package/@statedock/dsh-plugin) is published for Harness `0.2.0-rc.2`; see the [official community showcase](https://github.com/deepseek-ai/deepseek-harness/discussions/9776).
- **ChatGPT app:** submitted to OpenAI for review; approval is pending.
- **Cursor:** Marketplace submission materials are being prepared; installation and approval are not yet verified.

The plugins only record and restore project state. They do not run task code or schedule agents. Plugin code is MIT-licensed; this Docker edition remains AGPL-3.0-only.

---

## Data Persistence & Online Backups

All state is stored inside the mounted `/data` directory:
* `/data/statedock.db`: Primary SQLite database (WAL mode enabled by default)
* `/data/attachments/`: Uploaded task screenshots and attachments
* `/data/backups/`: Database snapshot backups

### Online Hot Backups (Zero Downtime)

Because SQLite operates in WAL mode, avoid copying raw `.db` files while the process is actively running. StateDock exposes an atomic hot backup endpoint:

```sh
curl -X POST http://localhost:3000/api/admin/backup
```

This triggers SQLite `VACUUM INTO` and outputs a clean, transactionally consistent snapshot in `/data/backups/statedock-backup-YYYY-MM-DDTHH-mm-ss.db`.

### Server Migration

To migrate to another machine:
1. Stop the container: `docker stop statedock`
2. Archive the mounted directory: `tar -czvf statedock-data.tar.gz ~/statedock-data`
3. Copy the archive to your target machine, extract it, and start the container with the same volume mount.

---

## Development & Testing

Requirements: Node.js 22+ and pnpm 9.15.4.

```sh
pnpm install
pnpm build
pnpm test
pnpm dev
```

---

## License

StateDock Docker is licensed under [AGPL-3.0-only](LICENSE).  
Third-party dependency licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
