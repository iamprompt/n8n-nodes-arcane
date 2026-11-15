# Arcane API v3.0.0 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `n8n-nodes-arcane` community node package to fully align with the Arcane API v3.0.0 specification while maintaining non-breaking workflow parameter compatibility for existing users.

**Architecture:** Update API route prefixes from `/environments` to `/agents`, transition container and project actions to the v3 query action model (`?action=...`), migrate stack destruction to `DELETE`, update network connect/disconnect actions, and route event polling to dedicated `/events/agent/{environmentId}` endpoints. Update all unit and functional tests to verify the new endpoints and request signatures.

**Tech Stack:** TypeScript, n8n-workflow, @n8n/node-cli, Node.js test runner (`node:test`, `node:assert/strict`).

**Spec:** Arcane API v3.0.0 OpenAPI specification (`https://arcane.iamprompt.me/api/openapi.json` / `https://arcane.iamprompt.me/api/docs#description/introduction`).

## Global Constraints

- Preserve existing node parameter names (`environmentId`, `containerId`, `projectId`, `networkId`, `volumeName`) so existing workflows, configurations, and expressions remain backwards compatible.
- All dynamic dropdown loaders (`getEnvironments`, `getContainers`, `getProjects`) must gracefully handle errors and return `[]` on connection issues.
- All requests must authenticate using `X-API-Key: {apiKey}` via `arcaneApi` credential header injection.
- Keep package version bump ready in `package.json` (e.g., to `0.2.0`).

## Review Focus

1. **Agent/Environment ID resolution**: Environments are queried at `/agents`, but user parameter remains named `environmentId`. Verify dynamic option loader and endpoint paths interpolate correctly.
2. **Container lifecycle action query params**: `start`, `stop`, `restart`, `kill`, `pause`, `unpause` must target `POST /agents/{id}/containers/{containerId}` with query param `action={action}` instead of separate subpaths.
3. **Project deploy vs action split**: Project `up`, `redeploy`, and `pull` must target `POST /agents/{id}/projects/{projectId}/deploy?action={action}`, while `down` and `restart` target `POST /agents/{id}/projects/{projectId}?action={action}`, and `destroy` targets `DELETE /agents/{id}/projects/{projectId}`.
4. **Network attach/detach**: `connect` and `disconnect` must target `POST /agents/{id}/networks/{networkId}?action={connect|disconnect}` with JSON body `{ containerId, force? }`.
5. **ArcaneTrigger polling endpoints**: If `environmentId` is provided, poll `GET /events/agent/{environmentId}`; otherwise poll `GET /events`.

---

### Task 1: Update Generic Functions & Dynamic Loaders

**Files:**
- Modify: `nodes/Arcane/GenericFunctions.ts`
- Test: `test/functional.test.mjs`

- [ ] Update `getEnvironments` in `nodes/Arcane/GenericFunctions.ts` to call `GET /agents` instead of `GET /environments`.
- [ ] Update `getContainers` in `nodes/Arcane/GenericFunctions.ts` to call `GET /agents/${environmentId}/containers`.
- [ ] Update `getProjects` in `nodes/Arcane/GenericFunctions.ts` to call `GET /agents/${environmentId}/projects`.
- [ ] Enhance `arcaneApiRequestAllItems` to inspect `pagination.hasNextPage` in addition to checking array lengths.
- [ ] Verify TypeScript compiles with `npm run build`.

---

### Task 2: Upgrade Environment Resource Operations

**Files:**
- Modify: `nodes/Arcane/resources/environment.ts`
- Modify: `nodes/Arcane/Arcane.node.ts:133-177`
- Test: `test/functional.test.mjs`

- [ ] Update `operation === 'getAll'` to query `GET /agents`.
- [ ] Update `operation === 'get'` to query `GET /agents/${environmentId}`.
- [ ] Update `operation === 'create'` to send `POST /agents`.
- [ ] Update `operation === 'update'` to send `PATCH /agents/${environmentId}` (changed from `PUT /environments/...`).
- [ ] Update `operation === 'delete'` to send `DELETE /agents/${environmentId}`.
- [ ] Update `operation === 'testConnection'` to send `POST /agents/${environmentId}/test`.
- [ ] Update `operation === 'sync'` to send `POST /agents/${environmentId}/sync`.
- [ ] Update `operation === 'getVersion'` to send `GET /agents/${environmentId}/version`.
- [ ] Add unit test in `test/functional.test.mjs` asserting `PATCH /agents/{id}` for update and `POST /agents` for create.

---

### Task 3: Upgrade Container Resource Operations

