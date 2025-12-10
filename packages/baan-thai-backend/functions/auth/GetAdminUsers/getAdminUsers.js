const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
	console.log('getAdminUsers invoked');
	
	try {
		// Hämta role från query parameters (optional filter)
		const role = event.queryStringParameters?.role;
		
		// Bygg scan parameters
		const params = {
			TableName: TABLE_NAME,
			FilterExpression: 'begins_with(PK, :userPrefix) AND SK = :sk',
			ExpressionAttributeValues: {
				':userPrefix': 'USER#',
				':sk': 'PROFILE',
			},
		};
		
		// Om role finns, lägg till filter för det
		if (role) {
			params.FilterExpression += ' AND #role = :role';
			params.ExpressionAttributeNames = {
				'#role': 'role',
			};
			params.ExpressionAttributeValues[':role'] = role;
		}
		
		const result = await dynamodb.send(new ScanCommand(params));
		
		// Ta bort känslig data (passwordHash)
		const users = result.Items.map(user => ({
			userId: user.userId,
			email: user.email,
			name: user.name,
			username: user.username,
			role: user.role,
			address: user.address,
			phoneNumber: user.phoneNumber,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}));
		
		return {
			statusCode: 200,
			body: JSON.stringify({
				users,
				count: users.length,
			}),
		};
	} catch (error) {
		console.error('Error fetching users:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: 'Kunde inte hämta användare',
				details: error.message,
			}),
		};
	}
};

// Create: Sunsanee