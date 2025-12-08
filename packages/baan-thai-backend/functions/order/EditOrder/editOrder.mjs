import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { editOrder } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  // Validera endast om order-array är med
  if (event.body.order) {
    const orderItems = event.body.order;
    
    // Validera att order-arrayen är korrekt
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return sendResponse(400, {
        success: false,
        message: "Order must be a non-empty array"
      });
    }

    // Validera varje item
    for (const item of orderItems) {
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        return sendResponse(400, {
          success: false,
          message: "Each order item must have a valid productId "
        });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return sendResponse(400, {
          success: false,
          message: "Each order item must have a valid quantity "
        });
      }
    }
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
