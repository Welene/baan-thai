const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Ställ in DynamoDB-klient
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'userId krävs' })
      };
    }

    // Validera input
    if (!body.email && !body.phoneNumber && !body.address) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Minst ett fält måste uppdateras (email, phoneNumber, eller address)' })
      };
    }

    // Bygg updateexpression dynamiskt
    const updateExpressionParts = [];
    const expressionAttributeValues = {};

    if (body.email) {
      updateExpressionParts.push('email = :email');
      expressionAttributeValues[':email'] = body.email;
    }

    if (body.phoneNumber) {
      updateExpressionParts.push('phoneNumber = :phoneNumber');
      expressionAttributeValues[':phoneNumber'] = body.phoneNumber;
    }

    if (body.address) {
      updateExpressionParts.push('address = :address');
      expressionAttributeValues[':address'] = body.address;
    }

    // Lägg till uppdaterad timestamp
    updateExpressionParts.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateExpression = 'SET ' + updateExpressionParts.join(', ');

    // Uppdatera användarprofil
    const result = await dynamodb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    // Ta bort känslig data
    const { passwordHash, ...safeProfile } = result.Attributes;

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Profil uppdaterad',
        profile: safeProfile
      })
    };

  } catch (error) {
    console.error('Fel vid profiluppdatering:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Kunde inte uppdatera profil' })
    };
  }
};