import type { INodeProperties } from 'n8n-workflow';

export const volumeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['volume'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a volume',
				description: 'Create a new named Docker volume',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a volume',
				description: 'Delete a Docker volume',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a volume',
				description: 'Get details for a specific Docker volume',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many volumes',
				description: 'List many Docker volumes in an environment',
			},
			{
				name: 'Prune',
				value: 'prune',
				action: 'Prune volumes',
				description: 'Prune all unused Docker volumes',
			},
		],
		default: 'getAll',
	},
];

export const volumeFields: INodeProperties[] = [
	// Environment selector
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
				resource: ['volume'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Volume name selector (for get, delete)
	{
		displayName: 'Volume Name',
		name: 'volumeName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_data_volume',
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['get', 'delete'],
			},
		},
		description: 'Name of the Docker volume',
	},

	// Create volume fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my-new-volume',
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['create'],
			},
		},
		description: 'Name of the volume to create',
	},
	{
		displayName: 'Driver',
		name: 'driver',
		type: 'string',
		default: 'local',
		placeholder: 'local',
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['create'],
			},
		},
		description: 'Volume driver to use',
	},

	// Delete volume force flag
	{
		displayName: 'Force',
		name: 'force',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['volume'],
				operation: ['delete'],
			},
		},
		description: 'Whether to force the removal of the volume',
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['volume'],
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
				resource: ['volume'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
