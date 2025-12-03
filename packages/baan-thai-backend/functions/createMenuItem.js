const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
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
