import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { editOrder } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { orderSchema } from "../../../models/orderSchema.mjs";

export const handler = middy(async (event) => {
  const { error } = orderSchema.validate(event.body);
  if (error) {
    return sendResponse(400, { message: error.details[0].message });
  }

  const orderId = event.pathParameters.id;
  const result = await editOrder(orderId, event.body); 

  if (!result) {
    return sendResponse(500, { message: "Failed to update order" });
  }

  return sendResponse(200, { message: "Order updated successfully!", booking: result });
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
