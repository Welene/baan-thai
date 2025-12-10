import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { sendResponse } from "../../../responses/response.mjs";
import { adminEditOrder } from "../../../services/orders.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters;
  const { adminMessages } = event.body;

  if (!adminMessages) {
    return sendResponse(400, {
      success: false,
      message: "adminMessages is required"
    });
  }

  const updateData = { adminMessages };

  const result = await adminEditOrder(orderId, updateData); // <-- skicka objektet, inte strängen

  if (result.success) {
    return sendResponse(200, {
      success: true,
      message: "Message sent successfully!"
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