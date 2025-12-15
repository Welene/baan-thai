import { QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
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
    // Hämta alla olästa notifikationer för användaren
    const queryParams = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression: "isRead = :isRead",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "NOTIFICATION#",
        ":isRead": false
      }
    };

    const result = await docClient.send(new QueryCommand(queryParams));

    if (!result.Items || result.Items.length === 0) {
      return sendResponse(200, {
        success: true,
        message: "No unread notifications found"
      });
    }

    // Uppdatera alla till lästa i batchar (max 25 åt gången)
    const batchSize = 25;
    const readAt = new Date().toISOString();

    for (let i = 0; i < result.Items.length; i += batchSize) {
      const batch = result.Items.slice(i, i + batchSize);
      
      const batchParams = {
        RequestItems: {
          [process.env.TABLE_NAME]: batch.map(item => ({
            PutRequest: {
              Item: {
                ...item,
                isRead: true,
                readAt
              }
            }
          }))
        }
      };

      await docClient.send(new BatchWriteCommand(batchParams));
    }

    return sendResponse(200, {
      success: true,
      message: `Marked ${result.Items.length} notifications as read`
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return sendResponse(500, {
      success: false,
      message: "Failed to mark all notifications as read"
    });
  }
}).use(errorHandler());

// Författare: Tim
// Markerar alla notifikationer som lästa för en användare

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection