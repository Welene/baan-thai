const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.RESTAURANT_TABLE || "RestaurantTable";

exports.handler = async (event) => {
  console.log("GET /api/menu - Fetching all menu items");

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
