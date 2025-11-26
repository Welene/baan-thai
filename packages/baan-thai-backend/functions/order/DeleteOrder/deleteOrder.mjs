import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/response.mjs";
import { deleteOrder } from "../../services/orders.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  const orderId = event.pathParameters.id;
  const deletedOrder = await deleteOrder(orderId);

  if (!deletedOrder) {
    return sendResponse(404, { message: "Order not found" });
  }

  return sendResponse(200, { message: "Order deleted successfully", order: deletedOrder });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());