import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { compare } from '../../../utils/password.mjs';
import { createToken } from '../../../utils/auth.mjs';
import { docClient } from '../../../services/clients.mjs';
import { sendResponse } from '../../../responses/response.mjs';

const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    // API_KEY
    const incomingKey = event.headers?.["x-api-key"];
    if (incomingKey !== process.env.API_KEY) {
      return sendResponse(401, { error: 'Invalid API Key' });
    }

    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return sendResponse(400, { error: 'Email och lösenord krävs' });
    }

    const normalizedEmail = String(email).toLowerCase();
    let result;

    try {
      result = await dynamodb.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normalizedEmail },
        Limit: 1,
      }));
    } catch (err) {
      if (err.name === 'ValidationException' || (err.message && err.message.includes('index'))) {
        result = await dynamodb.send(new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'email = :email AND begins_with(PK, :userPrefix)',
          ExpressionAttributeValues: { ':email': normalizedEmail, ':userPrefix': 'USER#' },
        }));
      } else {
        throw err;
      }
    }

    if (!result.Items || result.Items.length === 0) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    const user = result.Items[0];

    if (!user.passwordHash || typeof user.passwordHash !== 'string' || !/^\$2[aby]\$/.test(user.passwordHash)) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    const token = createToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    return sendResponse(200, {
      message: 'Inloggning lyckades',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return sendResponse(500, { error: 'Serverfel vid inloggning', details: err.message });
  }
};

// Helene edit: added phoneNumber
// Helene edit: added fetchWithApiKey in every api call for extra api protection