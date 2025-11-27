import middy from '@middy/core';
import httpJsonBodyPaser from '@middy/http-json-body-parser';
import { sendResponse } from '../response/response';
import { errorHandler } from '../middlewares/errorHandler';
import { validatePayment } from '../middlewares/validatePayment';

const processPaymentHandler = async (event) => {
    const { orderId, paymentMethod } = event.body;

    // Validate input details
    if (!orderId || !paymentMethod) {
        return sendResponse(400, {
            success: false,
            message: 'orderId and paymentMethod are required'
        });
    }

    // Fetch ordern från databasen
    const order = await getOrderById(orderId);

    if (!order.success) {
        return sendResponse(404, {
            success: false,
            message: `Òrder with id ${orderId} not found`
        });
    }

    // Kontrollera att ordern inte redan är betald
    if (order.data.paymentStatus === 'paid') {
        return sendResponse(400, {
            success: false,
            message: 'Order is already paid'
        });
    }

    const updateResult = await updateOrderPaymentStatus(orderId, 'paid', paymentMethod);

    if (!updateResult.success) {
        return sendResponse(500, {
            success: false,
            message: 'Failed to update payment status'
        });
    }

    // Returnera seccess direkt
    return sendResponse(200, {
        success: true,
        message: 'Payment completed',
        payment: {
            orderId,
            paymentMethod,
            status: 'paid',
            amount: order.data.totalPrice
        }
    });
};

export const handler = middy(processPaymentHandler)
    .use(httpJsonBodyPaser())
    .use(validatePayment())
    .use(errorHandler());