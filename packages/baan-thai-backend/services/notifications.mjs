import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./clients.mjs";
import { generateId } from "../utils/uuid.mjs";

// Skapa en notifikation för en användare
export const createNotification = async ({ userId, orderId, type, message }) => {
  const notificationId = generateId(12);
  
  const notification = {
    PK: `USER#${userId}`,
    SK: `NOTIFICATION#${notificationId}`,
    notificationId,
    userId,
    orderId,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: notification
  });

  try {
    await docClient.send(command);
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, message: error.message };
  }
};

// Skapa notifikation baserat på orderstatus
export const createOrderNotification = async (userId, orderId, status) => {
  const notificationMessages = {
    pending: `Din order #${orderId.slice(0, 8)} har mottagits och behandlas.`,
    confirmed: `Din order #${orderId.slice(0, 8)} har bekräftats!`,
    preparing: `Din order #${orderId.slice(0, 8)} förbereds nu i köket.`,
    ready: `Din order #${orderId.slice(0, 8)} är klar för upphämtning!`,
    completed: `Din order #${orderId.slice(0, 8)} är slutförd. Tack för din beställning!`,
    cancelled: `Din order #${orderId.slice(0, 8)} har avbrutits.`
  };

  const notificationTypes = {
    pending: 'order_confirmed',
    confirmed: 'order_confirmed',
    preparing: 'order_preparing',
    ready: 'order_ready',
    completed: 'order_delivered',
    cancelled: 'order_confirmed'
  };

  const message = notificationMessages[status] || `Order #${orderId.slice(0, 8)} status uppdaterad till: ${status}`;
  const type = notificationTypes[status] || 'order_confirmed';

  return await createNotification({
    userId,
    orderId,
    type,
    message
  });
};
