import Joi from "joi";

export const orderSchema = Joi.object({
  order : Joi.array()
    .items(
      Joi.object({
        productId : Joi.number().min(1).required(),
        quantity : Joi.number().min(1).required(),
        price : Joi.number().min(0).required(),
      })
    ).min(1).required(),
});