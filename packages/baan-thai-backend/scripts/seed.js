// Importer
require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.TABLE_NAME || 'RestaurantTable';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const MAX_BATCH = 25;

if (process.env.AWS_PROFILE) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
}
AWS.config.update({ region: REGION });

const doc = new AWS.DynamoDB.DocumentClient();

// Generera ett 8-tecken långt id baserat på uuid.v4()
function gen8() {
  return uuidv4().replace(/-/g, '').slice(0, 8);
}

// map av token -> genererat id så samma token återanvänds över hela filen
const tokenMap = new Map();

function getOrCreateIdForToken(token) {
  if (tokenMap.has(token)) return tokenMap.get(token);
  const id = gen8();
  tokenMap.set(token, id);
  return id;
}

function replaceTokensInString(s) {
  if (typeof s !== 'string') return s;
  // Ersätt alla placeholders av formen <name> med ett återanvänt 8-tecken-id
  return s.replace(/<([a-zA-Z0-9_-]+)>/g, (_, token) => getOrCreateIdForToken(token));
}

function injectIds(item) {
  // Gå igenom objektet och ersätt token-placeholders i alla string - fält, ska använda jwt token senare
  const walk = (obj) => {
    if (typeof obj === 'string') return replaceTokensInString(obj);
    if (Array.isArray(obj)) return obj.map(walk);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = walk(v);
      }
      return out;
    }
    return obj;
  };

  const transformed = walk(item);

  // ta userId/orderId från PK om de saknas
  if (!transformed.userId && transformed.PK && typeof transformed.PK === 'string' && transformed.PK.startsWith('USER#')) {
    transformed.userId = transformed.PK.split('#')[1];
  }
  if (!transformed.orderId && transformed.PK && typeof transformed.PK === 'string' && transformed.PK.startsWith('ORDER#')) {
    transformed.orderId = transformed.PK.split('#')[1];
  }

  // Om UserOrderRef har orderId i SK som 8tecken extrahera det
  if (!transformed.orderId && transformed.SK && typeof transformed.SK === 'string') {
    const m = transformed.SK.match(/#([0-9a-f]{8})$/);
    if (m) transformed.orderId = m[1];
  }

  return transformed;
}

function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

async function batchWriteWithRetry(items) {
  let unprocessed = items.map(i => ({ PutRequest: { Item: i } }));
  let attempts = 0;
  while (unprocessed.length > 0 && attempts < 5) {
    const params = { RequestItems: { [TABLE_NAME]: unprocessed } };
    const resp = await doc.batchWrite(params).promise();
    if (resp.UnprocessedItems && resp.UnprocessedItems[TABLE_NAME]) {
      unprocessed = resp.UnprocessedItems[TABLE_NAME];
      attempts += 1;
      const backoff = Math.pow(2, attempts) * 100;
      console.log(`Retry ${attempts}, backing off ${backoff}ms, ${unprocessed.length} unprocessed`);
      await new Promise(r => setTimeout(r, backoff));
    } else {
      unprocessed = [];
    }
  }
  if (unprocessed.length > 0) throw new Error(`Failed to write ${unprocessed.length} items after retries`);
}

async function run() {
  const seedPath = path.join(__dirname, '..', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    console.error('seed-data.json not found at', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf8');
  let items = JSON.parse(raw);
  // lägg in 8-tecken-ID för alla <uuid>-placeholders och håll PK/SK konsekventa
  items = items.map(injectIds);
  console.log(`Found ${items.length} items to write to table "${TABLE_NAME}" in region ${REGION}`);

  const chunks = chunkArray(items, MAX_BATCH);
  let written = 0;
  for (const [i, chunk] of chunks.entries()) {
    console.log(`Writing batch ${i + 1}/${chunks.length} (${chunk.length} items)`);
    await batchWriteWithRetry(chunk);
    written += chunk.length;
  }
  console.log(`All done — wrote ${written} items to ${TABLE_NAME}`);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
