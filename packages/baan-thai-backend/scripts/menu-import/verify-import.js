require('dotenv').config();
const AWS = require('aws-sdk');

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';
const REGION = process.env.AWS_REGION || 'eu-north-1';

if (process.env.AWS_PROFILE) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
}
AWS.config.update({ region: REGION });

const doc = new AWS.DynamoDB.DocumentClient();

async function countProducts() {
  let products = [];
  let lastKey = null;
  
  do {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: '#type = :product',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':product': 'Product'
      }
    };
    
    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }
    
    const result = await doc.scan(params).promise();
    products = products.concat(result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  
  return products;
}

async function run() {
  try {
    console.log(`Scanning ${TABLE_NAME} for products...\n`);
    
    const products = await countProducts();
    
    console.log(`Total products in DynamoDB: ${products.length}`);
    console.log(`\nProduct IDs: ${products.map(p => p.productId).sort((a, b) => a - b).join(', ')}`);
    
    // Kolla om det finns några saknade ID:n (1-139)
    const ids = products.map(p => p.productId).sort((a, b) => a - b);
    const missing = [];
    for (let i = 1; i <= 139; i++) {
      if (!ids.includes(i)) {
        missing.push(i);
      }
    }
    
    if (missing.length > 0) {
      console.log(`\nMissing product IDs: ${missing.join(', ')}`);
    } else {
      console.log(`\nAll IDs from 1-139 are present!`);
    }
    
    // Visa några exempel med ALLA fält
    console.log(`\nSample products (full data):`);
    products.slice(0, 3).forEach(p => {
      console.log(`\nProduct ID ${p.productId}:`);
      console.log(JSON.stringify(p, null, 2));
    });
    
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

run();

/* Författare: Tim */
/* Detta script verifierar att menu-import lyckades genom att räkna och visa produkter i DynamoDB */
