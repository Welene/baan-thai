const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
	console.log('deleteUser invoked');
	
	try {
		const userId = event.pathParameters?.userId;
		
		if (!userId) {
			return {
				statusCode: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Credentials': true,
				},
				body: JSON.stringify({ error: 'userId krävs' }),
			};
		}
		
		// Kontrollera att användaren finns
		const getParams = {
			TableName: TABLE_NAME,
			Key: {
				PK: `USER#${userId}`,
				SK: 'PROFILE',
			},
		};
		
		const existingUser = await dynamodb.send(new GetCommand(getParams));
		
		if (!existingUser.Item) {
			return {
				statusCode: 404,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Credentials': true,
				},
				body: JSON.stringify({ error: 'Användare hittades inte' }),
			};
		}
		
		// Ta bort användaren
		const deleteParams = {
			TableName: TABLE_NAME,
			Key: {
				PK: `USER#${userId}`,
				SK: 'PROFILE',
			},
		};
		
		await dynamodb.send(new DeleteCommand(deleteParams));
		
		return {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
			},
			body: JSON.stringify({
				success: true,
				message: 'Användare borttagen',
				userId: userId,
			}),
		};
		
	} catch (error) {
		console.error('Error deleting user:', error);
		return {
			statusCode: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
			},
			body: JSON.stringify({ 
				error: 'Kunde inte ta bort användare',
				details: error.message 
			}),
		};
	}
};

// Create: Sunsanee