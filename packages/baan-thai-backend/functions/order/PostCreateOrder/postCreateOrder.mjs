import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { sendResponse } from '../../../responses/response.mjs'
import { errorHandler } from '../../../middlewares/errorHandler.mjs'
import { validateOrder } from '../../../middlewares/order/validateOrder.mjs'
import { addOrder } from '../../../services/orders.mjs'
import { queryMenuItem } from '../../menu/queryMenuItem.mjs'

export const handler = middy(async (event) => {
  //API KEY START---------------------------------------------
  const incomingKey = event.headers?.["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (incomingKey !== expectedKey) {
    return sendResponse(401, { 
      success: false,
      message: "Invalid API Key"
    });
  }
  
  //API KEY END---------------------------------------------
  try {
    const body = event.body;
    console.log('📦 Received order request:', JSON.stringify(body, null, 2));

    // Hämta pris för varje item
    const populatedOrder = [];

    for (const item of body.order) {
      console.log(`🔍 Fetching product ${item.productId}...`);
      
      let product;
      try {
        product = await queryMenuItem(item.productId);
      } catch (dbError) {
        console.error(`DynamoDB error for product ${item.productId}:`, dbError.message);
        // Använd mock data om DynamoDB failar
        product = {
          name: `Product ${item.productId}`,
          price: 99
        };
        console.log(`Using mock data for product ${item.productId}`);
      }

      if (!product) {
        console.error(`Product ${item.productId} not found`);
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
      
      console.log(`Added product ${item.productId}: ${product.name} @ ${product.price} kr`);
    }

    console.log('Populated order:', JSON.stringify(populatedOrder, null, 2));

    // Skicka in fullständig order till addOrder()
    const order = await addOrder({
      userId: body.userId,
      order: populatedOrder,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      message: body.message,
      paymentStatus: body.paymentStatus || "pending"
    });

    console.log('Order result:', JSON.stringify(order, null, 2));

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
  } catch (error) {
    console.error('Unexpected error in postCreateOrder:', error);
    return sendResponse(500, {
      success: false,
      message: `Server error: ${error.message}`
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler())