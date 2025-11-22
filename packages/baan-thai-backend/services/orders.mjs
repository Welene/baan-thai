import { docClient } from "./client.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const getAllOrders = async () => {
  const command = new QueryCommand({
    TableName: "RestaurantTable",
    KeyConditionExpression: "PK = :PK",
    ExpressionAttributeValues: {
      ":PK": "ORDER",
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error({ message: `${error.message} from getAllOrder` });
    throw new Error("Could not fetch orders");
  }
}

// POST skapa order
export const addOrder = async ({ id, firstName, lastName, email, phoneNumber, order, totalPrice, message, payment }) => {
  const orderId = id;

  const item = {
    PK: "ORDER",
    SK: orderId,
    firstName,
    lastName,
    email,
    phoneNumber,
    order,
    totalPrice,
    message,
    payment,
    createdAt: new Date().toDateString()
  };

  const command = new PutCommand({
    TableName: "RestaurantTable",
    Item: item
  });

  try {
    await docClient.send(command);
    return { succes: true, id, firstName, lastName, email, phoneNumber, order, totalPrice, message, payment }
  } catch (error) {
    console.error(`Error from db: `, error.message);
    return { success: false, message: `Error saving order: ${error.message}` };
  }
}

// DELETE radera order
export const deleteOrder = async (orderId) => {
  try {
    const params = {
      TableName: "RestaurantTable",
      Key: {
        PK: "ORDER",
        SK: orderId,
      },
      ReturnValues: "ALL_OLD",
    };

    const command = new DeleteCommand(params);
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    console.error(`Error deleting order with id ${orderId}:`, error.message);
    return { success: false, message: `Error deleting order: ${error.message}` };
  }
};