const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { compare } = require('../utils/password');
const { createToken } = require('../utils/auth');

// Setup DynamoDB client
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
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
          role: user.role
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
