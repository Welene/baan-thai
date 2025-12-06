import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function queryMenuItem(productId) {
	const params = {
		TableName: TABLE_NAME,
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
