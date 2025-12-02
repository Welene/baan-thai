import middy from "@middy/core";
import { sendResponse } from "../../../responses/response.mjs";
import { getAllOrders } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

export const handler = middy(async () => {
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