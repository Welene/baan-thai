import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { deleteOrder } from "../../../services/orders.mjs";
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
    return sendResponse(400, { success: false, message: "Missing orderId" });
  }

  const result = await deleteOrder(orderId);

  if (result.success) {
    return sendResponse(200, { success: true, deletedOrder: result.deletedOrder });
  } else {
    return sendResponse(404, { success: false, message: result.message });
  }
})
  .use(errorHandler());

  // Helene edit: added fetchWithApiKey in every api call for extra api protection