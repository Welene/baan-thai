import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../../../services/clients.mjs";
import { sendResponse } from "../../../responses/response.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import middy from "@middy/core";

export const handler = middy(async (event) => {

  //API KEY START---------------------------------------------
  const incomingKey = event.headers?.["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (incomingKey !== expectedKey) {
    return sendResponse(401, { 
      success: false,
      message: "Invalid API Key"
    });
  }
  
  //API KEY END---------------------------------------------

  const { userId } = event.pathParameters;

  if (!userId) {
    return sendResponse(400, { 
      success: false, 
      message: "Missing userId" 
    });
  }

  try {
    // Hämta alla notifikationer för användaren
    const params = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "NOTIFICATION#"
      },
      ScanIndexForward: false // Senaste först
    };

    const result = await docClient.send(new QueryCommand(params));

    // Formatera notifikationer
    const notifications = result.Items.map(item => ({
      notificationId: item.SK.replace("NOTIFICATION#", ""),
      userId: item.userId,
      orderId: item.orderId,
      message: item.message,
      type: item.type,
      isRead: item.isRead || false,
      createdAt: item.createdAt
    }));

    // Räkna olästa notifikationer
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return sendResponse(200, {
      success: true,
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return sendResponse(500, {
      success: false,
      message: "Failed to fetch notifications"
    });
  }
}).use(errorHandler());

//Författare: Tim
// Hämtar notifikationer för en användare

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection