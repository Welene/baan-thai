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

// PUT uppdatera order
export const editOrder = async (orderId, updateData) => {
  const GetCommand = new GetCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: "ORDER",
      SK: orderId,
    },
  });

  let existingOrder;
  try {
    const getResult = await docClient.send(GetCommand);
    if (!getResult.Item) {
      return { success: false, message: `Order with id ${orderId} not found` };
    }
    existingOrder = getResult.Item;
  } catch (error) {
    console.error(`Error fetching order with id ${orderId}:`, error.message);
    return { success: false, message: `Error fetching order: ${error.message}` };
  }

  if (updateData.order) {
    existingOrder.order = [
      ...updateData.order,
    ];
  }

  const calculateTotalPrice = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.price * item.amount, 0);
  }

  existingOrder.totalPrice = calculateTotalPrice(existingOrder.order);

  const updatecommand = new UpdateCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: "ORDER",
      SK: orderId,
    },
    UpdateExpression: updateData.order
      ? "SET #order = :order, totalPrice = :totalPrice"
      : "SET totalPrice = :totalPrice",
    ExpressionAttributeNames: {
      "#order": "order",
    },
    ReturnValues: "ALL_NEW"
  });

  try {
    const result = await docClient.send(updatecommand);
    return  { success: true, updatedOrder: result.Attributes };
  } catch (error) {
    return { success: false, message: `Error updating order: ${error.message}` };
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