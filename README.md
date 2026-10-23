# @iamprompt/n8n-nodes-arcane

[![npm version](https://badge.fury.io/js/@iamprompt%2Fn8n-nodes-arcane.svg)](https://badge.fury.io/js/@iamprompt%2Fn8n-nodes-arcane)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An [n8n](https://n8n.io/) community node package to interact with the **Arcane** Docker and container management platform via its REST API.

Manage environments, containers, Docker Compose projects/stacks, images, networks, and persistent volumes directly from your n8n workflows.

---

## Features

- **Multi-Environment Support**: Seamlessly switch between local Docker daemons, remote clusters, and edge agent environments.
- **Dynamic Loaders**: Dropdown selectors for Environments, Containers, and Projects loaded in real-time from your Arcane instance, with support for expressions.
- **Comprehensive Lifecycle Operations**:
  - **Containers**: Start, stop, restart, pause, unpause, kill, redeploy, delete, and download logs.
  - **Projects / Stacks**: Deploy (`docker compose up`), take down (`docker compose down`), restart, pull images, build, redeploy, inspect YAML, and destroy.
  - **Images**: Pull from registry, tag, remove, and prune unused images.
  - **Networks**: Create, connect/disconnect containers, delete, and prune networks.
  - **Volumes**: Create named volumes, inspect, delete, and prune unused volumes.
  - **Environments**: Create, inspect, update, sync, and test agent connectivity.
- **Trigger Nodes**:
  - **Arcane Trigger**: Polls the Arcane event log (`/events`) with severity and environment filtering.
  - **Arcane Webhook Trigger**: Listens for incoming Arcane notification webhook payloads.

---

## Installation

### Community Nodes (Recommended)
1. In your n8n instance, go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `@iamprompt/n8n-nodes-arcane` into the **npm Package Name** field.
4. Agree to the risks and select **Install**.

### Manual Installation
In your n8n root directory (typically `~/.n8n`):
```bash
npm install @iamprompt/n8n-nodes-arcane
```

---

## Credentials Setup

1. In n8n, create a new credential: **Arcane API**.
2. Configure:
   - **Base URL**: The URL where your Arcane instance is running (e.g., `http://localhost:3552` or `https://arcane.example.com`).
   - **API Key**: Create an API key in your Arcane dashboard under **Settings > API Keys** and paste it here.
3. Save the credential. n8n will test connectivity against `/api/version`.

---

## Node Reference

### 1. Arcane (Action Node)

#### Environment
- **Create**: Add a new agent/environment endpoint.
- **Delete**: Remove an environment.
- **Get**: Retrieve environment details by ID.
- **Get Many**: List all environments.
- **Get Version**: Get environment version details.
- **Sync**: Trigger synchronization with the agent.
- **Test Connection**: Test agent connectivity.
- **Update**: Update environment name or settings.

#### Container
- **Create**: Create and configure a new Docker container with environment variables, ports, volumes, resource limits, and restart policies.
- **Get Many**: List containers running in the selected environment.
- **Get**: Get full container configuration and runtime state.
- **Start / Stop / Restart**: Manage container runtime state.
- **Pause / Unpause**: Pause or resume container execution.
- **Kill**: Send termination signal to a container.
- **Redeploy**: Recreate and redeploy container with latest image.
- **Delete**: Remove a container (supports force and removing associated volumes).
- **Get Logs**: Download execution logs from container stdout/stderr.

#### Project (Docker Compose / Stacks)
- **Get Many**: List all compose projects in the environment.
- **Get**: Get project status and metadata.
- **Get Compose**: Retrieve the `docker-compose.yml` manifest.
- **Up**: Deploy and bring up project services (`docker compose up`).
- **Down**: Stop and remove project containers (`docker compose down`).
- **Restart**: Restart all or specific services in the project.
- **Redeploy**: Pull latest images and redeploy project stack.
- **Pull**: Pull latest images specified in compose file.
- **Build**: Build service images from source.
- **Destroy**: Completely remove project and related compose resources.

#### Image
- **Get Many**: List images on the host.
- **Get**: Retrieve image details by ID or reference.
- **Pull**: Pull image by name and tag from registry.
- **Tag**: Tag an existing image with a new repository/tag.
- **Remove**: Untag/remove an image from the host.
- **Prune**: Clean up dangling and unused images.

#### Network
- **Get Many**: List Docker networks.
- **Get**: Retrieve network details.
- **Create**: Create a new Docker network (bridge, overlay, host, macvlan).
- **Delete**: Remove a network.
- **Prune**: Remove all unused networks.
- **Connect / Disconnect**: Attach or detach a container to/from a network.

#### Volume
- **Get Many**: List Docker volumes.
- **Get**: Inspect a named volume.
- **Create**: Create a named persistent volume.
- **Delete**: Remove a volume.
- **Prune**: Clean up unused volumes.

---

### 2. Arcane Trigger (Polling)

Starts a workflow whenever new events or state changes occur in Arcane.

- **Environment**: Optionally filter events by a specific environment.
- **Severity**: Filter events by `Info`, `Warning`, `Error`, or `All`.
- **Deduplication**: Automatically persists the last event timestamp/ID across polling executions so events are never duplicated.

---

### 3. Arcane Webhook Trigger (Webhook)

Provides a dedicated n8n webhook URL to receive notifications dispatched by Arcane notification providers or container update webhooks.

- Output includes request payload body, optional request headers, and query parameters.

---

## Development

```bash
# Clone the repository
git clone https://github.com/iamprompt/n8n-nodes-arcane.git
cd n8n-nodes-arcane

# Install dependencies
npm install

# Build the node package
npm run build

# Watch mode during development
npm run build:watch

# Run linter
npm run lint
```

### Publishing to npm via GitHub Actions (OIDC)

This repository includes a GitHub Actions workflow ([`.github/workflows/publish.yml`](.github/workflows/publish.yml)) configured for **npm Trusted Publishing (OIDC)** and cryptographic **build provenance**.

#### Setting up npm Trusted Publishing:
1. On [npmjs.com](https://www.npmjs.com/), go to your package settings: **Settings > Publishing access**.
2. Under **Trusted Publishers**, select **Add a publisher** and choose **GitHub Actions**:
   - **Repository owner**: `iamprompt`
   - **Repository name**: `n8n-nodes-arcane`
   - **Workflow name**: `publish.yml`
   - **Environment**: (Leave empty unless using GitHub Environments)
3. No secrets or tokens are needed in GitHub. Pushing a version tag (`v0.1.0` or `0.1.0`) or creating a GitHub Release will automatically authenticate via OIDC, build, test, and publish to npm with verified provenance.

---

## License

[MIT](LICENSE.md)
