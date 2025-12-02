const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
	DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand, } = require('@aws-sdk/lib-dynamodb');
const { hash } = require('../../../utils/password');
const { createToken } = require('../../../utils/auth');
const crypto = require('crypto');

// Generate UUID using native crypto
const generateUUID = () => crypto.randomUUID();

// Setup DynamoDB client
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
	console.log('handleRegister invoked');
	try {
		// parsa input från event body
		const body = JSON.parse(event.body);
		const email = body.email;
		const password = body.password;
		const name = body.name;
		const username = body.username;
		const role = body.role || 'customer'; // default role är customer
		const address = body.address || null;
		const phoneNumber = body.phoneNumber || null;

		// Validera input
		if (!email || !password || !name || !username) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: 'Email, lösenord, namn och användarnamn krävs',
				}),
			};
		}

		// kontrollera om email redan finns (Query mot EmailIndex)
		const normalizedEmail = String(email).toLowerCase();
		const checkEmailParams = {
			TableName: TABLE_NAME,
			IndexName: 'EmailIndex',
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: { ':email': normalizedEmail },
			Limit: 1,
		};

		let existingUser;
		try {
			existingUser = await dynamodb.send(
				new QueryCommand(checkEmailParams)
			);
		} catch (err) {
			// If EmailIndex doesn't exist or Query fails, fallback to Scan (less efficient)
			if (
				err.name === 'ValidationException' ||
				(err.message && err.message.includes('index'))
			) {
				const scanParams = {
					TableName: TABLE_NAME,
					FilterExpression:
						'email = :email AND begins_with(PK, :userPrefix)',
					ExpressionAttributeValues: {
						':email': normalizedEmail,
						':userPrefix': 'USER#',
					},
				};
				existingUser = await dynamodb.send(new ScanCommand(scanParams));
			} else {
				throw err;
			}
		}

		if (existingUser.Items && existingUser.Items.length > 0) {
			return {
				statusCode: 409,
				body: JSON.stringify({
					error: 'Email finns redan registrerad',
				}),
			};
		}

		// generera userId (8 tecken hex)
		const userId = generateUUID().replace(/-/g, '').slice(0, 8);

		// hasha lösenordet
		const passwordHash = await hash(password);

		// skapa timestamp
		const timestamp = new Date().toISOString();

		// skapa ny användare i databasen
		const newUser = {
			PK: `USER#${userId}`,
			SK: 'PROFILE',
			userId: userId,
			email: normalizedEmail,
			passwordHash: passwordHash,
			name: name,
			username: username,
			address,
			phoneNumber,
			role: role,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		await dynamodb.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: newUser,
			})
		);

		// Generera JWT token för den nya användaren
		const token = createToken({
			userId: userId,
			email: email,
			role: role,
		});

		// returnera success med token och användarinfo
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: 'Registrering lyckades',
				token: token,
				user: {
					userId: userId,
					email: email,
					name: name,
					username: username,
					role: role,
				},
			}),
		};
	} catch (error) {
		console.error('Registration error:', error);
		console.error('Error stack:', error.stack);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: 'Serverfel vid registrering',
				details: error.message,
			}),
		};
	}
};

// added phoneNumber & address edit: Helene
// since we have that in our inputfields on the page
