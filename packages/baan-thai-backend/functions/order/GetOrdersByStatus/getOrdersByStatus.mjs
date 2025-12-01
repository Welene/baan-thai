import middy from "@middy/core";
import { sendResponse } from "../../../responses/response.mjs";
import { getOrdersByStatus } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  const { status } = event.pathParameters;

  if (!status) {
    return sendResponse(400, { success: false, message: "Missing status parameter" });
  }

  const orders = await getOrdersByStatus(status);

  return sendResponse(200, { success: true, orders });
})
  .use(errorHandler());
