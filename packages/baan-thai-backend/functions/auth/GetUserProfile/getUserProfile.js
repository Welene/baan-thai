const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Setup DynamoDB client
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
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
