import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
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

    const body = JSON.parse(event.body);
    const { name, description, price, category, categoryKey, available } = body;

    // Kolla att produkten finns
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

    // Bygg uppdateringsuttryck dynamiskt
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = name;
    }

    if (description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = description;
    }

    if (price !== undefined) {
      updateExpressions.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = price;
    }

    if (category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = category;
    }

    if (categoryKey !== undefined) {
      updateExpressions.push('#categoryKey = :categoryKey');
      expressionAttributeNames['#categoryKey'] = 'categoryKey';
      expressionAttributeValues[':categoryKey'] = categoryKey;
    }

    if (available !== undefined) {
      updateExpressions.push('#available = :available');
      expressionAttributeNames['#available'] = 'available';
      expressionAttributeValues[':available'] = available;
    }

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Inga fält att uppdatera' }),
      };
    }

    // Lägg till updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${prodId}`, SK: 'DETAILS' },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Menyobjekt uppdaterat',
        item: {
          productId: result.Attributes.productId,
          name: result.Attributes.name,
          description: result.Attributes.description,
          price: result.Attributes.price,
          category: result.Attributes.category,
          categoryKey: result.Attributes.categoryKey,
          available: result.Attributes.available,
        },
      }),
    };
  } catch (err) {
    console.error('updateMenuItem error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Serverfel', details: err.message }),
    };
  }
};

/* Författare: Tim */
/* Uppdaterar menyprodukt i DynamoDB */
// Helene edit: added fetchWithApiKey in every api call for extra api protection
