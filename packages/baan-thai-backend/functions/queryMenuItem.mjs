import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
	region: 'eu-north-1',
	endpoint: 'http://localhost:8000',
	credentials: {
		accessKeyId: 'local',
		secretAccessKey: 'local'
	}
});

const docClient = DynamoDBDocumentClient.from(client);

export async function queryMenuItem(productId) {
	const params = {
		TableName: 'MenuItems',
		Key: {
			PK: `PRODUCT#${productId}`,
			SK: 'DETAILS'
		}
	};

	try {
		const result = await docClient.send(new GetCommand(params));
		return result.Item;
	} catch (error) {
		console.error('Error querying menu item:', error);
		throw error;
	}
}
