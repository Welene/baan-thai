import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { editOrder } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { orderSchema } from "../../../models/orderSchema.mjs";

export const handler = middy(async (event) => {
  const { error } = orderSchema.validate(event.body);
  if (error) {
    return sendResponse(400, {
      success: false,
      message: error.details[0].message
    });
  }
  
  const { orderId } = event.pathParameters;
  const updateData = event.body;

  const result = await editOrder(orderId, updateData);

  if (result.success) {
    return sendResponse(200, {
      success: true,
      message: "Order updated successfully!",
      booking: result
    });
  } else {
    return sendResponse(400, {
      success: false,
      message: result.message
    });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());
