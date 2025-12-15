import { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

    // Hämta användarprofil
    const profileResult = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    }));

    if (!profileResult.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Användare hittades inte' })
      };
    }

    const profile = profileResult.Item;

    // Hämta användarens notiser (sparas under USER#<userId> med SK NOTIFICATION#...)
    const notificationsResult = await dynamodb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'NOTIFICATION#'
      },
      ScanIndexForward: false, // Nyaste först
      Limit: 20
    }));

    // Hämta användarens orderhistorik via Scan (ordrar har userId)
    // Ordrar sparas som PK: ORDER#<orderId>, SK: ORDER med userId attribut
    const ordersResult = await dynamodb.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'userId = :userId AND SK = :sk',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':sk': 'ORDER'
      }
    }));

    // Sortera ordrar efter createdAt (nyaste först)
    const orders = (ordersResult.Items || []).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    }).slice(0, 10); // Begränsa till 10 ordrar

    // Ta bort känslig data från profil
    const { passwordHash, ...safeProfile } = profile;

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        profile: safeProfile,
        notifications: notificationsResult.Items || [],
        orders: orders
      })
    };

  } catch (error) {
    console.error('Get profile error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Serverfel vid hämtning av profil',
        details: error.message 
      })
    };
  }
};

/* Författare: Tim */
/* Hämtar användarprofil med notiser och orderhistorik */

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection
