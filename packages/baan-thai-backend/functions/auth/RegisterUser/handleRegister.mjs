import { DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { hash } from '../../../utils/password.mjs';
import { createToken } from '../../../utils/auth.mjs';
import { docClient } from '../../../services/clients.mjs';
import crypto from 'crypto';
import { sendResponse } from '../../../responses/response.mjs';

const generateUUID = () => crypto.randomUUID();
const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const incomingKey = event.headers?.["x-api-key"] || event.headers?.["X-API-Key"] || event.headers?.["X-Api-Key"];
    if (incomingKey !== process.env.API_KEY) {
      return sendResponse(401, { error: 'Invalid API Key' });
    }

    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;
    const name = body.name;
    const username = body.username;
    const role = body.role || 'customer';

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-123';
    if (role === 'admin' && body.adminSecret !== ADMIN_SECRET) {
      return sendResponse(403, { error: 'Obehörig admin-registrering' });
    }

    const address = body.address || null;
    const phoneNumber = body.phoneNumber || null;

    if (!email || !password || !name || !username) {
      return sendResponse(400, { error: 'Email, lösenord, namn och användarnamn krävs' });
    }

    const normalizedEmail = String(email).toLowerCase();
    let existingUser;

    try {
      existingUser = await dynamodb.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normalizedEmail },
        Limit: 1,
      }));
    } catch (err) {
      if (err.name === 'ValidationException' || (err.message && err.message.includes('index'))) {
        existingUser = await dynamodb.send(new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'email = :email AND begins_with(PK, :userPrefix)',
          ExpressionAttributeValues: { ':email': normalizedEmail, ':userPrefix': 'USER#' },
        }));
      } else {
        throw err;
      }
    }

    if (existingUser.Items && existingUser.Items.length > 0) {
      return sendResponse(409, { error: 'Email finns redan registrerad' });
    }

    const userId = generateUUID().replace(/-/g, '').slice(0, 8);
    const passwordHash = await hash(password);
    const timestamp = new Date().toISOString();

    const newUser = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      email: normalizedEmail,
      passwordHash,
      name,
      username,
      address,
      phoneNumber,
      role,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: newUser }));

    const token = createToken({ userId, email, role });

    return sendResponse(201, {
      message: 'Registrering lyckades',
      token,
      user: { userId, email, name, username, role, phoneNumber },
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(500, { error: 'Serverfel vid registrering', details: error.message });
  }
};



/* Författare: Tim */
/* Användarregistrering med email-validering och JWT-token */
// Helene edit: added phoneNumber
// Helene edit: added fetchWithApiKey in every api call for extra api protection