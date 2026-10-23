import test from 'node:test';
import assert from 'node:assert/strict';

import { Arcane } from '../dist/nodes/Arcane/Arcane.node.js';
import { ArcaneTrigger } from '../dist/nodes/ArcaneTrigger/ArcaneTrigger.node.js';
import { ArcaneWebhookTrigger } from '../dist/nodes/ArcaneWebhookTrigger/ArcaneWebhookTrigger.node.js';
import { ArcaneApi } from '../dist/credentials/ArcaneApi.credentials.js';

// Helper mock functions
function createMockExecuteFunctions({
	resource = 'container',
	operation = 'getAll',
	parameters = {},
	items = [{ json: { myInput: 'test' } }],
	mockResponse = { data: [{ id: 'item_1', name: 'test_item' }] },
	continueOnFail = false,
	failRequest = false,
} = {}) {
	const calls = [];

	const context = {
		getNode() {
			return { name: 'Arcane', type: 'n8n-nodes-arcane.arcane' };
		},
		getInputData() {
			return items;
		},
		getNodeParameter(paramName, itemIndex, defaultValue) {
			if (paramName === 'resource') return resource;
			if (paramName === 'operation') return operation;
			if (paramName in parameters) return parameters[paramName];
			if (defaultValue !== undefined) return defaultValue;
			return '';
		},
		continueOnFail() {
			return continueOnFail;
		},
		helpers: {
			constructExecutionMetaData(data, meta) {
				return data.map((d) => ({ ...d, ...meta }));
			},
			returnJsonArray(data) {
				if (Array.isArray(data)) {
					return data.map((d) => ({ json: d }));
				}
				return [{ json: data }];
			},
			httpRequestWithAuthentication: async (credName, options) => {
				calls.push({ credName, options });
				if (failRequest) {
					throw new Error('API request failed');
				}
				return mockResponse;
			},
		},
		getCredentials: async () => ({
			baseUrl: 'http://localhost:3552',
			apiKey: 'secret_key_123',
		}),
	};

	return { context, calls };
}

test('Credentials definition test', () => {
	const cred = new ArcaneApi();
	assert.equal(cred.name, 'arcaneApi');
	assert.equal(cred.displayName, 'Arcane API');
	assert.ok(cred.properties.find((p) => p.name === 'baseUrl'));
	assert.ok(cred.properties.find((p) => p.name === 'apiKey'));
	assert.equal(cred.authenticate.type, 'generic');
	assert.ok(cred.test.request.url.includes('/api/version'));
});

test('Arcane Node description and resources', () => {
	const node = new Arcane();
	assert.equal(node.description.name, 'arcane');
	assert.equal(node.description.displayName, 'Arcane');
	assert.equal(node.description.usableAsTool, true);

	const resourceProp = node.description.properties.find((p) => p.name === 'resource');
	assert.ok(resourceProp);
	const resources = resourceProp.options.map((o) => o.value);
	assert.deepEqual(resources.sort(), [
		'container',
		'environment',
		'image',
		'network',
		'project',
		'volume',
	].sort());
});

test('Functional test: Arcane execute - Container getAll', async () => {
	const node = new Arcane();
	const mockData = {
		data: [
			{ id: 'c1', name: 'redis-cache', state: 'running' },
			{ id: 'c2', name: 'api-server', state: 'running' },
		],
	};

	const { context, calls } = createMockExecuteFunctions({
		resource: 'container',
		operation: 'getAll',
		parameters: {
			environmentId: 'env_1',
			returnAll: false,
			limit: 10,
		},
		mockResponse: mockData,
	});

	const result = await node.execute.call(context);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].options.method, 'GET');
	assert.ok(calls[0].options.url.endsWith('/api/environments/env_1/containers'));
	assert.equal(calls[0].options.qs.limit, 10);

	assert.equal(result.length, 1);
	assert.equal(result[0].length, 2);
	assert.equal(result[0][0].json.name, 'redis-cache');
	assert.equal(result[0][0].itemData.item, 0);
	assert.equal(result[0][1].json.name, 'api-server');
});

test('Functional test: Arcane execute - Container restart action', async () => {
	const node = new Arcane();
	const mockResponse = { success: true, message: 'Container restarted' };

	const { context, calls } = createMockExecuteFunctions({
		resource: 'container',
		operation: 'restart',
		parameters: {
			environmentId: 'env_prod',
			containerId: 'container_abc',
		},
		mockResponse,
	});

	const result = await node.execute.call(context);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].options.method, 'POST');
	assert.ok(calls[0].options.url.endsWith('/api/environments/env_prod/containers/container_abc/restart'));
	assert.deepEqual(result[0][0].json, mockResponse);
});

test('Functional test: Arcane execute - Project (Stack) Up action', async () => {
	const node = new Arcane();
	const mockResponse = { status: 'deployed', project: 'web-stack' };

	const { context, calls } = createMockExecuteFunctions({
		resource: 'project',
		operation: 'up',
		parameters: {
			environmentId: 'env_1',
			projectId: 'proj_stack_1',
		},
		mockResponse,
	});

	const result = await node.execute.call(context);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].options.method, 'POST');
	assert.ok(calls[0].options.url.endsWith('/api/environments/env_1/projects/proj_stack_1/up'));
	assert.deepEqual(result[0][0].json, mockResponse);
});

