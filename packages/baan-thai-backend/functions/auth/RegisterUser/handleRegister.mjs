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
    // API_KEY START ----------------------------------------------
    // Läs `x-api-key` från headers. Vi stödjer flera varianter för lokala tester.
    const incomingKey = event.headers?.["x-api-key"] || event.headers?.["X-API-Key"] || event.headers?.["X-Api-Key"];
    if (incomingKey !== process.env.API_KEY) {
      return sendResponse(401, { error: 'Invalid API Key' });
    }
    // API_KEY END ------------------------------------------------

    // Parsar JSON-body från request
    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;
    const name = body.name;
    const username = body.username;
    const role = body.role || 'customer';

    // Skydd mot obehörig admin-registrering via en separat secret
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-123';
    if (role === 'admin' && body.adminSecret !== ADMIN_SECRET) {
      return sendResponse(403, { error: 'Obehörig admin-registrering' });
    }

    const address = body.address || null;
    const phoneNumber = body.phoneNumber || null;

    // Enkel inputvalidering
    if (!email || !password || !name || !username) {
      return sendResponse(400, { error: 'Email, lösenord, namn och användarnamn krävs' });
    }

    // Normalisera email för att göra sökningen case-insensitiv
    const normalizedEmail = String(email).toLowerCase();
    let existingUser;

    // Försök Query mot EmailIndex. Om index saknas fallbacka till Scan.
    try {
      existingUser = await dynamodb.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normalizedEmail },
        Limit: 1,
      }));
    } catch (err) {
      // Om EmailIndex inte finns, använd en Scan med filter som begränsar till användar-PK
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

    // Om en användare med samma email finns, returnera konflikt
    if (existingUser.Items && existingUser.Items.length > 0) {
      return sendResponse(409, { error: 'Email finns redan registrerad' });
    }

    // Generera ett kort userId (8 tecken)
    const userId = generateUUID().replace(/-/g, '').slice(0, 8);

    // Hasha lösenordet 
    const passwordHash = await hash(password);

    // Skapa timestamp
    const timestamp = new Date().toISOString();

    // Bygg användarobjekt
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

    // Skriv den nya användaren till databasen
    await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: newUser }));

    // Generera en JWT-token för användaren
    const token = createToken({ userId, email, role });

    // Returnera registrering lyckades med token och användarinfo
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
// Helene edit: added incoming API_KEY and expected API_KEY for extra api protection

// Tim edit: Refaktorerad till sendResponse, förenklad felhantering, renare struktur, ingen ändrad funktionalitet.