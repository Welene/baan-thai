import { orderSchema } from "../models/orderSchema.mjs";

export const validateOrder = () => ({
  before: (handler) => {
    const { error, value } = orderSchema.validate(handler.event.body);
    console.log("Error i middleware:", error);
    console.log("Error i middleware:", value);
    if (error) {
      throw new Error(error.details[0].message);
    }
  },
});
