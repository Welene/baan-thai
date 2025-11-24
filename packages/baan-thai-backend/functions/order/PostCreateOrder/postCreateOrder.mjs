import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { sendResponse } from '../../responeses/response.js'
import { errorHandler } from '../../middlewares/errorHandler.mjs'
import { validateOrder } from '../../middlewares/validateOrder.mjs'
import { addOrder } from '../../services/orders.mjs'

export const handler = middy(async (event) => {
  const order = await addOrder(event.body);
  if (order.success) {
    return sendResponse(201, {
      success: true,
      message: 'Order created successfully',
      order
    });
  } else {
    return sendResponse(500, {
      success: false,
      message: order.message || 'Failed to create order'
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler())