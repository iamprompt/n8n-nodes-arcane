import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	arcaneApiRequest,
	arcaneApiRequestAllItems,
	getContainers,
	getEnvironments,
	getProjects,
} from './GenericFunctions';
import { containerFields, containerOperations } from './resources/container';
import { environmentFields, environmentOperations } from './resources/environment';
import { imageFields, imageOperations } from './resources/image';
import { networkFields, networkOperations } from './resources/network';
import { projectFields, projectOperations } from './resources/project';
import { volumeFields, volumeOperations } from './resources/volume';

function extractResponseData(res: IDataObject | IDataObject[]): IDataObject | IDataObject[] {
	if (Array.isArray(res)) {
		return res;
	}
	return (res.data as IDataObject[]) || res;
}

export class Arcane implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Arcane',
		name: 'arcane',
		icon: { light: 'file:arcane.svg', dark: 'file:arcane.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage Docker containers, compose stacks, and environments via Arcane REST API',
		defaults: {
			name: 'Arcane',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'arcaneApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Container',
						value: 'container',
					},
					{
						name: 'Environment',
						value: 'environment',
					},
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Network',
						value: 'network',
					},
					{
						name: 'Project (Stack)',
						value: 'project',
					},
					{
						name: 'Volume',
						value: 'volume',
					},
				],
				default: 'container',
			},

			// Environments
			...environmentOperations,
			...environmentFields,

			// Containers
			...containerOperations,
			...containerFields,

			// Projects
			...projectOperations,
			...projectFields,

			// Images
			...imageOperations,
			...imageFields,

			// Networks
			...networkOperations,
			...networkFields,

			// Volumes
			...volumeOperations,
			...volumeFields,
		],
	};

	methods = {
		loadOptions: {
			getEnvironments,
			getContainers,
			getProjects,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] | undefined;

				// ==========================================
				// 1. ENVIRONMENT
				// ==========================================
				if (resource === 'environment') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(this, 'GET', '/environments');
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await arcaneApiRequest.call(this, 'GET', '/environments', {}, { limit });
							responseData = extractResponseData(res);
						}
					} else if (operation === 'get') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						responseData = await arcaneApiRequest.call(this, 'GET', `/environments/${environmentId}`);
					} else if (operation === 'create') {
						const apiUrl = this.getNodeParameter('apiUrl', i) as string;
						const name = this.getNodeParameter('name', i, '') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const body: IDataObject = {
							apiUrl,
							...(name ? { name } : {}),
							...additionalFields,
						};
						responseData = await arcaneApiRequest.call(this, 'POST', '/environments', body);
					} else if (operation === 'update') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						const name = this.getNodeParameter('name', i, '') as string;
						const body: IDataObject = {};
						if (name) body.name = name;
						responseData = await arcaneApiRequest.call(this, 'PUT', `/environments/${environmentId}`, body);
					} else if (operation === 'delete') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						responseData = await arcaneApiRequest.call(this, 'DELETE', `/environments/${environmentId}`);
					} else if (operation === 'testConnection') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						responseData = await arcaneApiRequest.call(this, 'POST', `/environments/${environmentId}/test`);
					} else if (operation === 'sync') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						responseData = await arcaneApiRequest.call(this, 'POST', `/environments/${environmentId}/sync`);
					} else if (operation === 'getVersion') {
						const environmentId = this.getNodeParameter('environmentId', i) as string;
						responseData = await arcaneApiRequest.call(this, 'GET', `/environments/${environmentId}/version`);
					}
				}

				// ==========================================
				// 2. CONTAINER
				// ==========================================
				else if (resource === 'container') {
					const environmentId = this.getNodeParameter('environmentId', i, '') as string;
					if (!environmentId) {
						throw new NodeOperationError(this.getNode(), 'Please select an Environment', {
							itemIndex: i,
						});
					}

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i, '') as string;
						const image = this.getNodeParameter('image', i, '') as string;
						if (!name) {
							throw new NodeOperationError(this.getNode(), 'Please specify a container name', {
								itemIndex: i,
							});
						}
						if (!image) {
							throw new NodeOperationError(this.getNode(), 'Please specify a container image', {
								itemIndex: i,
							});
						}
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							name,
							image,
						};

						if (additionalFields.command) {
							body.command = (additionalFields.command as string).split(' ').filter(Boolean);
						}
						if (additionalFields.entrypoint) {
							body.entrypoint = (additionalFields.entrypoint as string).split(' ').filter(Boolean);
						}
						if (additionalFields.env) {
							body.env = (additionalFields.env as string)
								.split(/[,\n]/)
								.map((s) => s.trim())
								.filter(Boolean);
						}
						if (additionalFields.networks) {
							body.networks = (additionalFields.networks as string)
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean);
						}
						if (additionalFields.restartPolicy) {
							body.restartPolicy = additionalFields.restartPolicy;
						}
						if (additionalFields.memory) {
							body.memory = Number(additionalFields.memory) * 1024 * 1024;
						}
						if (additionalFields.cpus) {
							body.cpus = Number(additionalFields.cpus);
						}
						if (additionalFields.workingDir) {
							body.workingDir = additionalFields.workingDir;
						}
						if (additionalFields.user) {
							body.user = additionalFields.user;
						}
						if (additionalFields.privileged !== undefined) {
							body.privileged = additionalFields.privileged;
						}
						if (additionalFields.autoRemove !== undefined) {
							body.autoRemove = additionalFields.autoRemove;
						}

						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/containers`,
							body,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(
								this,
								'GET',
								`/environments/${environmentId}/containers`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i, 50) as number;
							const res = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/containers`,
								{},
								{ limit },
							);
							responseData = extractResponseData(res);
						}
					} else {
						const containerId = this.getNodeParameter('containerId', i, '') as string;
						if (!containerId) {
							throw new NodeOperationError(
								this.getNode(),
								'Please select or specify a Container Name or ID',
								{ itemIndex: i },
							);
						}

						if (operation === 'get') {
							responseData = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/containers/${containerId}`,
							);
						} else if (operation === 'start') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/start`,
							);
						} else if (operation === 'stop') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/stop`,
							);
						} else if (operation === 'restart') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/restart`,
							);
						} else if (operation === 'pause') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/pause`,
							);
						} else if (operation === 'unpause') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/unpause`,
							);
						} else if (operation === 'kill') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/kill`,
							);
						} else if (operation === 'redeploy') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/containers/${containerId}/redeploy`,
							);
						} else if (operation === 'delete') {
							const force = this.getNodeParameter('force', i, false) as boolean;
							const volumes = this.getNodeParameter('volumes', i, false) as boolean;
							responseData = await arcaneApiRequest.call(
								this,
								'DELETE',
								`/environments/${environmentId}/containers/${containerId}`,
								{},
								{ force, volumes },
							);
						} else if (operation === 'getLogs') {
							responseData = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/containers/${containerId}/logs/download`,
							);
						}
					}
				}

				// ==========================================
				// 3. PROJECT (STACK)
				// ==========================================
				else if (resource === 'project') {
					const environmentId = this.getNodeParameter('environmentId', i) as string;

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(
								this,
								'GET',
								`/environments/${environmentId}/projects`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/projects`,
								{},
								{ limit },
							);
							responseData = extractResponseData(res);
						}
					} else {
						const projectId = this.getNodeParameter('projectId', i) as string;

						if (operation === 'get') {
							responseData = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/projects/${projectId}`,
							);
						} else if (operation === 'up') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/up`,
							);
						} else if (operation === 'down') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/down`,
							);
						} else if (operation === 'restart') {
							const services = this.getNodeParameter('services', i, '') as string;
							const qs: IDataObject = {};
							if (services) qs.services = services;
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/restart`,
								{},
								qs,
							);
						} else if (operation === 'redeploy') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/redeploy`,
							);
						} else if (operation === 'pull') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/pull`,
							);
						} else if (operation === 'build') {
							responseData = await arcaneApiRequest.call(
								this,
								'POST',
								`/environments/${environmentId}/projects/${projectId}/build`,
							);
						} else if (operation === 'destroy') {
							responseData = await arcaneApiRequest.call(
								this,
								'DELETE',
								`/environments/${environmentId}/projects/${projectId}/destroy`,
							);
						} else if (operation === 'getCompose') {
							responseData = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/projects/${projectId}/compose`,
							);
						}
					}
				}

				// ==========================================
				// 4. IMAGE
				// ==========================================
				else if (resource === 'image') {
					const environmentId = this.getNodeParameter('environmentId', i) as string;

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(
								this,
								'GET',
								`/environments/${environmentId}/images`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/images`,
								{},
								{ limit },
							);
							responseData = extractResponseData(res);
						}
					} else if (operation === 'get') {
						const imageId = this.getNodeParameter('imageId', i) as string;
						responseData = await arcaneApiRequest.call(
							this,
							'GET',
							`/environments/${environmentId}/images/${imageId}`,
						);
					} else if (operation === 'pull') {
						const imageName = this.getNodeParameter('imageName', i) as string;
						const tag = this.getNodeParameter('tag', i, 'latest') as string;
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/images/pull`,
							{ imageName, tag },
						);
					} else if (operation === 'remove') {
						const imageId = this.getNodeParameter('imageId', i) as string;
						responseData = await arcaneApiRequest.call(
							this,
							'DELETE',
							`/environments/${environmentId}/images/${imageId}`,
						);
					} else if (operation === 'prune') {
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/images/prune`,
						);
					} else if (operation === 'tag') {
						const sourceImage = this.getNodeParameter('sourceImage', i) as string;
						const targetRepository = this.getNodeParameter('targetRepository', i) as string;
						const targetTag = this.getNodeParameter('targetTag', i, 'latest') as string;
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/images/${sourceImage}/tag`,
							{ repository: targetRepository, tag: targetTag },
						);
					}
				}

				// ==========================================
				// 5. NETWORK
				// ==========================================
				else if (resource === 'network') {
					const environmentId = this.getNodeParameter('environmentId', i) as string;

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(
								this,
								'GET',
								`/environments/${environmentId}/networks`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/networks`,
								{},
								{ limit },
							);
							responseData = extractResponseData(res);
						}
					} else if (operation === 'get') {
						const networkId = this.getNodeParameter('networkId', i) as string;
						responseData = await arcaneApiRequest.call(
							this,
							'GET',
							`/environments/${environmentId}/networks/${networkId}`,
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const driver = this.getNodeParameter('driver', i, 'bridge') as string;
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/networks`,
							{ name, options: { Driver: driver } },
						);
					} else if (operation === 'delete') {
						const networkId = this.getNodeParameter('networkId', i) as string;
						responseData = await arcaneApiRequest.call(
							this,
							'DELETE',
							`/environments/${environmentId}/networks/${networkId}`,
						);
					} else if (operation === 'prune') {
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/networks/prune`,
						);
					} else if (operation === 'connect') {
						const networkId = this.getNodeParameter('networkId', i, '') as string;
						const containerId = this.getNodeParameter('containerId', i, '') as string;
						if (!containerId) {
							throw new NodeOperationError(
								this.getNode(),
								'Please select or specify a Container Name or ID to connect',
								{ itemIndex: i },
							);
						}
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/networks/${networkId}/connect`,
							{ containerId },
						);
					} else if (operation === 'disconnect') {
						const networkId = this.getNodeParameter('networkId', i, '') as string;
						const containerId = this.getNodeParameter('containerId', i, '') as string;
						if (!containerId) {
							throw new NodeOperationError(
								this.getNode(),
								'Please select or specify a Container Name or ID to disconnect',
								{ itemIndex: i },
							);
						}
						const force = this.getNodeParameter('force', i, false) as boolean;
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/networks/${networkId}/disconnect`,
							{ containerId, force },
						);
					}
				}

				// ==========================================
				// 6. VOLUME
				// ==========================================
				else if (resource === 'volume') {
					const environmentId = this.getNodeParameter('environmentId', i) as string;

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await arcaneApiRequestAllItems.call(
								this,
								'GET',
								`/environments/${environmentId}/volumes`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await arcaneApiRequest.call(
								this,
								'GET',
								`/environments/${environmentId}/volumes`,
								{},
								{ limit },
							);
							responseData = extractResponseData(res);
						}
					} else if (operation === 'get') {
						const volumeName = this.getNodeParameter('volumeName', i) as string;
						responseData = await arcaneApiRequest.call(
							this,
							'GET',
							`/environments/${environmentId}/volumes/${volumeName}`,
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const driver = this.getNodeParameter('driver', i, 'local') as string;
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/volumes`,
							{ name, driver },
						);
					} else if (operation === 'delete') {
						const volumeName = this.getNodeParameter('volumeName', i) as string;
						const force = this.getNodeParameter('force', i, false) as boolean;
						responseData = await arcaneApiRequest.call(
							this,
							'DELETE',
							`/environments/${environmentId}/volumes/${volumeName}`,
							{},
							{ force },
						);
					} else if (operation === 'prune') {
						responseData = await arcaneApiRequest.call(
							this,
							'POST',
							`/environments/${environmentId}/volumes/prune`,
						);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData ?? {}),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
