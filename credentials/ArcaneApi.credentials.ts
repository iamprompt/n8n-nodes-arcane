import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ArcaneApi implements ICredentialType {
	name = 'arcaneApi';

	displayName = 'Arcane API';

	icon: Icon = { light: 'file:../icons/arcane.svg', dark: 'file:../icons/arcane.dark.svg' };

	documentationUrl = 'https://github.com/getarcaneapp/arcane';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:3552',
			placeholder: 'https://arcane.example.com or http://localhost:3552',
			description: 'The URL of your Arcane instance (without trailing slash)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API Key generated in Arcane (Settings -> API Keys)',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}',
			url: '/api/version',
		},
	};
}
