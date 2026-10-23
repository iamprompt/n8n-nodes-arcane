import type { INodeProperties } from 'n8n-workflow';

export const environmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['environment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an environment',
				description: 'Create a new Arcane environment/agent',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an environment',
				description: 'Delete an environment',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an environment',
				description: 'Retrieve details for a specific environment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many environments',
				description: 'List many environments',
			},
			{
				name: 'Get Version',
				value: 'getVersion',
				action: 'Get environment version',
				description: 'Get version information of an environment',
			},
			{
				name: 'Sync',
				value: 'sync',
				action: 'Sync an environment',
				description: 'Trigger synchronization for an environment',
			},
			{
				name: 'Test Connection',
				value: 'testConnection',
				action: 'Test environment connection',
				description: 'Test connectivity to an environment agent',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an environment',
				description: 'Update an existing environment',
			},
		],
		default: 'getAll',
	},
];

export const environmentFields: INodeProperties[] = [
	// environmentId selector
	{
		displayName: 'Environment Name or ID',
		name: 'environmentId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEnvironments',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['get', 'update', 'delete', 'testConnection', 'sync', 'getVersion'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// create fields
	{
		displayName: 'API URL',
		name: 'apiUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'http://localhost:3552/api',
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['create'],
			},
		},
		description: 'URL of the environment agent or endpoint',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'Production Cluster',
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['create', 'update'],
			},
		},
		description: 'Display name for the environment',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Access token for environment authentication',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the environment is active and enabled',
			},
			{
				displayName: 'Is Edge',
				name: 'isEdge',
				type: 'boolean',
				default: false,
				description: 'Whether this environment runs on edge mTLS',
			},
			{
				displayName: 'Use API Key',
				name: 'useApiKey',
				type: 'boolean',
				default: false,
				description: 'Whether pairing key or API key is used',
			},
		],
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['environment'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
