import Joi from "joi";

export const updateOrderSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).optional(),
  lastName: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().min(5).max(20).optional(),
  order: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().min(1).required(),
        amount: Joi.number().min(1).required()
      })
    )
    .min(1)
    .optional(),
  status: Joi.string()
    .valid("pending", "confirmed", "locked", "cancelled")
    .optional(),
  // Dessa får EJ uppdateras av klienten
  orderId: Joi.forbidden(),
  totalPrice: Joi.forbidden(),
  userId: Joi.forbidden(),
  createdAt: Joi.forbidden(),
});