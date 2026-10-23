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
				name: 'Create',
				value: 'create',
				action: 'Create a container',
				description: 'Create and configure a new Docker container',
			},
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

	// Create container fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my-container',
		displayOptions: {
			show: {
				resource: ['container'],
				operation: ['create'],
			},
		},
		description: 'Name of the container to create',
	},
	{
		displayName: 'Image',
		name: 'image',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'nginx:alpine',
		displayOptions: {
			show: {
				resource: ['container'],
				operation: ['create'],
			},
		},
		description: 'The image to use for the container',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['container'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Auto Remove',
				name: 'autoRemove',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically remove the container when it exits',
			},
			{
				displayName: 'Command',
				name: 'command',
				type: 'string',
				default: '',
				placeholder: 'npm start',
				description: 'Command to run inside the container',
			},
			{
				displayName: 'CPUs',
				name: 'cpus',
				type: 'number',
				default: 1,
				description: 'Number of CPUs to allocate',
			},
			{
				displayName: 'Entrypoint',
				name: 'entrypoint',
				type: 'string',
				default: '',
				placeholder: '/docker-entrypoint.sh',
				description: 'Custom entrypoint for the container',
			},
			{
				displayName: 'Environment Variables',
				name: 'env',
				type: 'string',
				default: '',
				placeholder: 'NODE_ENV=production,PORT=3000',
				description:
					'Environment variables in KEY=VALUE format, separated by commas or newlines',
			},
			{
				displayName: 'Memory (MB)',
				name: 'memory',
				type: 'number',
				default: 512,
				description: 'Memory limit in megabytes',
			},
			{
				displayName: 'Networks',
				name: 'networks',
				type: 'string',
				default: '',
				placeholder: 'bridge,my-net',
				description: 'Comma-separated names of networks to connect',
			},
			{
				displayName: 'Ports',
				name: 'ports',
				type: 'string',
				default: '',
				placeholder: '8080:80, 8443:443',
				description: 'Port mappings in host:container format, separated by commas',
			},
			{
				displayName: 'Privileged',
				name: 'privileged',
				type: 'boolean',
				default: false,
				description: 'Whether to run container with extended privileges',
			},
			{
				displayName: 'Restart Policy',
				name: 'restartPolicy',
				type: 'options',
				options: [
					{ name: 'Always', value: 'always' },
					{ name: 'Never', value: 'no' },
					{ name: 'On Failure', value: 'on-failure' },
					{ name: 'Unless Stopped', value: 'unless-stopped' },
				],
				default: 'unless-stopped',
				description: 'Restart behavior when container exits',
			},
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				default: '',
				placeholder: '1000:1000',
				description: 'User or UID/GID to run inside container',
			},
			{
				displayName: 'Volumes',
				name: 'volumes',
				type: 'string',
				default: '',
				placeholder: '/host/path:/container/path,my-vol:/data',
				description: 'Volume mounts in host:container format, separated by commas',
			},
			{
				displayName: 'Working Dir',
				name: 'workingDir',
				type: 'string',
				default: '',
				placeholder: '/app',
				description: 'Working directory inside container',
			},
		],
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
