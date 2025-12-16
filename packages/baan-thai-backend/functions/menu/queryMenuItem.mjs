import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../services/clients.mjs';

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

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
// author: tim
// detta script hämtar en meny item från dynamodb baserat på productId