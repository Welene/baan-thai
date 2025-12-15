import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../../services/clients.mjs";

const dynamoDb = docClient;

const TABLE_NAME = process.env.RESTAURANT_TABLE || "RestaurantTable";

export const handler = async (event) => {
  console.log("GET /api/menu - Fetching all menu items");
  // API_KEY START ----------------------------------------------
	const incomingKey = event.headers?.["x-api-key"];
	const expectedKey = process.env.API_KEY;

	if (incomingKey !== expectedKey) {
		return {
			statusCode: 401,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
			},
			body: JSON.stringify({ error: 'Invalid API Key' }),
		};
	}
	// API_KEY END ------------------------------------------------

  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "begins_with(PK, :pk)",
      ExpressionAttributeValues: {
        ":pk": "PRODUCT#"
      }
    };

    const result = await dynamoDb.send(new ScanCommand(params));
    
    console.log("DynamoDB item (all fields):", JSON.stringify(result.Items[0], null, 2));
    console.log("Item keys:", Object.keys(result.Items[0] || {}));
    
    // Mappa DynamoDB-struktur till frontend-format
    const items = result.Items.map(item => {
      console.log(`Item ${item.productId}: categoryKey=${item.categoryKey}, category=${item.category}`);
      return {
        productId: item.productId,
        name: item.name,
        title: item.name, // Både name och title för kompatibilitet
        description: item.description || '',
        price: item.price,
        category: item.category,
        categoryKey: item.categoryKey
      };
    });

    console.log(`Found ${items.length} menu items`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(items)
    };

  } catch (error) {
    console.error("Error fetching menu:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Kunde inte hämta meny",
        message: error.message 
      })
    };
  }
};

/* Författare: Tim */
/* hämtar alla menyprodukter från DynamoDB */

 // Helene edit: added incoming API_KEY and expected API_KEY for extra api protection