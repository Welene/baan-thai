import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/response.mjs";
import { getOrdersByUserId } from "../../services/orders.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  const userId = event.pathParameters.userId;
  const orders = await getOrdersByUserId(userId);

  return sendResponse(200, { orders });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());