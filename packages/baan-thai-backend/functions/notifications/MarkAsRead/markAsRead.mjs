import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../../../services/clients.mjs";
import { sendResponse } from "../../../responses/response.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

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

  const { notificationId } = event.pathParameters;
  const { userId } = event.body || {};

  if (!notificationId || !userId) {
    return sendResponse(400, { 
      success: false, 
      message: "Missing notificationId or userId" 
    });
  }

  try {
    // Uppdatera notifikation som läst
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `NOTIFICATION#${notificationId}`
      },
      UpdateExpression: "SET isRead = :isRead, readAt = :readAt",
      ExpressionAttributeValues: {
        ":isRead": true,
        ":readAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    };

    await docClient.send(new UpdateCommand(params));

    return sendResponse(200, {
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return sendResponse(500, {
      success: false,
      message: "Failed to mark notification as read"
    });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());


  // Författare: Tim
  // Markerar en notifikation som läst för en användare