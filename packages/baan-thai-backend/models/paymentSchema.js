import Joi from 'Joi';

export const paymentSchema = Joi.object({
    orderId: Joi.string().required(),
    paymentMethod: Joi.string().valid('swish', 'card').required()
});