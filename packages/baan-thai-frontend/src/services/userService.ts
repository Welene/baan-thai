import { API_BASE_URL } from '../config/api';
import { fetchWithApiKey } from '../api/fetchWithApiKey';

interface UpdateUserData {
	name?: string;
	username?: string;
	email?: string;
	role?: string;
	address?: string;
	phoneNumber?: string;
	password?: string;
}

interface User {
	userId: string;
	name: string;
	username: string;
	email: string;
	role: string;
	address?: string;
	phoneNumber?: string;
	createdAt?: string;
	updatedAt?: string;
}


// ---------------------------------------- START OF FETCH 1 --------------------------------------------
export async function updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; user: User }> {
	const response = await fetchWithApiKey(`${API_BASE_URL}/api/users/${userId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(updateData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Kunde inte uppdatera användare');
	}

	return response.json();
}
// ---------------------------------------- END OF FETCH 1 --------------------------------------------


// ---------------------------------------- START OF FETCH 2 --------------------------------------------
export async function getAllUsers(): Promise<{ success: boolean; users: User[] }> {
	const response = await fetchWithApiKey(`${API_BASE_URL}/api/users`);

	if (!response.ok) {
		throw new Error('Kunde inte hämta användare');
	}

	return response.json();
}

// ---------------------------------------- END OF FETCH 2 --------------------------------------------


// ---------------------------------------- START OF FETCH 3 --------------------------------------------
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
	const response = await fetchWithApiKey(`${API_BASE_URL}/api/users/${userId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Kunde inte ta bort användare');
	}

	return response.json();
}

// ---------------------------------------- END OF FETCH 3 --------------------------------------------


// Helene edit: changed fetch to fetchWithApiKey