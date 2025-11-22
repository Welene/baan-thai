import { oredrSchema } from "../models/oredrSchema.mjs";

export const validateOrder = () => ({
  before: (handler) => {
    const { error, value } = oredrSchema.validate(handler.event.body);
    console.log("Error i middleware:", error);
    console.log("Error i middleware:", value);
    if (error) {
      throw new Error(error.details[0].message);
    }
  },
});
