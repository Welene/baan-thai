import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { hash } from '../../../utils/password.mjs';
import { docClient } from '../../../services/clients.mjs';

const dynamodb = docClient;
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
	console.log('updateUser invoked');
	
	try {
		const userId = event.pathParameters?.userId;
		
		if (!userId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'userId krävs' }),
			};
		}
		
		// Parse request body
		const body = JSON.parse(event.body);
		const { name, username, email, address, phoneNumber, role, password } = body;
		
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
				body: JSON.stringify({ error: 'Användare hittades inte' }),
			};
		}
		
		// Bygg update expression dynamiskt
		let updateExpression = 'SET updatedAt = :updatedAt';
		const expressionAttributeValues = {
			':updatedAt': new Date().toISOString(),
		};
		const expressionAttributeNames = {};
		
		if (name !== undefined) {
			updateExpression += ', #name = :name';
			expressionAttributeNames['#name'] = 'name';
			expressionAttributeValues[':name'] = name;
		}
		
		if (username !== undefined) {
			updateExpression += ', username = :username';
			expressionAttributeValues[':username'] = username;
		}
		
		if (email !== undefined) {
			updateExpression += ', email = :email';
			expressionAttributeValues[':email'] = email.toLowerCase();
		}
		
		if (address !== undefined) {
			updateExpression += ', address = :address';
			expressionAttributeValues[':address'] = address;
		}
		
		if (phoneNumber !== undefined) {
			updateExpression += ', phoneNumber = :phoneNumber';
			expressionAttributeValues[':phoneNumber'] = phoneNumber;
		}
		
		if (role !== undefined) {
			updateExpression += ', #role = :role';
			expressionAttributeNames['#role'] = 'role';
			expressionAttributeValues[':role'] = role;
		}
		
		// Om nytt lösenord, hasha det
		if (password) {
			const passwordHash = await hash(password);
			updateExpression += ', passwordHash = :passwordHash';
			expressionAttributeValues[':passwordHash'] = passwordHash;
		}
		
		// Uppdatera användaren
		const updateParams = {
			TableName: TABLE_NAME,
			Key: {
				PK: `USER#${userId}`,
				SK: 'PROFILE',
			},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ReturnValues: 'ALL_NEW',
		};
		
		if (Object.keys(expressionAttributeNames).length > 0) {
			updateParams.ExpressionAttributeNames = expressionAttributeNames;
		}
		
		const result = await dynamodb.send(new UpdateCommand(updateParams));
		
		// Ta bort passwordHash från response
		const { passwordHash: _, ...userData } = result.Attributes;
		
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Användare uppdaterad',
				user: userData,
			}),
		};
	} catch (error) {
		console.error('Error updating user:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: 'Kunde inte uppdatera användare',
				details: error.message,
			}),
		};
	}
};

// Create: Sunsanee
