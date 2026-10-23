import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { arcaneApiRequest, getEnvironments } from '../Arcane/GenericFunctions';

export class ArcaneTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Arcane Trigger',
		name: 'arcaneTrigger',
		icon: { light: 'file:arcanetrigger.svg', dark: 'file:arcanetrigger.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["severity"] || "All Events"}}',
		description: 'Starts workflow when new events occur in Arcane',
		defaults: {
			name: 'Arcane Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		polling: true,
		credentials: [
			{
				name: 'arcaneApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Environment Name or ID',
				name: 'environmentId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getEnvironments',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Severity',
				name: 'severity',
				type: 'options',
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'Info',
						value: 'info',
					},
					{
						name: 'Warning',
						value: 'warning',
					},
					{
						name: 'Error',
						value: 'error',
					},
				],
				default: '',
				description: 'Filter events by severity level',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Max number of results to return',
			},
		],
	};

	methods = {
		loadOptions: {
			getEnvironments,
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const staticData = this.getWorkflowStaticData('node');
		const environmentId = this.getNodeParameter('environmentId', '') as string;
		const severity = this.getNodeParameter('severity', '') as string;
		const limit = this.getNodeParameter('limit', 50) as number;

		const query: IDataObject = {
			limit,
			order: 'desc',
			sort: 'createdAt',
		};

		if (severity) {
			query.severity = severity;
		}

		let endpoint = '/events';
		if (environmentId) {
			endpoint = `/events/environment/${environmentId}`;
		}

		const response = await arcaneApiRequest.call(this, 'GET', endpoint, {}, query);
		const events: IDataObject[] = Array.isArray(response)
			? response
			: (response?.data as IDataObject[]) || [];

		if (!events || events.length === 0) {
			return null;
		}

		// When testing manually in the editor, emit the latest event
		if (this.getMode() === 'manual') {
			return [this.helpers.returnJsonArray(events.slice(0, 1))];
		}

		const lastEventId = staticData.lastEventId as string | undefined;
		const lastTimestamp = staticData.lastTimestamp as string | undefined;

		// First poll run: save latest event and don't emit backlog
		if (!lastEventId && !lastTimestamp) {
			staticData.lastEventId = events[0].id as string;
			staticData.lastTimestamp = (events[0].createdAt || events[0].timestamp) as string;
			return null;
		}

		// Filter for events newer than last timestamp
		const newEvents: IDataObject[] = [];
		for (const event of events) {
			const eventTime = (event.createdAt || event.timestamp) as string;
			const eventId = event.id as string;

			if (eventId === lastEventId) {
				break;
			}
			if (lastTimestamp && eventTime && new Date(eventTime) <= new Date(lastTimestamp)) {
				break;
			}
			newEvents.push(event);
		}

		if (newEvents.length > 0) {
			staticData.lastEventId = newEvents[0].id as string;
			staticData.lastTimestamp = (newEvents[0].createdAt || newEvents[0].timestamp) as string;

			// Return chronologically (oldest first)
			newEvents.reverse();
			return [this.helpers.returnJsonArray(newEvents)];
		}

		return null;
	}
}
