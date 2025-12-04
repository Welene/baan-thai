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
import type { Notification } from '../../interfaces/notification';
import { API_BASE_URL } from '../../config/api';

function Header({ cartItemCount, onCartClick }: HeaderProps) {
	// Försök först med 'currentUser', sedan 'user' som fallback
	const userString = localStorage.getItem('currentUser') || localStorage.getItem('user');
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
	const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

	// Hämta notifikationer när komponenten laddas och användaren är inloggad
	useEffect(() => {
		if (userId) {
			fetchNotifications();
			// Uppdatera notifikationer var 10:e sekund för att kolla orderstatus
			const interval = setInterval(fetchNotifications, 10000);
			return () => clearInterval(interval);
		}
	}, [userId, dismissedNotifications]);

	const fetchNotifications = async () => {
		if (!userId) return;
		
		try {
			// Hämta användarens orders istället
			const response = await fetch(`${API_BASE_URL}/api/orders/${userId}`);
			
			if (response.ok) {
				const data = await response.json();
				const orders = data.orders || [];
				
				// Skapa notifikationer baserat på orderstatus
				const orderNotifications = orders
					.filter((order: any) => order.status !== 'pending')
					.filter((order: any) => !dismissedNotifications.has(order.orderId))
					.map((order: any) => {
						const statusMessages: Record<string, string> = {
							confirmed: `Din beställning #${order.orderId} har bekräftats!`,
							preparing: `Din beställning #${order.orderId} förbereds i köket`,
							ready: `Din beställning #${order.orderId} är klar för upphämtning!`,
							completed: `Din beställning #${order.orderId} är slutförd`,
							cancelled: `Din beställning #${order.orderId} har avbrutits`
						};
						
						return {
							notificationId: order.orderId,
							orderId: order.orderId,
							message: statusMessages[order.status] || `Order #${order.orderId} - ${order.status}`,
							type: 'order_update',
							isRead: false,
							createdAt: order.updatedAt || order.createdAt
						};
					})
					.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, 10); // Visa max 10 senaste
				
				setNotifications(orderNotifications);
				setUnreadCount(orderNotifications.length);
			}
		} catch (error) {
			console.error('Failed to fetch order notifications:', error);
		}
	};

	const handleNotificationClick = () => {
		setIsNotificationModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsNotificationModalOpen(false);
	};

	const handleMarkAsRead = async (notificationId: string) => {
		// Lägg till i dismissed-listan så den inte kommer tillbaka
		setDismissedNotifications(prev => new Set(prev).add(notificationId));
		
		// Ta bort notifikationen från listan när den klickas
		setNotifications(prev => 
			prev.filter(notif => notif.notificationId !== notificationId)
		);
		setUnreadCount(prev => Math.max(0, prev - 1));
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
							onClick={() => navigate('/profile')}
						/>
						{/* /profile = PATH TIL PROFIL, ENDRE PATH INNI ('/') OM ANNET NAMN PÅ PROFILPAGE */}
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
