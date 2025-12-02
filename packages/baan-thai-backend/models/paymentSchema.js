import Joi from 'joi';

export const paymentSchema = Joi.object({
    orderId: Joi.string().required(),
    paymentMethod: Joi.string().valid('swish', 'card').required()
});