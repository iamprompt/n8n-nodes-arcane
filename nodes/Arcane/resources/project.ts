import type { INodeProperties } from 'n8n-workflow';

export const projectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Build',
				value: 'build',
				action: 'Build a project',
				description: 'Build images defined in the compose project',
			},
			{
				name: 'Destroy',
				value: 'destroy',
				action: 'Destroy a project',
				description: 'Destroy project and delete all associated compose resources',
			},
			{
				name: 'Down',
				value: 'down',
				action: 'Down a project',
				description: 'Stop and remove project containers (docker compose down)',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a project',
				description: 'Get details for a specific project/stack',
			},
			{
				name: 'Get Compose',
				value: 'getCompose',
				action: 'Get project compose',
				description: 'Get docker-compose YAML contents for a project',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'List many compose projects in an environment',
			},
			{
				name: 'Pull',
				value: 'pull',
				action: 'Pull project images',
				description: 'Pull latest images for services in a compose project',
			},
			{
				name: 'Redeploy',
				value: 'redeploy',
				action: 'Redeploy a project',
				description: 'Redeploy project with new changes or images',
			},
			{
				name: 'Restart',
				value: 'restart',
				action: 'Restart a project',
				description: 'Restart services in a compose project',
			},
			{
				name: 'Up',
				value: 'up',
				action: 'Up a project',
				description: 'Deploy and bring up a project (docker compose up)',
			},
		],
		default: 'getAll',
	},
];

export const projectFields: INodeProperties[] = [
	// Environment selector (Required for all project operations)
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
				resource: ['project'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Project selector (For single-project operations)
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
			loadOptionsDependsOn: ['environmentId'],
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: [
					'get',
					'up',
					'down',
					'restart',
					'redeploy',
					'pull',
					'build',
					'destroy',
					'getCompose',
				],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Specific services filter for restart
	{
		displayName: 'Services',
		name: 'services',
		type: 'string',
		default: '',
		placeholder: 'web,db',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['restart'],
			},
		},
		description: 'Comma-separated names of specific services to restart (leave blank for all)',
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
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
				resource: ['project'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
