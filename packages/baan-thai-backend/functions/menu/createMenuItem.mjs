import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
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
    const body = JSON.parse(event.body);

    const { productId, name, description, price, category, categoryKey, available } = body;

    if (!productId || !name || price === undefined || !category) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'productId, name, price och category krävs' }),
      };
    }

    const item = {
      PK: `PRODUCT#${productId}`,
      SK: 'DETAILS',
      productId,
      name,
      description: description || '',
      price,
      category,
      categoryKey: categoryKey || category.toLowerCase().replace(/\s+/g, '-'),
      available: available !== undefined ? available : true,
      createdAt: new Date().toISOString(),
    };

    await dynamodb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)', // Förhindra överskrivning
    }));

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Menyobjekt skapat',
        item: {
          productId: item.productId,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          categoryKey: item.categoryKey,
          available: item.available,
        },
      }),
    };
  } catch (err) {
    console.error('createMenuItem error:', err);

    if (err.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Produkt med detta ID finns redan' }),
      };
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Serverfel', details: err.message }),
    };
  }
};

/* Författare:Tim */
/* Skapar ny menyprodukt i DynamoDB */

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection
