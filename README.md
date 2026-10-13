# StateDock Docker

A shared workspace for people and coding agents to track project goals, tasks, and outcomes.

> **One container. Built-in SQLite. No external database. No mandatory email service.**
> Your tasks, projects, and agent handoffs — under your control.

---

## 快速开始

### 方式一：单容器运行（最简方式）

在任何已安装 Docker 的服务器或开发机上运行：

```sh
docker run -d \
  --name statedock \
  --restart unless-stopped \
  -p 3000:3000 \
  -v ~/statedock-data:/data \
  statedock/statedock:latest
```

#### 首次启动安全初始化（防公网抢注）

容器首次启动时会自动生成高强度一次性 `Setup Token`，请查看日志：

```sh
docker logs statedock
```

在终端输出中找到类似如下提示：
```text
======================================================================
 [StateDock Setup Required] 首次启动安全初始化密钥：
 Setup Token: sd_setup_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 初始化激活页面: http://<你的IP>:3000/setup?token=sd_setup_...
 完成初始化后该入口将永久关闭，防止公网抢注管理员。
======================================================================
```
在浏览器中打开链接完成管理员账号设置后，初始化入口将永久关闭。

---

### 方式二：Docker Compose + 自动 HTTPS（推荐公网部署）

适合拥有独立域名的 VPS 用户，通过内置 Caddy 容器自动申请和轮换 Let's Encrypt 证书：

1. 克隆或下载配置：
   ```sh
   git clone https://github.com/statedock/statedock-docker.git
   cd statedock-docker
   ```

2. 修改 `caddy/Caddyfile`，将 `dock.example.com` 替换为你的实际解析域名：
   ```caddy
   dock.example.com {
       reverse_proxy statedock:3000
   }
   ```

3. 启动服务：
   ```sh
   docker compose up -d
   ```

> 提示：如果使用 1Panel、宝塔或已有 Nginx 反向代理，可使用**方式一**启动并在现有面板中添加反向代理规则指向 `localhost:3000`。

---

## 连接 Coding Agent（MCP）

StateDock 提供标准 Streamable HTTP MCP 协议端点：

* **端点地址**：`http://<VPS-IP>:3000/mcp`（或 `https://dock.example.com/mcp`）
* **支持客户端**：Cursor, VS Code, Codex, Claude Desktop, Antigravity 等。

### 配置示例（如 Cursor / Claude Desktop / Codex）

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

Agent 连接后可自动调用 `get_instance_info`、`resume_project`、`claim_next_task` 及 `submit_handoff` 等工具，与团队共同围绕项目推进任务。

---

## 数据备份与持久化

所有数据持久化保存在挂载的 `/data` 目录中：
* `/data/statedock.db`：主数据库（默认开启 SQLite WAL 模式）
* `/data/attachments/`：截图与任务附件
* `/data/backups/`：备份归档

### 在线热备份（零停机）
由于启用了 SQLite WAL 模式，避免直接在运行期复制 `.db` 文件。可通过 API 触发原生的原子快照：

```sh
curl -X POST http://localhost:3000/api/admin/backup
```
数据库将在 `/data/backups/` 下自动生成干净且一致的 `statedock-backup-YYYY-MM-DDTHH-mm-ss.db` 快照。

### 跨服务器迁移
在原服务器停机后，直接打包宿主机挂载的 `~/statedock-data` 目录，复制到新服务器对应路径并重新拉起容器即可无缝恢复。

---

## 本地开发与测试

运行要求：Node.js 22+ 与 pnpm 9.15.4。

```sh
pnpm install
pnpm build
pnpm test
pnpm dev
```

---

## 开源协议

StateDock Docker 基于 [AGPL-3.0-only](LICENSE) 开源发布。
第三方依赖协议详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
