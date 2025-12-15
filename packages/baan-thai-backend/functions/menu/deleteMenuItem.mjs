import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../services/clients.mjs';

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

const dynamodb = docClient;

export const handler = async (event) => {
  // API_KEY START ----------------------------------------------
	const incomingKey = event.headers?.["x-api-key"];
	const expectedKey = process.env.API_KEY;

	if (incomingKey !== expectedKey) {
		return {
			statusCode: 401,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
			},
			body: JSON.stringify({ error: 'Invalid API Key' }),
		};
	}
	// API_KEY END ------------------------------------------------
  try {
    const prodId = event.pathParameters?.prodId;

    if (!prodId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'prodId krävs' }),
      };
    }

    // Kolla att produkten finns innan vi tar bort
    const existing = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${prodId}`, SK: 'DETAILS' },
    }));

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Produkt hittades inte' }),
      };
    }

    await dynamodb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${prodId}`, SK: 'DETAILS' },
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Menyobjekt borttaget',
        productId: prodId,
      }),
    };
  } catch (err) {
    console.error('deleteMenuItem error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Serverfel', details: err.message }),
    };
  }
};

/* Författare:Tim */
/* Raderar menyprodukt från DynamoDB */

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection