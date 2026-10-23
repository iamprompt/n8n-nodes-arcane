import type { INodeProperties } from 'n8n-workflow';

export const networkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['network'],
			},
		},
		options: [
			{
				name: 'Connect Container',
				value: 'connect',
				action: 'Connect a container to network',
				description: 'Connect a container to this Docker network',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a network',
				description: 'Create a new Docker network',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a network',
				description: 'Delete a Docker network',
			},
			{
				name: 'Disconnect Container',
				value: 'disconnect',
				action: 'Disconnect a container from network',
				description: 'Disconnect a container from this Docker network',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a network',
				description: 'Get details for a specific network',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many networks',
				description: 'List many Docker networks in an environment',
			},
			{
				name: 'Prune',
				value: 'prune',
				action: 'Prune networks',
				description: 'Prune all unused Docker networks',
			},
		],
		default: 'getAll',
	},
];

export const networkFields: INodeProperties[] = [
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
				resource: ['network'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Network ID selector (for get, delete, connect, disconnect)
	{
		displayName: 'Network ID',
		name: 'networkId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'bridge or my-network-ID',
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['get', 'delete', 'connect', 'disconnect'],
			},
		},
		description: 'The ID or name of the Docker network',
	},

	// Create network fields
	{
		displayName: 'Network Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my-custom-network',
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['create'],
			},
		},
		description: 'Name of the network to create',
	},
	{
		displayName: 'Driver',
		name: 'driver',
		type: 'options',
		options: [
			{ name: 'Bridge', value: 'bridge' },
			{ name: 'Host', value: 'host' },
			{ name: 'Macvlan', value: 'macvlan' },
			{ name: 'None', value: 'none' },
			{ name: 'Overlay', value: 'overlay' },
		],
		default: 'bridge',
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['create'],
			},
		},
		description: 'Network driver to use',
	},

	// Connect/Disconnect container ID
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
				resource: ['network'],
				operation: ['connect', 'disconnect'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Force Disconnect',
		name: 'force',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['disconnect'],
			},
		},
		description: 'Whether to force the container disconnect',
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['network'],
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
				resource: ['network'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
