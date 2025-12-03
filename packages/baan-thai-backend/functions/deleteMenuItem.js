const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
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
