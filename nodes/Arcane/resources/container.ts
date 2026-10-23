import type { INodeProperties } from 'n8n-workflow';

export const containerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['container'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a container',
				description: 'Delete a Docker container',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a container',
				description: 'Get details for a specific container',
			},
			{
				name: 'Get Logs',
				value: 'getLogs',
				action: 'Get container logs',
				description: 'Download logs from a container',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many containers',
				description: 'List containers in an environment',
			},
			{
				name: 'Kill',
				value: 'kill',
				action: 'Kill a container',
				description: 'Send kill signal to a container',
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause a container',
				description: 'Pause all processes in a container',
			},
			{
				name: 'Redeploy',
				value: 'redeploy',
				action: 'Redeploy a container',
				description: 'Recreate and redeploy a container with latest image',
			},
			{
				name: 'Restart',
				value: 'restart',
				action: 'Restart a container',
				description: 'Restart a running or stopped container',
			},
			{
				name: 'Start',
				value: 'start',
				action: 'Start a container',
				description: 'Start a stopped container',
			},
			{
				name: 'Stop',
				value: 'stop',
				action: 'Stop a container',
				description: 'Stop a running container',
			},
			{
				name: 'Unpause',
				value: 'unpause',
				action: 'Unpause a container',
				description: 'Resume paused processes in a container',
			},
		],
		default: 'getAll',
	},
];

export const containerFields: INodeProperties[] = [
	// Environment selector (Required for all container operations)
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
				resource: ['container'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Container selector (For single-container operations)
	{
		displayName: 'Container Name or ID',
		name: 'containerId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getContainers',
			loadOptionsDependsOn: ['environmentId'],
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['container'],
				operation: [
					'get',
					'start',
					'stop',
					'restart',
					'pause',
					'unpause',
					'kill',
					'redeploy',
					'delete',
					'getLogs',
				],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Delete options
	{
		displayName: 'Force',
		name: 'force',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['container'],
				operation: ['delete'],
			},
		},
		description: 'Whether to force delete a running container',
	},
	{
		displayName: 'Remove Volumes',
		name: 'volumes',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['container'],
				operation: ['delete'],
			},
		},
		description: 'Whether to remove associated volumes',
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['container'],
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
				resource: ['container'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
