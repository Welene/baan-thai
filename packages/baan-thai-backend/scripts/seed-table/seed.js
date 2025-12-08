require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const BATCH_SIZE = 25;

if (process.env.AWS_PROFILE) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
}
AWS.config.update({ region: REGION });

const doc = new AWS.DynamoDB.DocumentClient();

function shortId() {
  // Enkel 8-teckens id via native crypto
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

function splitIntoBatches(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function writeBatch(batch) {
  const params = { RequestItems: { [TABLE_NAME]: batch.map(Item => ({ PutRequest: { Item } })) } };
  // Enkel retry (max 3 försök) med liten väntan
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await doc.batchWrite(params).promise();
    const unprocessed = res.UnprocessedItems && res.UnprocessedItems[TABLE_NAME] ? res.UnprocessedItems[TABLE_NAME] : [];
    if (!unprocessed || unprocessed.length === 0) return;
    console.log(`Batch had ${unprocessed.length} unprocessed items, retry ${attempt + 1}`);
    params.RequestItems[TABLE_NAME] = unprocessed;
    await new Promise(r => setTimeout(r, (attempt + 1) * 300));
  }
  throw new Error('Failed to write batch after retries');
}

async function run() {
  const seedPath = path.join(__dirname, '..', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Missing', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf8');
  const items = JSON.parse(raw).map(item => {
    // Lägg till enkla id:n om de saknas så att PK/SK kan byggas från dem.
    if (!item.userId && item.PK && item.PK.startsWith('USER#')) {
      item.userId = item.PK.split('#')[1];
    }
    if (!item.userId) item.userId = shortId();
    if (!item.orderId && item.PK && item.PK.startsWith('ORDER#')) {
      item.orderId = item.PK.split('#')[1];
    }
    if (!item.orderId) item.orderId = shortId();
    return item;
  });

  console.log(`Writing ${items.length} items to ${TABLE_NAME} in ${REGION}`);
  const batches = splitIntoBatches(items, BATCH_SIZE);
  let total = 0;
  for (const [i, batch] of batches.entries()) {
    console.log(`-> Batch ${i + 1}/${batches.length} (${batch.length} items)`);
    await writeBatch(batch);
    total += batch.length;
  }
  console.log(`Done: wrote ${total} items to ${TABLE_NAME}`);
}

run().catch(err => {
  console.error('Seed failed:', err.message || err);
  process.exit(1);
});

/* Författare: Tim */
/* Seedar DynamoDB-tabellen med testdata från seed-data.json */
