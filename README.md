<div align="center">

# StateDock for Docker — Coming Soon

### Self-host the shared Todo for you and your AI agents.

**🚧 Coming Soon — Under Development**

A Docker-based deployment is in development. This repository is a preview of the planned release; Docker images and installation instructions are not available yet.

[StateDock website](https://statedock.dev) · [Usage documentation](https://statedock.dev/docs) · [Agent setup guide](https://statedock.dev/agent.md) · [Main project](https://github.com/statedock/statedock)

</div>

---

## Keep the work moving across sessions

You close one coding session. You open another. Your next agent needs to know what you were building, what you decided, and where the work stopped.

StateDock gives independent developers and small teams a shared Todo for humans and AI agents. Goals, decisions, task states, and delivery summaries stay with the project, so the next session can pick up the same work.

Through MCP, compatible coding agents can record plans, restore project context, claim assigned Ready tasks, report blockers, and leave structured handoffs. You see the goals and outcomes; your agents get the context they need to continue.

StateDock records and coordinates work. Your coding agent performs the implementation. StateDock does not run, schedule, or wake agents.

## Why a Docker edition?

The planned Docker edition aims to bring this workflow to your own server, NAS, or VPS, with Docker and Compose simplifying self-hosting.

The direction is simple: keep your project memory on infrastructure you manage, while retaining the shared workflow between you and your agents.

## Planned scope

The core StateDock application already provides the workflows below. Bringing them to the Docker edition is **planned / targeted**; they have not yet been ported and verified as a Docker release.

| Capability | Target for the Docker edition |
| --- | --- |
| Shared task lifecycle | Planned → Ready → Working / Waiting → Done |
| MCP agent access | Project context recovery, assigned Ready queues, and delivery summaries |
| Project and task views | A shared place to see goals, decisions, progress, and outcomes |
| Small-team project sharing | Humans and agents collaborating around the same project |
| Cross-agent handoffs | Preserve what changed, how it was verified, and what comes next |
| Notification integrations | Surface completion and blockers through supported channels |
| Docker / Compose deployment | A simpler self-hosting path for a personal server, NAS, or VPS |

These are targets, not a release guarantee. Packaging, configuration, supported environments, and feature parity will be documented once they have been implemented and verified.

## Two deployment paths

- **Cloudflare self-hosting:** the existing StateDock implementation has a Cloudflare deployment path. See the [main project](https://github.com/statedock/statedock) and its [self-hosting documentation](https://github.com/statedock/statedock/blob/main/docs/self-hosting.md). Repository access depends on its current publication status.
- **Docker self-hosting:** the separate deployment path being developed here. No runnable Docker distribution has been released.

You can explore StateDock today at [statedock.dev](https://statedock.dev) and read the [usage documentation](https://statedock.dev/docs).

## Current status

This repository is an announcement and roadmap page only.

- No Docker images are available.
- No Compose files, deployment scripts, or installation instructions are available.
- No stable release date has been announced.

Verified setup instructions will be added when a runnable release is ready. Until then, there is nothing to install from this repository.

## Help shape the release

Would you run StateDock on a NAS, a home server, or a VPS? Which agents and notification channels matter to your workflow?

[Open an issue](https://github.com/statedock/statedock-docker/issues) to share your intended setup, ask a question, or suggest a priority. Star or watch this repository if you want to follow its development.
