import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { cancelOrder } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

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
  const { orderId } = event.pathParameters;
  
  if (!orderId) {
    return sendResponse(400, { 
      success: false, 
      message: "Missing orderId in path parameters" 
    });
  }

  const { userId } = event.body || {};

  if (!userId) {
    return sendResponse(400, { 
      success: false, 
      message: "Missing userId in request body" 
    });
  }

  const result = await cancelOrder(orderId, userId);

  if (result.success) {
    return sendResponse(200, { 
      success: true, 
      message: "Order cancelled successfully",
      cancelledOrder: result.cancelledOrder 
    });
  } else {
    const statusCode = result.statusCode || 500;
    return sendResponse(statusCode, { 
      success: false, 
      message: result.message 
    });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
