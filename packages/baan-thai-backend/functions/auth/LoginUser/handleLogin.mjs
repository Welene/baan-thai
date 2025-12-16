import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { compare } from '../../../utils/password.mjs';
import { createToken } from '../../../utils/auth.mjs';
import { docClient } from '../../../services/clients.mjs';
import { sendResponse } from '../../../responses/response.mjs';

const dynamodb = docClient;

const TABLE_NAME = process.env.TABLE_NAME;

// Huvudhandler för inloggning
export const handler = async (event) => {
  try {
    // API_KEY START ----------------------------------------------
    // Kräver att anrop från frontend skickar en giltig API-nyckel
    // i headern `x-api-key`. Detta kontrolleras här innan vi går vidare.
    const incomingKey = event.headers?.["x-api-key"];
    if (incomingKey !== process.env.API_KEY) {
      return sendResponse(401, { error: 'Invalid API Key' });
    }
    // API_KEY END ------------------------------------------------

    // Parsar request body (förväntas JSON med `email` och `password`).
    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;

    // inputvalidering både email och lösenord krävs.
    if (!email || !password) {
      return sendResponse(400, { error: 'Email och lösenord krävs' });
    }

    // Normalisera email för att undvika skillnader i stora/små bokstäver.
    const normalizedEmail = String(email).toLowerCase();
    let result;

    // Försök Query mot en EmailIndex.
    // Om index saknas fångar vi ValidationException och fallbackar till Scan.
    try {
      result = await dynamodb.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normalizedEmail },
        Limit: 1,
      }));
    } catch (err) {
      // Om EmailIndex inte finns, använd en Scan med filter som letar efter
      // poster med PK som börjar med `USER#` och matchande email.
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

    // Om inga användare hittades: felaktig email eller lösenord.
    if (!result.Items || result.Items.length === 0) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    const user = result.Items[0];

    // Säkerhetskontroll: se till att passwordHash finns och ser ut som en bcrypt-hash
    if (!user.passwordHash || typeof user.passwordHash !== 'string' || !/^\$2[aby]\$/.test(user.passwordHash)) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    // Jämför det inkommande lösenordet med den hashade versionen i DB.
    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return sendResponse(401, { error: 'Felaktig email eller lösenord' });
    }

    // Skapa en JWT-token för klienten att använda i framtida requests.
    const token = createToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    // Returnera inloggning lyckades med token och relevant användarinfo (utan passwordHash).
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
    // Logga och returnera serverfel.
    console.error('Login error:', err);
    return sendResponse(500, { error: 'Serverfel vid inloggning', details: err.message });
  }
};
// author: Tim 
// sköter inloggnings-processen för användare */

// Helene edit: added phoneNumber
// Helene edit: added incoming API_KEY and expected API_KEY for extra api protection

//Tim edit: Refaktorerade sendResponse, samlad validering, svar, oförändrat inloggningsflöde.