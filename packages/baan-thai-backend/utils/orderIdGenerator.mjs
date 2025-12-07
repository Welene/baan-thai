import { docClient } from "../services/clients.mjs";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Genererar ett sekventiellt ordernummer
 * Format: 1001, 1002, 1003, etc.
 * Startar från 1001 för att ge ett professionellt intryck
 */
export const generateOrderId = async () => {
  const TABLE_NAME = process.env.TABLE_NAME || "RestaurantTable";
  
  try {
    // Hämta det senaste ordernumret från en dedikerad counter-post
    const counterCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "PK = :pk AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": "COUNTER",
        ":sk": "ORDER_COUNTER"
      }
    });

    const result = await docClient.send(counterCommand);
    let nextOrderNumber = 1001; // Startvärde

    if (result.Items && result.Items.length > 0) {
      nextOrderNumber = result.Items[0].currentValue + 1;
    }

    // Uppdatera counter
    const updateCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: "COUNTER",
        SK: "ORDER_COUNTER",
        currentValue: nextOrderNumber,
        updatedAt: new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);

    return nextOrderNumber.toString();
  } catch (error) {
    console.error("Error generating order ID:", error);
    // Fallback: använd timestamp + random för att undvika kollisioner
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
};

/* Författare: Tim */
/* Genererar ordernummer för ordrar, börjar på 1001 */