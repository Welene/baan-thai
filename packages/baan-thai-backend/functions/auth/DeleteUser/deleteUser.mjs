import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../../services/clients.mjs';

const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
	console.log('deleteUser invoked');

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
