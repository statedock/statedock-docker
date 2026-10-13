# StateDock documentation

One guide for StateDock Cloud, Cloudflare self-hosting, and the planned Docker edition. The browser page at [statedock.dev/doc](https://statedock.dev/doc) renders this file; [doc.md](https://statedock.dev/doc.md) remains available to Markdown clients. Choose a deployment section before following setup instructions.

StateDock stores shared project context and coordinates work. It does not run or wake coding agents, and it does not read your source code.

## Overview

StateDock gives people and their coding agents one place to record project decisions, Planned ideas, Ready work, progress, blockers, and verified outcomes. Connect compatible tools through MCP, assign tasks to an Agent Identity, and continue the same project across sessions.

Choose the deployment you use:

- **StateDock Cloud**: sign in at [app.statedock.dev](https://app.statedock.dev). StateDock operates the service and account.
- **Cloudflare self-hosted**: deploy the open-source edition in your own Cloudflare account. You operate the instance, email delivery, and backups.
- **Docker self-hosted**: planned; no runnable distribution is available yet.

## Getting started

1. Choose one deployment above and open its web app.
2. Sign in or, for Cloudflare self-hosting, ask the instance administrator to approve your account.
3. Create or select a project, then add a StateDock connection in your coding tool. Use the instance URL and credentials for the same deployment.
4. Install or refresh the [StateDock Agent setup guide](/agent.md) and [skill](/skill.md) from that same instance. At session start, an agent should call **get_instance_info** and **resume_project** for the bound project.

For a remote MCP client, create an access token in **MCP Connections** and add the server URL and bearer token to its MCP settings. A typical HTTP configuration is:

~~~json
{
  "mcpServers": {
    "statedock": {
      "url": "https://statedock.dev/mcp",
      "headers": {
        "Authorization": "Bearer sdm_YOUR_TOKEN_HERE"
      }
    }
  }
}
~~~

For Codex, use the supported remote HTTP configuration:

~~~toml
[mcp_servers.statedock]
url = "https://statedock.dev/mcp"
http_headers = { "Authorization" = "Bearer sdm_YOUR_TOKEN_HERE" }
~~~

Replace the host and token with your own instance values. Never publish a real token. ChatGPT web connects through the instance's OAuth consent flow; see the [agent guide](/agent.md).

## Shared features

- **Project memory**: store goals, decisions, task state, Markdown notes, and concise handoffs. Source code stays in your Git repository.
- **Task flow**: keep ideas Planned until they are explicitly Ready; agents can claim eligible Ready work, report blockers, and record a result.
- **Agent identities**: bind MCP connections to a logical identity, assign tasks to that identity, and keep each identity's Ready queue separate. An identity does not create or launch an AI tool.
- **Collaboration**: share a project with invited members; project access is isolated from other projects.
- **History and notifications**: review task activity and receive updates through enabled push or external notification channels.

Cloud and self-hosted deployments share these workflows. Account management, instance administration, billing, and resource ownership depend on the deployment; see the relevant section.

## Agent identities and Ready queues

An Agent Identity names a logical work queue, such as **Codex-Mac**, **Codex-Cloud**, or **Harness**. It is not a running agent. Several MCP tokens or OAuth connections may share one identity and therefore share its queue.

1. Add an identity under **MCP Connections → Agent Identities**.
2. Bind a new token when creating it, or change an existing token's **Identity** setting. For OAuth, select an identity during authorization; reconnect to change an existing authorization.
3. On a task, choose **Assigned Identity**, save it, then set the status to **Ready**.
4. Ask the connected agent to work its assigned queue. By default, **list_ready_tasks(mode="mine")** and **claim_next_task(mode="mine")** use the identity verified from its credentials. Unassigned tasks are excluded unless the user explicitly authorizes that queue.

**Unbound** means a connection has no identity; **Unassigned** means a task has no assigned identity. A host may need a refreshed MCP connection or a new conversation after OAuth changes. Verify the connection with **get_instance_info**; do not infer identity from an app name or token label. Ready tasks do not wake an agent.

See the [identity and queue setup guide](/agent.md#agent-identities-and-assigned-ready-tasks).

## Task lifecycle

| Status | Meaning |
| --- | --- |
| Planned | An idea or proposal that is not authorized for execution yet. |
| Ready | Approved work that can be claimed; identity assignments can isolate queues. |
| In Progress | An agent or person is actively working on it. |
| Needs Input | Work is waiting on a decision, access, or another blocker. |
| Completed | The result and verification have been recorded. |
| Dropped | The proposal was intentionally cancelled. |

When implementation starts, record the goal and decisions first. A completed handoff should say what changed, how it was checked, and what remains. StateDock records the work; the connected coding agent performs it.

## StateDock Cloud

The official hosted service is available at [app.statedock.dev](https://app.statedock.dev). StateDock operates accounts, authentication, service infrastructure, and billing.

The current plans are listed on the live [pricing page](https://statedock.dev/#pricing), so this guide does not duplicate prices. Free includes up to 2 active project slots and 1 active notification channel, with no project invitations. Pro includes unlimited active project slots, up to 10 collaborators per project, and unlimited notification channels. Remote MCP and Agent Identity queues are available on both plans. Stripe configuration and the pricing page determine current prices.

## Cloudflare self-hosted

The Cloudflare edition runs in your own account using **Workers, D1, KV, and R2**. You own the infrastructure, domain, email delivery, secrets, and backups. It does not connect to the official Cloud database and has no StateDock Cloud subscription tiers or billing limits.

A public HTTPS origin is needed for external OAuth and MCP clients. The first verified administrator approves instance users; public self-registration is disabled. The administrator manages admission and instance settings but does not automatically receive project data access. Use your own email provider and notification endpoints.

The open-source repository includes instructions that can be followed without this website:

- [Install and deploy](https://github.com/statedock/statedock/blob/main/docs/self-hosting.md)
- [Back up, restore, and upgrade](https://github.com/statedock/statedock/blob/main/docs/operations.md)
- [Migrations and agent setup](https://github.com/statedock/statedock/blob/main/docs/migrations.md) · [agent guide](https://github.com/statedock/statedock/blob/main/docs/agent-setup.md)

Keep D1, R2 attachments, OAuth KV, configuration, and secrets in your backup plan. Do not use the official Cloud's database or resource IDs for a self-hosted Worker.

## Docker self-hosted

**Coming soon.** The Docker edition is not available to install. There are no released images, Compose files, installation commands, or confirmed release date. The [Docker repository](https://github.com/statedock/statedock-docker) is an announcement page; follow it for a release notice. Do not use Cloudflare setup commands for Docker.

## Notifications

Depending on the deployment and its configuration, StateDock can deliver built-in Web Push notifications and connect optional channels such as Telegram, Discord, Bark, ntfy, and outgoing webhooks. Each user configures their own notification preferences in Cloud; a self-hosted operator supplies and maintains the instance's integrations. See the applicable deployment guide for setup.

## Troubleshooting

- **The agent sees no Ready work**: check that the task is Ready, assigned to the intended identity, and in the project returned by **get_instance_info**. Confirm that the current MCP connection is bound to that identity.
- **The agent reports a different identity**: compare **agentId**, **publicOrigin**, and **mcpUrl** from **get_instance_info** with the connection in MCP settings. Refresh cached OAuth/MCP tools or start a new conversation after changing authorization.
- **A Cloudflare user cannot sign in**: ask the instance administrator to approve the exact account email and check that email delivery is configured.
- **A self-hosted MCP/OAuth client cannot connect**: use the instance's public HTTPS origin, then verify its Worker configuration, OAuth discovery, email sender, and secrets.
- **A guide link does not open**: use the [Cloudflare repository](https://github.com/statedock/statedock/tree/main/docs) for deployment and operations guides. The Cloudflare app can also serve the matching Markdown guide files directly.

For machine-readable setup, visit [agent.md](/agent.md), [setup.md](/setup.md), and [skill.md](/skill.md). These URLs have separate roles and remain available for existing clients.
