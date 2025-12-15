import Joi from "joi";

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "locked", "cancelled", "ready", "completed")
    .required(),
});

// Helene edit: added completed!... I think?