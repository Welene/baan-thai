import Joi from "joi";

export const orderSchema = Joi.object({
  orderId: Joi.string().min(1).required(),
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.number().min(1).required(),
  order: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().min(1).required(),
        amout: Joi.number().min(1).required()
      })
    )
    .min(1)
    .required(),
  message: Joi.string(),
  totalPrice: Joi.forbidden(),
  payment: Joi.array()
    .items(
      Joi.object({
        paymentType: Joi.string().valid("swish", "card"),
      })
    )
    .min(1)
    .required(),
})