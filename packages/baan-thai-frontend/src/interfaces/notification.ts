export interface Notification {
	notificationId: string;
	userId: string;
	orderId: string;
	message: string;
	type: 'order_confirmed' | 'order_preparing' | 'order_ready' | 'order_delivered';
	isRead: boolean;
	createdAt: string;
}

export interface NotificationResponse {
	success: boolean;
	notifications: Notification[];
	unreadCount?: number;
}
