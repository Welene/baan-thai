import Joi from "joi";

export const updateOrderSchema = Joi.object({
  orderId: Joi.string().min(1),
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phoneNumber: Joi.number().min(1),
  order: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().min(1),
        amout: Joi.number().min(1)
      })
    )
    .min(1),
  message: Joi.string(),
  totalPrice: Joi.forbidden(),
  payment: Joi.array()
    .items(
      Joi.object({
        paymentType: Joi.string().valid("swish", "card"),
      })
    )
    .min(1)
})