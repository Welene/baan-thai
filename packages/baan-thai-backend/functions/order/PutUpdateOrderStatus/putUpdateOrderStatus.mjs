import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../responses/response.mjs";
import { updateOrderStatus } from "../../services/orders.mjs";
import { errorHandler } from "../../middlewares/errorHandler.mjs";
import { updateOrderStatusSchema } from "../../models/updateOrderStatusSchema.mjs";

export const handler = middy(async (event) => {
  const orderIs = event.pathParameters.orderId;
  const { status } = event.body;

  const { error } = updateOrderStatusSchema.validate({ status });
  if (error) {
    return sendResponse(400, { message: `Invalid input: ${error.details[0].message}` });
  }
  const result = await updateOrderStatus(orderIs, status);

  if (result.success) {
    return sendResponse(200, { updatedOrder: result.updatedOrder });
  } else {
    return sendResponse(500, { message: result.message });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());