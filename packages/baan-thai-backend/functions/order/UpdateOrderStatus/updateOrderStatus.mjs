import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { updateOrderStatus } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { updateOrderStatusSchema } from "../../../models/updateOrderStatusSchema.mjs";

export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters;
  if (!orderId) {
    return sendResponse(400, { success: false, message: "Missing orderId in path parameters" });
  }

  const { status } = event.body;

  const { error } = updateOrderStatusSchema.validate({ status });
  if (error) {
    return sendResponse(400, { success: false, message: `Invalid input: ${error.details[0].message}` });
  }

  const result = await updateOrderStatus(orderId, status);

  if (result.success) {
    return sendResponse(200, { success: true, updatedOrder: result.updatedOrder });
  } else {
    return sendResponse(500, { success: false, message: result.message });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
