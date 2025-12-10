import dotenv from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import https from 'https';

dotenv.config();

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const API_URL = 'https://tivva34.github.io/MenuAPI/menu.json';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Hämta JSON från GitHub Pages
function fetchMenuFromAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Konvertera kategori till categoryKey (lowercase, inga special chars)
function getCategoryKey(category) {
  return category
    .toLowerCase()
    .replace(/\//g, '-')      // Ersätt / med -
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9-]/g, '') // Ta bort allt annat än bokstäver, siffror, bindestreck
    .replace(/-+/g, '-')       // Flera bindestreck -> ett bindestreck
    .replace(/^-|-$/g, '');    // Ta bort bindestreck i början/slut
}

// Transformera API-objekt till rätt DynamoDB-format
function transformMenuItem(apiItem) {
  const categoryKey = getCategoryKey(apiItem.category);
  const timestamp = new Date().toISOString();
  
  return {
    PK: `PRODUCT#${apiItem.id}`,
    SK: 'DETAILS',
    type: 'Product',
    productId: apiItem.id,
    name: apiItem.name,
    description: apiItem.description || '',
    price: apiItem.price,
    category: apiItem.category,
    categoryKey: categoryKey,
    available: true,
    code: apiItem.code || null,
    notes: apiItem.notes || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

// Skriv items i batches (max 25 per batch)
async function writeBatch(items) {
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const [index, batch] of batches.entries()) {
    console.log(`Writing batch ${index + 1}/${batches.length} (${batch.length} items)...`);
    const params = {
      RequestItems: {
        [TABLE_NAME]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    };

    try {
      await docClient.send(new BatchWriteCommand(params));
    } catch (err) {
      console.error(`Failed to write batch ${index + 1}:`, err.message);
      throw err;
    }
  }
}

async function run() {
  try {
    console.log(`Fetching menu from ${API_URL}...`);
    const apiData = await fetchMenuFromAPI(API_URL);
    
    // API returnerar { menu: [...] }
    const apiMenu = apiData.menu || apiData;
    
    if (!Array.isArray(apiMenu)) {
      throw new Error('API did not return an array');
    }

    console.log(`Fetched ${apiMenu.length} menu items`);

    // Transformera alla items och kolla efter duplikater
    const allItems = [];
    const seenIds = new Set();
    const duplicates = [];
    
    for (const apiItem of apiMenu) {
      if (seenIds.has(apiItem.id)) {
        duplicates.push(apiItem.id);
        console.warn(`Duplicate ID found: ${apiItem.id} - "${apiItem.name}" will be skipped`);
        continue;
      }
      seenIds.add(apiItem.id);
      
      const product = transformMenuItem(apiItem);
      allItems.push(product);
      // GSI on categoryKey - no need for separate index items
    }
    
    if (duplicates.length > 0) {
      console.log(`\nFound ${duplicates.length} duplicate IDs: ${duplicates.join(', ')}`);
      console.log('These items were skipped.\n');
    }

    console.log(`Prepared ${allItems.length} products for DynamoDB`);
    console.log(`Writing to ${TABLE_NAME} in ${REGION}...`);

    await writeBatch(allItems);

    console.log('Successfully imported all menu items!');
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

run();

/* Författare: Tim */
/* Hämtar meny-data från GitHub Pages API och importerar produkter till DynamoDB */
