import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { getOrdersByUserId } from "../../../services/orders.mjs";
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
  const { userId } = event.pathParameters;
  if (!userId) {
    return sendResponse(400, { success: false, message: "Missing userId" });
  }

  const orders = await getOrdersByUserId(userId);

  return sendResponse(200, { success: true, orders });
})
  .use(errorHandler());
