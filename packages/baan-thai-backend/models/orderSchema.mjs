import Joi from "joi";

export const orderSchema = Joi.object({
  userId: Joi.string().required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.number().optional(),
  message: Joi.string().optional(),
  totalPrice: Joi.number().optional(),
  payment: Joi.array().items(
    Joi.object({
      paymentType: Joi.string().required()
    })
  ).optional(),
  paymentStatus: Joi.string().optional(),
  order: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().min(1).required(),
        quantity: Joi.number().min(1).required(),
      })
    ).min(1).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  message: Joi.string().optional(),
  paymentStatus: Joi.string().valid("pending", "paid", "failed").optional()
});

// Author: Felicia