**Files:**
- Modify: `nodes/Arcane/resources/container.ts`
- Modify: `nodes/Arcane/Arcane.node.ts:180-403`
- Test: `test/functional.test.mjs`

- [ ] Update `create` and `getAll` to target `/agents/${environmentId}/containers`.
- [ ] Update `get` to target `GET /agents/${environmentId}/containers/${containerId}`.
- [ ] Refactor `start`, `stop`, `restart`, `pause`, `unpause`, and `kill` to target `POST /agents/${environmentId}/containers/${containerId}` with query parameter `action={operation}`.
- [ ] Support optional `signal` parameter on `kill` operation.
- [ ] Update `redeploy` to target `POST /agents/${environmentId}/containers/${containerId}/redeploy`.
- [ ] Update `delete` to target `DELETE /agents/${environmentId}/containers/${containerId}` with query `{ force, volumes }`.
- [ ] Update `getLogs` to target `GET /agents/${environmentId}/containers/${containerId}/logs/download`.
- [ ] Add/update tests in `test/functional.test.mjs` for container actions with query parameter verification.

---

### Task 4: Upgrade Project (Stack) Resource Operations

**Files:**
- Modify: `nodes/Arcane/resources/project.ts`
- Modify: `nodes/Arcane/Arcane.node.ts:405-500`
- Test: `test/functional.test.mjs`

- [ ] Update `getAll` and `get` to target `/agents/${environmentId}/projects` and `/agents/${environmentId}/projects/${projectId}`.
- [ ] Update `up`, `redeploy`, and `pull` to target `POST /agents/${environmentId}/projects/${projectId}/deploy` with query parameter `action={up|redeploy|pull}`.
- [ ] Update `down` to target `POST /agents/${environmentId}/projects/${projectId}` with query parameter `action=down`.
- [ ] Update `restart` to target `POST /agents/${environmentId}/projects/${projectId}` with query parameter `action=restart` (supporting optional query `services`).
- [ ] Update `build` to target `POST /agents/${environmentId}/projects/${projectId}/build`.
- [ ] Update `destroy` to send `DELETE /agents/${environmentId}/projects/${projectId}` (replacing legacy `POST .../destroy`).
- [ ] Add tests in `test/functional.test.mjs` verifying project deploy actions and delete action.

---

### Task 5: Upgrade Image, Network, and Volume Resource Operations

**Files:**
- Modify: `nodes/Arcane/resources/image.ts`
- Modify: `nodes/Arcane/resources/network.ts`
- Modify: `nodes/Arcane/resources/volume.ts`
- Modify: `nodes/Arcane/Arcane.node.ts:501-739`
- Test: `test/functional.test.mjs`

- [ ] **Images**:
  - Update `getAll`, `get`, `pull`, `remove`, `prune`, and `tag` to target `/agents/${environmentId}/images/...`.
- [ ] **Networks**:
  - Update `getAll`, `get`, `create`, `delete`, and `prune` to target `/agents/${environmentId}/networks/...`.
  - Refactor `connect` to send `POST /agents/${environmentId}/networks/${networkId}?action=connect` with `{ containerId }`.
  - Refactor `disconnect` to send `POST /agents/${environmentId}/networks/${networkId}?action=disconnect` with `{ containerId, force }`.
- [ ] **Volumes**:
  - Update `getAll`, `get`, `create`, `delete`, and `prune` to target `/agents/${environmentId}/volumes/...`.
- [ ] Update tests in `test/functional.test.mjs` for network connect/disconnect and volume/image operations.

---

### Task 6: Upgrade ArcaneTrigger Node

**Files:**
- Modify: `nodes/ArcaneTrigger/ArcaneTrigger.node.ts`
- Test: `test/functional.test.mjs`

- [ ] Update poll logic: if `environmentId` is non-empty, call `GET /events/agent/${environmentId}`; otherwise call `GET /events`.
- [ ] Keep `severity`, `limit`, `order: 'desc'`, `sort: 'createdAt'` query parameters matching v3 spec.
- [ ] Update trigger tests in `test/functional.test.mjs` to test both global events polling and agent-scoped events polling.

---

### Task 7: Full Verification, Documentation & Version Bump

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Test: `test/functional.test.mjs`

- [ ] Bump version in `package.json` to `0.2.0`.
- [ ] Run full build: `npm run build`.
- [ ] Run linter: `npm run lint`.
- [ ] Run tests: `npm test` and verify 100% passing tests.
- [ ] Update `README.md` to document compatibility with Arcane v3.0.0+.
