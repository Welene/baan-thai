import './NotificationBadge.css';

interface NotificationBadgeProps {
	count: number;
}

function NotificationBadge({ count }: NotificationBadgeProps) {
	if (count === 0) {
		return null;
	}

	return (
		<span className="notification-badge">
			{count > 9 ? '9+' : count}
		</span>
	);
}

export default NotificationBadge;

/* Författare: Tim */
/* Visar notifikations-badge med antal olästa notiser */
