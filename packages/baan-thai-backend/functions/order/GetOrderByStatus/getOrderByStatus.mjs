import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/response.mjs";
import { getOrdersByStatus } from "../../services/orders.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  const status = event.pathParameters.status;
  const orders = await getOrdersByStatus(status);
  
  return sendResponse(200, { orders });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());