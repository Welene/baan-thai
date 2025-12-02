// functions/auth/GetUserProfile/getUserProfile.js
var { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
var { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
var client = new DynamoDBClient({});
var dynamodb = DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.TABLE_NAME;
exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: "userId kr\xE4vs" })
      };
    }
    const profileResult = await dynamodb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: "PROFILE"
      }
    }));
    if (!profileResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: "Anv\xE4ndare hittades inte" })
      };
    }
    const profile = profileResult.Item;
    const notificationsResult = await dynamodb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "NOTIFICATION#"
      },
      ScanIndexForward: false,
      // Nyaste först
      Limit: 20
    }));
    const ordersResult = await dynamodb.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "userId = :userId AND SK = :sk",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":sk": "ORDER"
      }
    }));
    const orders = (ordersResult.Items || []).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    }).slice(0, 10);
    const { passwordHash, ...safeProfile } = profile;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        profile: safeProfile,
        notifications: notificationsResult.Items || [],
        orders
      })
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Serverfel vid h\xE4mtning av profil",
        details: error.message
      })
    };
  }
};
//# sourceMappingURL=getUserProfile.js.map
