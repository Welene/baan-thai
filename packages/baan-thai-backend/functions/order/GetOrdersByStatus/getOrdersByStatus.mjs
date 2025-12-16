import middy from "@middy/core";
import { sendResponse } from "../../../responses/response.mjs";
import { getOrdersByStatus } from "../../../services/orders.mjs";
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
  const { status } = event.pathParameters;

  if (!status) {
    return sendResponse(400, { success: false, message: "Missing status parameter" });
  }

  const orders = await getOrdersByStatus(status);

  return sendResponse(200, { success: true, orders });
})
  .use(errorHandler());

// Author: Felicia
// Helene edit: added incoming API_KEY and expected API_KEY for extra api protection
