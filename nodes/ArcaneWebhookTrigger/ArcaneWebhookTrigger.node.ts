import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class ArcaneWebhookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Arcane Webhook Trigger',
		name: 'arcaneWebhookTrigger',
		icon: { light: 'file:arcanewebhooktrigger.svg', dark: 'file:arcanewebhooktrigger.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'Webhook',
		description: 'Starts workflow when an Arcane notification or webhook payload is received',
		defaults: {
			name: 'Arcane Webhook Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Headers',
						name: 'includeHeaders',
						type: 'boolean',
						default: false,
						description: 'Whether to include the request headers in the output',
					},
					{
						displayName: 'Include Query Parameters',
						name: 'includeQuery',
						type: 'boolean',
						default: false,
						description: 'Whether to include query parameters in the output',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const options = this.getNodeParameter('options', {}) as {
			includeHeaders?: boolean;
			includeQuery?: boolean;
		};

		const outputData: IDataObject = {
			body: body as IDataObject,
		};

		if (options.includeHeaders) {
			outputData.headers = this.getHeaderData() as unknown as IDataObject;
		}

		if (options.includeQuery) {
			outputData.query = this.getQueryData();
		}

		return {
			workflowData: [this.helpers.returnJsonArray([outputData])],
		};
	}
}
