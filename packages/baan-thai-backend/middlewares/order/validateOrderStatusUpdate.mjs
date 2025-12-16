import { orderStatusSchema } from "../models/orderStatusSchema.mjs";

export const validateOrderStatusUpdate = () => ({
    before: (handler) => {
        if (!handler.event.body) throw new Error('No body provided');

        const { error, value } = orderStatusSchema.validate(handler.event.body);
        if (error) throw new Error(error.details[0].message);

        return;
    }
});

// Author: Felicia