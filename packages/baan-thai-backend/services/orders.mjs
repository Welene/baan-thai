import { docClient } from "./clients.mjs";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { generateId } from "../utils/uuid.mjs";
import { queryMenuItem } from "../functions/getProduct.mjs";

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
export const addOrder = async ({ userId, order, orderId = null, firstName, lastName, email, phoneNumber, message, paymentStatus = "pending" }) => {
  // Skapa orderId om det saknas
  if (!orderId) {
    orderId = generateId(8);
  }

  // Säkerhetscheck (ifall någon item saknar price eller quantity)
  for (const item of order) {
    if (typeof item.price !== "number" || typeof item.quantity !== "number") {
      throw new Error(`Invalid order item. price and quantity must be numbers. Got price=${item.price}, quantity=${item.quantity}`);
    }
  }

  // Beräkna totalpris
  const totalPrice = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Skapa nytt orderobjekt
  const newOrder = {
    PK: `ORDER#${orderId}`,
    SK: "ORDER",
    type: "Order",
    orderId,
    userId,
    order,
    totalPrice,
    status: paymentStatus === "paid" ? "confirmed" : "pending",
    paymentStatus,
    customerInfo: {
      firstName,
      lastName,
      email,
      phoneNumber,
      message
    },
    createdAt: new Date().toISOString(),
  };

  // Spara i DB
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
      totalPrice,
      createdAt: newOrder.createdAt,
      status: newOrder.status,
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

  let updatedOrder = existingOrder.order;

  if (updateData.order) {
    // Populera price för varje item
    updatedOrder = [];
    for (const item of updateData.order) {
      const product = await queryMenuItem(item.productId);
      if (!product) {
        return { success: false, message: `Product ${item.productId} not found` };
      }

      updatedOrder.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        name: product.name
      });
    }
  }

  const totalPrice = updatedOrder.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const command = new UpdateCommand({
    TableName: "RestaurantTable",
    Key: { PK: `ORDER#${orderId}`, SK: "ORDER" },
    UpdateExpression: "SET #order = :order, totalPrice = :totalPrice",
    ExpressionAttributeNames: { "#order": "order" },
    ExpressionAttributeValues: { ":order": updatedOrder, ":totalPrice": totalPrice },
    ReturnValues: "ALL_NEW"
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
    FilterExpression: "#type = :type AND #status = :status",
    ExpressionAttributeNames: {
      "#type": "type",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":type": "Order",
      ":status": status,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error(`Error scanning orders by status "${status}":`, error.message);
    return [];
  }
};

// GET orders by userId
export const getOrdersByUserId = async (userId) => {
  const command = new ScanCommand({
    TableName: "RestaurantTable",
    FilterExpression: "#userId = :userId AND #type = :type",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
      ":type": "Order", // bara orders
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

    if (!result.Attributes) {
      return { success: false, message: `Order with id ${orderId} not found` };
    }

    return { success: true, deletedOrder: result.Attributes };
  } catch (error) {
    console.error(`Error deleting order with id ${orderId}:`, error.message);
    return { success: false, message: `Error deleting order: ${error.message}` };
  }
};
