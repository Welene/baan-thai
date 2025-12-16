import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../../services/clients.mjs';

// Ställ in DynamoDB-klient
const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

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

// Author: Tim 
// detta script uppdaterar användarprofilen med email, phoneNumber och address fält

// Helene edit: added incoming API_KEY and expected API_KEY for extra api protection
