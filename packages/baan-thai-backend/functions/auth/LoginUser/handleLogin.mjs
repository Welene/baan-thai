import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { compare } from '../../../utils/password.mjs';
import { createToken } from '../../../utils/auth.mjs';
import { docClient } from '../../../services/clients.mjs';

// Setup DynamoDB client
const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
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
    // parsa input från event body
    const body = JSON.parse(event.body);
    const email = body.email;
    const password = body.password;

    // Validera input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email och lösenord krävs' })
      };
    }

    // sök efter användare i databasen via email (Query mot EmailIndex rekommenderas)
    const normalizedEmail = String(email).toLowerCase();
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': normalizedEmail
      },
      Limit: 1
    };

    let result;
    try {
      result = await dynamodb.send(new QueryCommand(params));
    } catch (err) {
      // fallback to Scan if EmailIndex doesn't exist
      if (err.name === 'ValidationException' || (err.message && err.message.includes('index'))) {
        const scanParams = {
          TableName: TABLE_NAME,
          FilterExpression: 'email = :email AND begins_with(PK, :userPrefix)',
          ExpressionAttributeValues: {
            ':email': normalizedEmail,
            ':userPrefix': 'USER#'
          }
        };
        result = await dynamodb.send(new ScanCommand(scanParams));
      } else {
        throw err;
      }
    }

    // kolla om användaren finns
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Felaktig email eller lösenord' })
      };
    }

    const user = result.Items[0];
    
    // Om passwordHash saknas, returnera 401 istället för att låta bcrypt jämföra med undefined
    if (!user.passwordHash) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Felaktig email eller lösenord' })
      };
    }

    // jämför lösenord med hashat lösenord i databasen
    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Felaktig email eller lösenord' })
      };
    }

    // Generera JWT token
    const token = createToken({
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    // returnera success med token och användarinfo
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Inloggning lyckades',
        token: token,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          phoneNumber: user.phoneNumber
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Serverfel vid inloggning' })
    };
  }
};

// Helene edit: added phoneNumber