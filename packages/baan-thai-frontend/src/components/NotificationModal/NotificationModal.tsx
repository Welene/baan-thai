import './NotificationModal.css';
import { Notification } from '../../interfaces/notification';

interface NotificationModalProps {
	isOpen: boolean;
	onClose: () => void;
	notifications: Notification[];
	onMarkAsRead: (notificationId: string) => void;
}

function NotificationModal({ 
	isOpen, 
	onClose, 
	notifications,
	onMarkAsRead 
}: NotificationModalProps) {
	if (!isOpen) {
		return null;
	}

	const getNotificationIcon = (type: Notification['type']) => {
		switch (type) {
			case 'order_confirmed':
				return '✓';
			case 'order_preparing':
				return '🍳';
			case 'order_ready':
				return '✨';
			case 'order_delivered':
				return '🎉';
			default:
				return '📢';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

		if (diffInMinutes < 1) return 'Just nu';
		if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} tim sedan`;
		return date.toLocaleDateString('sv-SE', { 
			day: 'numeric', 
			month: 'short', 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	};

	return (
		<div className="notification-modal-overlay" onClick={onClose}>
			<div className="notification-modal" onClick={(e) => e.stopPropagation()}>
				<div className="notification-modal__header">
					<h2>Notifikationer</h2>
					<button 
						className="notification-modal__close" 
						onClick={onClose}
						aria-label="Stäng"
					>
						×
					</button>
				</div>

				<div className="notification-modal__content">
					{notifications.length === 0 ? (
						<div className="notification-modal__empty">
							<p>Inga notifikationer ännu</p>
						</div>
					) : (
						<ul className="notification-modal__list">
							{notifications.map((notification) => (
								<li 
									key={notification.notificationId}
									className={`notification-modal__item ${
										notification.isRead ? 'notification-modal__item--read' : ''
									}`}
									onClick={() => !notification.isRead && onMarkAsRead(notification.notificationId)}
								>
									<div className="notification-modal__icon">
										{getNotificationIcon(notification.type)}
									</div>
									<div className="notification-modal__body">
										<p className="notification-modal__message">
											{notification.message}
										</p>
										<span className="notification-modal__time">
											{formatDate(notification.createdAt)}
										</span>
									</div>
									{!notification.isRead && (
										<div className="notification-modal__unread-indicator" />
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

export default NotificationModal;
