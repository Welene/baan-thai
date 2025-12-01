import { docClient } from "./clients.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { generateId } from "../utils/uuid.mjs";

// GET alla orders
export const getAllOrders = async () => {
  const command = new ScanCommand({
    TableName: "RestaurantTable",
    FilterExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":type": "Order",
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error({ message: `${error.message} from getAllOrders` });
    throw new Error("Could not fetch orders");
  }
};

// POST skapa order
export const addOrder = async ({ userId, order, orderId = null }) => {
  if (!orderId) {
    orderId = generateId(8);
  }

  const totalPrice = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = {
    PK: `ORDER#${orderId}`,
    SK: "ORDER",
    type: "Order",
    userId,
    order,
    totalPrice,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: "RestaurantTable",
    Item: newOrder,
  });

  try {
    await docClient.send(command);
    return {
      success: true,
      orderId,
      userId,
      order,
      totalPrice
    };
  } catch (error) {
    console.error("Error saving order:", error.message);
    return { success: false, message: `Error saving order: ${error.message}` };
  }
};

// GET en order
export const queryOrder = async (orderId) => {
  const command = new GetCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: `ORDER#${orderId}`,
      SK: "ORDER",
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Item || null;
  } catch (error) {
    console.error("Error fetching order:", error.message);
    return null;
  }
};

// PUT uppdatera order
export const editOrder = async (orderId, updateData) => {
  const existingOrder = await queryOrder(orderId);

  if (!existingOrder) {
    return { success: false, message: `Order with id ${orderId} not found` };
  }

  if (updateData.order) {
    existingOrder.order = [...updateData.order];
  }

  existingOrder.totalPrice = existingOrder.order.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const command = new UpdateCommand({
    TableName: "RestaurantTable",
    Key: { PK: `ORDER#${orderId}`, SK: "ORDER" },
    UpdateExpression: "SET #order = :order, totalPrice = :totalPrice",
    ExpressionAttributeNames: {
      "#order": "order",
    },
    ExpressionAttributeValues: {
      ":order": existingOrder.order,
      ":totalPrice": existingOrder.totalPrice,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(command);
    return { success: true, updatedOrder: result.Attributes };
  } catch (error) {
    return { success: false, message: `Error updating order: ${error.message}` };
  }
};

// PUT status uppdatering
export const updateOrderStatus = async (orderId, status) => {
  const command = new UpdateCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: `ORDER#${orderId}`,
      SK: "ORDER",
    },
    UpdateExpression: "SET #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await docClient.send(command);
    return { success: true, updatedOrder: result.Attributes };
  } catch (error) {
    return { success: false, message: `Error updating order status: ${error.message}` };
  }
};

// GET oredr by status
export const getOrdersByStatus = async (status) => {
  const command = new ScanCommand({
    TableName: "RestaurantTable",
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error scanning orders:", error.message);
    return [];
  }
};

// GET orders by userId
export const getOrdersByUserId = async (userId) => {
  const command = new ScanCommand({
    TableName: "RestaurantTable",
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error(`Error fetching orders for userId ${userId}:`, error.message);
    return [];
  }
};

// DELETE radera order
export const deleteOrder = async (orderId) => {
  const command = new DeleteCommand({
    TableName: "RestaurantTable",
    Key: {
      PK: `ORDER#${orderId}`,
      SK: "ORDER",
    },
    ReturnValues: "ALL_OLD",
  });

  try {
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    console.error(`Error deleting order with id ${orderId}:`, error.message);
    return { success: false, message: `Error deleting order: ${error.message}` };
  }
};
