import { API_BASE_URL } from '../config/api';

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

export async function updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; user: User }> {
	const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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

export async function getAllUsers(): Promise<{ success: boolean; users: User[] }> {
	const response = await fetch(`${API_BASE_URL}/api/users`);

	if (!response.ok) {
		throw new Error('Kunde inte hämta användare');
	}

	return response.json();
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
	const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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