test('Functional test: Arcane execute - Error handling with continueOnFail', async () => {
	const node = new Arcane();

	const { context } = createMockExecuteFunctions({
		resource: 'container',
		operation: 'start',
		parameters: {
			environmentId: 'env_1',
			containerId: 'non_existent',
		},
		continueOnFail: true,
		failRequest: true,
	});

	const result = await node.execute.call(context);
	assert.equal(result.length, 1);
	assert.equal(result[0].length, 1);
	assert.ok(result[0][0].json.error);
	assert.equal(result[0][0].json.error, 'API request failed');
});

test('Functional test: Arcane Trigger poll - manual mode', async () => {
	const trigger = new ArcaneTrigger();
	const mockEvents = {
		data: [
			{ id: 'evt_1', type: 'container.started', severity: 'info', createdAt: '2026-10-23T10:00:00Z' },
			{ id: 'evt_2', type: 'container.stopped', severity: 'info', createdAt: '2026-10-23T09:00:00Z' },
		],
	};

	const context = {
		getNode: () => ({ name: 'Arcane Trigger' }),
		getWorkflowStaticData: () => ({}),
		getNodeParameter: (param) => (param === 'limit' ? 50 : ''),
		getMode: () => 'manual',
		helpers: {
			httpRequestWithAuthentication: async () => mockEvents,
			returnJsonArray: (arr) => arr.map((item) => ({ json: item })),
		},
		getCredentials: async () => ({ baseUrl: 'http://localhost:3552', apiKey: 'key' }),
	};

	const result = await trigger.poll.call(context);
	assert.ok(result);
	assert.equal(result[0].length, 1);
	assert.equal(result[0][0].json.id, 'evt_1');
});

test('Functional test: Arcane Trigger poll - initial run then incremental poll', async () => {
	const trigger = new ArcaneTrigger();
	const staticData = {};

	const mockEventsBatch1 = {
		data: [
			{ id: 'evt_10', createdAt: '2026-10-23T12:00:00Z' },
			{ id: 'evt_9', createdAt: '2026-10-23T11:00:00Z' },
		],
	};

	let currentEvents = mockEventsBatch1;

	const context = {
		getNode: () => ({ name: 'Arcane Trigger' }),
		getWorkflowStaticData: () => staticData,
		getNodeParameter: (param) => (param === 'limit' ? 50 : ''),
		getMode: () => 'trigger',
		helpers: {
			httpRequestWithAuthentication: async () => currentEvents,
			returnJsonArray: (arr) => arr.map((item) => ({ json: item })),
		},
		getCredentials: async () => ({ baseUrl: 'http://localhost:3552', apiKey: 'key' }),
	};

	// Run 1: First poll should store watermark and return null
	const res1 = await trigger.poll.call(context);
	assert.equal(res1, null);
	assert.equal(staticData.lastEventId, 'evt_10');
	assert.equal(staticData.lastTimestamp, '2026-10-23T12:00:00Z');

	// Run 2: New event arrives
	currentEvents = {
		data: [
			{ id: 'evt_11', createdAt: '2026-10-23T12:30:00Z' },
			{ id: 'evt_10', createdAt: '2026-10-23T12:00:00Z' },
		],
	};

	const res2 = await trigger.poll.call(context);
	assert.ok(res2);
	assert.equal(res2[0].length, 1);
	assert.equal(res2[0][0].json.id, 'evt_11');
	assert.equal(staticData.lastEventId, 'evt_11');
});

test('Functional test: Arcane Webhook Trigger - webhook execution', async () => {
	const webhookTrigger = new ArcaneWebhookTrigger();
	const incomingPayload = { event: 'container_crashed', containerId: 'c_99' };
	const incomingHeaders = { 'content-type': 'application/json', host: 'n8n.internal' };

	const context = {
		getBodyData: () => incomingPayload,
		getHeaderData: () => incomingHeaders,
		getQueryData: () => ({ env: 'prod' }),
		getNodeParameter: (param) => {
			if (param === 'options') return { includeHeaders: true, includeQuery: true };
			return {};
		},
		helpers: {
			returnJsonArray: (arr) => arr.map((item) => ({ json: item })),
		},
	};

	const result = await webhookTrigger.webhook.call(context);
	assert.ok(result.workflowData);
	const outputItem = result.workflowData[0][0].json;
	assert.deepEqual(outputItem.body, incomingPayload);
	assert.deepEqual(outputItem.headers, incomingHeaders);
	assert.deepEqual(outputItem.query, { env: 'prod' });
});

test('Functional test: loadOptions methods', async () => {
	const node = new Arcane();
	const mockEnvs = {
		data: [
			{ id: 'env_1', name: 'Staging' },
			{ id: 'env_2', name: 'Production' },
		],
	};

	const context = {
		getNode: () => ({ name: 'Arcane' }),
		helpers: {
			httpRequestWithAuthentication: async () => mockEnvs,
		},
		getCredentials: async () => ({ baseUrl: 'http://localhost:3552', apiKey: 'key' }),
	};

	const options = await node.methods.loadOptions.getEnvironments.call(context);
	assert.equal(options.length, 2);
	assert.equal(options[0].name, 'Staging');
	assert.equal(options[0].value, 'env_1');
	assert.equal(options[1].name, 'Production');
	assert.equal(options[1].value, 'env_2');
});
