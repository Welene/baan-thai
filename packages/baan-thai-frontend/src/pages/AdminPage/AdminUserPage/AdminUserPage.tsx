import { useState, useEffect } from 'react';
import './AdminUserPage.css';
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar';
import { API_BASE_URL } from '../../../config/api';

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

export const AdminUserPage = () => {
	const [adminUsers, setAdminUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	// Hämta alla admin-användare när komponenten laddas
	useEffect(() => {
		fetchAdminUsers();
	}, []);

	const fetchAdminUsers = async () => {
		setLoading(true);
		setError(null);
		
		try {
			// Använd query parameter för att filtrera på admin-roll
			const response = await fetch(`${API_BASE_URL}/api/users?role=admin`);
			
			if (!response.ok) {
				throw new Error('Kunde inte hämta admin-användare');
			}
			
			const data = await response.json();
			console.log('Fetched admin users:', data);
			
			setAdminUsers(data.users || []);
		} catch (err) {
			console.error('Error fetching admin users:', err);
			setError(err instanceof Error ? err.message : 'Ett fel uppstod');
		} finally {
			setLoading(false);
		}
	};

	const handleSelectUser = (user: User) => {
		setSelectedUser(selectedUser?.userId === user.userId ? null : user);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<>
			<AdminNavBar />
			<div className="admin-user-page">
				<div className="admin-user-container">
					<div className="page-header">
						<h1>Admin-användare</h1>
						<button onClick={fetchAdminUsers} className="refresh-button">
							🔄 Uppdatera
						</button>
					</div>

					{loading && (
						<div className="loading-message">
							<p>Laddar admin-användare...</p>
						</div>
					)}

					{error && (
						<div className="error-message">
							<p>⚠️ {error}</p>
							<button onClick={fetchAdminUsers} className="retry-button">
								Försök igen
							</button>
						</div>
					)}

					{!loading && !error && adminUsers.length === 0 && (
						<div className="no-data-message">
							<p>Inga admin-användare hittades.</p>
						</div>
					)}

					{!loading && !error && adminUsers.length > 0 && (
						<>
							<div className="admin-stats">
								<div className="stat-card">
									<span className="stat-number">{adminUsers.length}</span>
									<span className="stat-label">Totalt antal admins</span>
								</div>
							</div>

							<div className="admin-users-grid">
								{adminUsers.map((user) => (
									<div
										key={user.userId}
										className={`admin-user-card ${
											selectedUser?.userId === user.userId ? 'selected' : ''
										}`}
										onClick={() => handleSelectUser(user)}>
										<div className="user-card-header">
											<h3>{user.name}</h3>
											<span className="user-role-badge">Admin</span>
										</div>
										
										<div className="user-card-body">
											<div className="user-info-row">
												<span className="info-label">👤 Användarnamn:</span>
												<span className="info-value">{user.username}</span>
											</div>
											
											<div className="user-info-row">
												<span className="info-label">📧 Email:</span>
												<span className="info-value">{user.email}</span>
											</div>
											
											{user.phoneNumber && (
												<div className="user-info-row">
													<span className="info-label">📱 Telefon:</span>
													<span className="info-value">{user.phoneNumber}</span>
												</div>
											)}
											
											{user.address && (
												<div className="user-info-row">
													<span className="info-label">📍 Adress:</span>
													<span className="info-value">{user.address}</span>
												</div>
											)}
										</div>

										{selectedUser?.userId === user.userId && (
											<div className="user-card-details">
												<div className="detail-section">
													<h4>Detaljer</h4>
													<div className="detail-item">
														<span className="detail-label">User ID:</span>
														<span className="detail-value">{user.userId}</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Skapad:</span>
														<span className="detail-value">
															{formatDate(user.createdAt)}
														</span>
													</div>
													<div className="detail-item">
														<span className="detail-label">Uppdaterad:</span>
														<span className="detail-value">
															{formatDate(user.updatedAt)}
														</span>
													</div>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};
