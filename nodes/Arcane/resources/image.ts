import type { INodeProperties } from 'n8n-workflow';

export const imageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['image'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get an image',
				description: 'Get details of an image by ID',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many images',
				description: 'List many images on the host',
			},
			{
				name: 'Prune',
				value: 'prune',
				action: 'Prune images',
				description: 'Prune unused and dangling images',
			},
			{
				name: 'Pull',
				value: 'pull',
				action: 'Pull an image',
				description: 'Pull a Docker image from a registry',
			},
			{
				name: 'Remove',
				value: 'remove',
				action: 'Remove an image',
				description: 'Remove/delete an image from the host',
			},
			{
				name: 'Tag',
				value: 'tag',
				action: 'Tag an image',
				description: 'Tag an existing image with a new repository/tag',
			},
		],
		default: 'getAll',
	},
];

export const imageFields: INodeProperties[] = [
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
				resource: ['image'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Image ID selector (for get, remove)
	{
		displayName: 'Image ID',
		name: 'imageId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'sha256:... or image:tag',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['get', 'remove'],
			},
		},
		description: 'The ID or tag of the Docker image',
	},

	// Pull fields
	{
		displayName: 'Image Name',
		name: 'imageName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'nginx or redis',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['pull'],
			},
		},
		description: 'The image name to pull from registry (e.g. nginx or myorg/myimage)',
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string',
		default: 'latest',
		placeholder: 'latest',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['pull'],
			},
		},
		description: 'The tag of the image to pull',
	},

	// Tag fields (for tag operation)
	{
		displayName: 'Source Image Name or ID',
		name: 'sourceImage',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'nginx:latest',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['tag'],
			},
		},
		description: 'Source image ID or reference to tag',
	},
	{
		displayName: 'Target Repository',
		name: 'targetRepository',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myregistry.domain.com/nginx',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['tag'],
			},
		},
		description: 'Target repository name for the new tag',
	},
	{
		displayName: 'Target Tag',
		name: 'targetTag',
		type: 'string',
		default: 'latest',
		placeholder: 'v1.0.0',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['tag'],
			},
		},
		description: 'Target tag name',
	},

	// Pagination for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['image'],
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
				resource: ['image'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];
