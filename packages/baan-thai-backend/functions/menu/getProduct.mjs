import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../services/clients.mjs';

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

// Setup DynamoDB client
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
    // Hämta prodId från URL-parametern (t.ex. /api/menu/42 - prodId = 42)
    const prodId = event.pathParameters && event.pathParameters.prodId;
    if (!prodId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'prodId saknas' }),
      };
    }

    // Tabellen använder PK = "PRODUCT#<id>", SK = "DETAILS"
    const key = { PK: `PRODUCT#${prodId}`, SK: 'DETAILS' };
    
    // Hämta produkten direkt med GetCommand 
    const res = await dynamodb.send(new GetCommand({ TableName: TABLE_NAME, Key: key }));

    // Kolla om produkten finns
    if (!res || !res.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Produkt hittades inte' }),
      };
    }

    // Formatera svaret med de fält frontend behöver
    const item = {
      productId: res.Item.productId,
      name: res.Item.name,
      title: res.Item.name,
      description: res.Item.description || '',
      price: res.Item.price,
      category: res.Item.category,
      categoryKey: res.Item.categoryKey,
      available: res.Item.available,
    };

    // Returnera produkten
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error('getProduct error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Serverfel', details: err.message }),
    };
  }
};

/* Författare: Tim*/
/* Hämtar en enskild produkt baserat på prodId */
