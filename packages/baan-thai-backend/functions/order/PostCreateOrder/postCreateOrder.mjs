import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { sendResponse } from '../../../responses/response.mjs'
import { errorHandler } from '../../../middlewares/errorHandler.mjs'
import { validateOrder } from '../../../middlewares/validateOrder.mjs'
import { addOrder } from '../../../services/orders.mjs'
import { queryMenuItem } from '../../queryMenuItem.mjs'

export const handler = middy(async (event) => {
  const body = event.body;

  // Hämta pris för varje item
  const populatedOrder = [];

  for (const item of body.order) {
    const product = await queryMenuItem(item.productId);

    if (!product) {
      return sendResponse(404, {
        success: false,
        message: `Product ${item.productId} not found`
      });
    }

    populatedOrder.push({
      ...item,
      name: product.name,
      price: product.price
    });
  }

  // Skicka in fullständig order till addOrder()
  const order = await addOrder({
    userId: body.userId,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phoneNumber: body.phoneNumber,
    message: body.message,
    payment: body.payment,
    paymentStatus: body.paymentStatus,
    order: populatedOrder
  });

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