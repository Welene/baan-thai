import Joi from "joi";

export const orderSchema = Joi.object({
  userId : Joi.string().required(),
  order : Joi.array()
    .items(
      Joi.object({
        productId : Joi.number().min(1).required(),
        quantity : Joi.number().min(1).required(),
      })
    ).min(1).required(),
});