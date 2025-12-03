import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/logo.png';
import manIcon from '../../assets/man.png';
import basketIcon from '../../assets/basket.png';
import bellIcon from '../../assets/bell.png';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../interfaces/user';
import { HeaderProps } from '../../interfaces/props';
import NotificationBadge from '../NotificationBadge/NotificationBadge';
import NotificationModal from '../NotificationModal/NotificationModal';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../interfaces/notification';

function Header({ cartItemCount, onCartClick }: HeaderProps) {
	const userString = localStorage.getItem('user');
	// gets the user from localstorage and saves it in userString

	const user: User | null = userString ? JSON.parse(userString) : null;
	// changes the JSON string from localstorage into a User object (parsing it) - or empty (null) if user hasn't been made yet

	const userId = user?.userId ?? '';
	// get userId, or empty if no user is made yet

	const navigate = useNavigate();

	// State för notifikationer
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

	// Hämta notifikationer när komponenten laddas och användaren är inloggad
	useEffect(() => {
		if (userId) {
			fetchNotifications();
			// Uppdatera notifikationer var 30:e sekund
			const interval = setInterval(fetchNotifications, 30000);
			return () => clearInterval(interval);
		}
	}, [userId]);

	const fetchNotifications = async () => {
		if (!userId) return;
		
		try {
			const response = await notificationService.getNotifications(userId);
			if (response.success) {
				setNotifications(response.notifications);
				setUnreadCount(response.unreadCount || 0);
			}
		} catch (error) {
			console.error('Failed to fetch notifications:', error);
		}
	};

	const handleNotificationClick = () => {
		setIsNotificationModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsNotificationModalOpen(false);
	};

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await notificationService.markAsRead(notificationId, userId);
			// Uppdatera lokalt state
			setNotifications(prev => 
				prev.map(notif => 
					notif.notificationId === notificationId 
						? { ...notif, isRead: true }
						: notif
				)
			);
			setUnreadCount(prev => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	return (
		<header className="header">
			<section className="header__logo-section">
				<img
					src={logo}
					alt="Baan Thaikök logo"
					className="header__logo"
					onClick={() => navigate('/')}
					// / = PATH TIL LANDINGPAGE, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ LANDINGPAGE
				/>
			</section>

			<section className="header__options-section">
				<section className="header__icons">
					<figure className="header__icon">
						<img
							src={manIcon}
							alt="Profil ikon"
							onClick={() => navigate(`/profile/${userId}`)}
						/>
						{/* /profile = PATH TIL PROFIL, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ PROFILPAGE */}
					</figure>

					<figure className="header__icon">
						<img
							src={basketIcon}
							alt="Handlekurv ikon"
							onClick={onCartClick}
						/>
						{/* /cart = PATH TIL CARTPAGE, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ PARTPAGE */}
					</figure>

					<figure className="header__icon header__icon--notification">
						<img
							src={bellIcon}
							alt="Varsler ikon"
							onClick={handleNotificationClick}
						/>
						{userId && <NotificationBadge count={unreadCount} />}
					</figure>
				</section>

				{/* Notification Modal */}
				<NotificationModal
					isOpen={isNotificationModalOpen}
					onClose={handleCloseModal}
					notifications={notifications}
					onMarkAsRead={handleMarkAsRead}
				/>

				<section className="header__navigation">
					<nav className="header__nav">
						<ul className="header__nav-list">
							<li
								className="header__nav-item"
								onClick={() => navigate('/')}>
								Hem
							</li>
							<li
								className="header__nav-item"
								onClick={() => navigate('/menu/sushi')}>
								Sushi
							</li>
							<li
								className="header__nav-item"
								onClick={() => navigate('/menu/thai')}>
								Thailändsk mat
							</li>
							<li
								className="header__nav-item"
								onClick={() => navigate('/about')}>
								Om oss
							</li>
							{/* har inte skapad alla pages än, så ändra / path bara när man vet */}
						</ul>
					</nav>
				</section>
			</section>
		</header>
	);
}

export default Header;

// Författare: Helene
// Header komponent

// Eventuell buggfix av: *namn-här:
// Vad blev fixad: *skriv vad som (evt) fixades*
