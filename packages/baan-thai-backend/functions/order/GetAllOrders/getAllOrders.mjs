import middy from "@middy/core";
import { sendResponse } from "../../../responses/response.mjs";
import { getAllOrders } from "../../../services/orders.mjs";
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
  const orders = await getAllOrders();

  if (orders.length === 0) {
    return sendResponse(200, {
      success: true,
      message: "There are no orders right now. Don’t look so sad – I’m sure there will be some later…",
    });
  } else {
    return sendResponse(200, {
      success: true,
      message: `Found ${orders.length} orders`,
      orders,
    });
  }
})
  .use(errorHandler());