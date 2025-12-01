import { docClient } from "../services/clients.mjs";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export const queryMenuItem = async (productId) => {
  const command = new GetCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: "DETAILS"
    }
  });

  const result = await docClient.send(command);
  return result.Item || null;
};
