import Joi from "joi";

export const orderSchema = Joi.object({
  orderId: Joi.forbidden(),
  order: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().min(1).required(),
        amout: Joi.number().min(1).required()
      })
    )
    .min(1)
    .required(),
  status: Joi.string().valid("pending", "confirmed", "locked", "cancelled").required(),
  totalPrice: Joi.forbidden(),
});