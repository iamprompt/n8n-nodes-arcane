import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	INodePropertyOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function arcaneApiRequest(
	this:
		| IExecuteFunctions
		| IHookFunctions
		| ILoadOptionsFunctions
		| IPollFunctions
		| IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	customUri?: string,
	option: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('arcaneApi');
	const baseUrl = (credentials.baseUrl as string || 'http://localhost:3552').replace(/\/+$/, '');
	const uri = customUri || `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		method,
		qs,
		body,
		url: uri,
		json: true,
	};

	if (Object.keys(body).length === 0 && (method === 'GET' || method === 'DELETE')) {
		delete options.body;
	}

	Object.assign(options, option);

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'arcaneApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function arcaneApiRequestAllItems(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let start = 0;
	const limit = 50;
	query.limit = limit;

	let hasMore = true;
	while (hasMore) {
		query.start = start;
		const response = await arcaneApiRequest.call(this, method, endpoint, body, query);

		const items = Array.isArray(response) ? (response as IDataObject[]) : ((response as IDataObject)?.data as IDataObject[]) || [];
		returnData.push(...items);

		if (!items.length || items.length < limit) {
			hasMore = false;
		} else {
			start += limit;
		}
	}

	return returnData;
}

export async function getEnvironments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = await arcaneApiRequest.call(this, 'GET', '/environments', {}, { limit: 100 });
		const environments = Array.isArray(response) ? (response as IDataObject[]) : ((response as IDataObject)?.data as IDataObject[]) || [];

		return environments.map((env: IDataObject) => ({
			name: (env.name as string) || (env.id as string),
			value: env.id as string,
			description: (env.description as string) || `Status: ${(env.status as string) || 'unknown'}`,
		}));
	} catch {
		return [];
	}
}

export async function getContainers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const environmentId = this.getCurrentNodeParameter('environmentId') as string;
	if (!environmentId) {
		return [];
	}

	try {
		const response = await arcaneApiRequest.call(
			this,
			'GET',
			`/environments/${environmentId}/containers`,
			{},
			{ limit: 100 },
		);
		const containers = Array.isArray(response) ? (response as IDataObject[]) : ((response as IDataObject)?.data as IDataObject[]) || [];

		return containers.map((c: IDataObject) => {
			const rawNames = c.names as string[] | undefined;
			const name = (rawNames && rawNames[0]?.replace(/^\//, '')) || (c.name as string) || (c.id as string);
			return {
				name,
				value: (c.id as string) || (c.containerId as string) || name,
				description: `State: ${(c.state as string) || (c.status as string) || 'unknown'}`,
			};
		});
	} catch {
		return [];
	}
}

export async function getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const environmentId = this.getCurrentNodeParameter('environmentId') as string;
	if (!environmentId) {
		return [];
	}

	try {
		const response = await arcaneApiRequest.call(
			this,
			'GET',
			`/environments/${environmentId}/projects`,
			{},
			{ limit: 100 },
		);
		const projects = Array.isArray(response) ? (response as IDataObject[]) : ((response as IDataObject)?.data as IDataObject[]) || [];

		return projects.map((p: IDataObject) => ({
			name: (p.name as string) || (p.id as string),
			value: (p.id as string) || (p.name as string),
			description: `Status: ${(p.status as string) || 'unknown'}`,
		}));
	} catch {
		return [];
	}
}
