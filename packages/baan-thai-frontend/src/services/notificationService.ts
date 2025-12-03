import { API_BASE_URL } from '../config/api';
import type { NotificationResponse } from '../interfaces/notification';

export const notificationService = {
	// Hämta alla notifikationer för en användare
	async getNotifications(userId: string): Promise<NotificationResponse> {
		const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error('Failed to fetch notifications');
		}

		return response.json();
	},

	// Markera en notifikation som läst
	async markAsRead(notificationId: string, userId: string): Promise<{ success: boolean }> {
		const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		});

		if (!response.ok) {
			throw new Error('Failed to mark notification as read');
		}

		return response.json();
	},

	// Markera alla notifikationer som lästa
	async markAllAsRead(userId: string): Promise<{ success: boolean }> {
		const response = await fetch(`${API_BASE_URL}/notifications/${userId}/read-all`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error('Failed to mark all notifications as read');
		}

		return response.json();
	},
};
