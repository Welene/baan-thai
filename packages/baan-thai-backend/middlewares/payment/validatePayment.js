import { paymentSchema } from '../../models/paymentSchema.js';
import { sendResponse } from '../../responses/response.mjs';

export const validatePayment = () => {
    return {
        before: async (requst) => {
            const { error } = paymentSchema.validate(requst.event.body);

            if (error) {
                return sendResponse(400, {
                    success: false,
                    message: error.details[0].message
                });
            }
        }
    };
};

// Create by: Sunsanee