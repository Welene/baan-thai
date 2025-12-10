import { useState, useEffect } from 'react';
import './AdminUserPage.css';
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar';
import { getAllUsers, updateUser, deleteUser } from '../../../services/userService';

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

interface EditFormData {
	name: string;
	username: string;
	email: string;
	role: string;
	address: string;
	phoneNumber: string;
	password: string;
}

export const AdminUserPage = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<EditFormData>({
		name: '',
		username: '',
		email: '',
		role: 'customer',
		address: '',
		phoneNumber: '',
		password: ''
	});

	// Hämta alla användare när komponenten laddas
	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		setError(null);
		
		try {
			const data = await getAllUsers();
			console.log('Fetched all users:', data);
			setUsers(data.users || []);
		} catch (err) {
			console.error('Error fetching users:', err);
			setError(err instanceof Error ? err.message : 'Ett fel uppstod');
		} finally {
			setLoading(false);
		}
	};

	const handleSelectUser = (user: User) => {
		const isCurrentlySelected = selectedUser?.userId === user.userId;
		
		if (isCurrentlySelected && !isEditing) {
			setSelectedUser(null);
		} else if (!isCurrentlySelected) {
			setSelectedUser(user);
			setIsEditing(false);
			setFormData({
				name: user.name || '',
				username: user.username || '',
				email: user.email || '',
				role: user.role || 'customer',
				address: user.address || '',
				phoneNumber: user.phoneNumber || '',
				password: ''
			});
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setSelectedUser(null);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!selectedUser) return;

		try {
			setLoading(true);
			
			const updateData: any = {
				name: formData.name,
				username: formData.username,
				email: formData.email,
				role: formData.role,
				address: formData.address,
				phoneNumber: formData.phoneNumber
			};

			if (formData.password) {
				updateData.password = formData.password;
			}

			await updateUser(selectedUser.userId, updateData);
			
			alert('Användare uppdaterad!');
			setIsEditing(false);
			setSelectedUser(null);
			await fetchUsers();
		} catch (err) {
			console.error('Error updating user:', err);
			alert('Kunde inte uppdatera användare: ' + (err instanceof Error ? err.message : 'Ett fel uppstod'));
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedUser) return;

		const confirmDelete = window.confirm(
			`Är du säker på att du vill ta bort användaren "${selectedUser.name}"? Detta går inte att ångra.`
		);

		if (!confirmDelete) return;

		try {
			setLoading(true);
			await deleteUser(selectedUser.userId);
			
			alert('Användare borttagen!');
			setSelectedUser(null);
			setIsEditing(false);
			await fetchUsers();
		} catch (err) {
			console.error('Error deleting user:', err);
			alert('Kunde inte ta bort användare: ' + (err instanceof Error ? err.message : 'Ett fel uppstod'));
		} finally {
			setLoading(false);
		}
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
						<button onClick={fetchUsers} className="refresh-button">
							🔄 Uppdatera
						</button>
					</div>

					{loading && (
						<div className="loading-message">
							<p>Laddar användare...</p>
						</div>
					)}

					{error && (
						<div className="error-message">
							<p>⚠️ {error}</p>
							<button onClick={fetchUsers} className="retry-button">
								Försök igen
							</button>
						</div>
					)}

					{!loading && !error && users.length === 0 && (
						<div className="no-data-message">
							<p>Inga användare hittades.</p>
						</div>
					)}

					{!loading && !error && users.length > 0 && (
						<div className="admin-users-grid">
							{users.map((user) => (
								<div 
									key={user.userId} 
									className={`admin-user-card ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
									onClick={() => handleSelectUser(user)}
									style={{ cursor: 'pointer' }}>
									<div className="user-card-header">
										<h3>{user.name}</h3>
										<span className={`user-role-badge ${user.role === 'admin' ? 'badge-admin' : 'badge-customer'}`}>
											{user.role === 'admin' ? 'Admin' : 'Kund'}
										</span>
									</div>
									
									<div className="user-card-body">
										<div className="user-info-row">
											<span className="info-label">@{user.username}</span>
										</div>
										
										<div className="user-info-row">
											<span className="info-value">{user.email}</span>
										</div>
									</div>

									{selectedUser?.userId === user.userId && (
										<div className="user-card-expanded" onClick={(e) => e.stopPropagation()}>
											<div className="user-details">
												<h4>Detaljer</h4>
												<div className="detail-row">
													<span className="detail-label">User ID:</span>
													<span className="detail-value">{user.userId}</span>
												</div>
												<div className="detail-row">
													<span className="detail-label">Telefon:</span>
													<span className="detail-value">{user.phoneNumber || 'Ej angivet'}</span>
												</div>
												<div className="detail-row">
													<span className="detail-label">Adress:</span>
													<span className="detail-value">{user.address || 'Ej angivet'}</span>
												</div>
												<div className="detail-row">
													<span className="detail-label">Skapad:</span>
													<span className="detail-value">{formatDate(user.createdAt)}</span>
												</div>
												<div className="detail-row">
													<span className="detail-label">Uppdaterad:</span>
													<span className="detail-value">{formatDate(user.updatedAt)}</span>
												</div>
											</div>

											{!isEditing ? (
												<div className="action-buttons">
													<button 
														onClick={(e) => {
															e.stopPropagation();
															handleEdit();
														}}
														className="btn-edit">
														✏️ Redigera
													</button>
													<button 
														onClick={(e) => {
															e.stopPropagation();
															handleDelete();
														}}
														className="btn-delete">
														🗑️ Ta bort
													</button>
												</div>
											) : (
												<div className="edit-form">
													<h4>Redigera användare</h4>
													<form onSubmit={handleSubmit}>
														<div className="form-grid">
															<div className="form-group">
																<label htmlFor="name">Namn *</label>
																<input
																	type="text"
																	id="name"
																	name="name"
																	value={formData.name}
																	onChange={handleInputChange}
																	required
																/>
															</div>

															<div className="form-group">
																<label htmlFor="username">Användarnamn *</label>
																<input
																	type="text"
																	id="username"
																	name="username"
																	value={formData.username}
																	onChange={handleInputChange}
																	required
																/>
															</div>

															<div className="form-group">
																<label htmlFor="email">Email *</label>
																<input
																	type="email"
																	id="email"
																	name="email"
																	value={formData.email}
																	onChange={handleInputChange}
																	required
																/>
															</div>

															<div className="form-group">
																<label htmlFor="role">Roll *</label>
																<select
																	id="role"
																	name="role"
																	value={formData.role}
																	onChange={handleInputChange}
																	required>
																	<option value="admin">Admin</option>
																	<option value="customer">Kund</option>
																</select>
															</div>

															<div className="form-group">
																<label htmlFor="phoneNumber">Telefon</label>
																<input
																	type="tel"
																	id="phoneNumber"
																	name="phoneNumber"
																	value={formData.phoneNumber}
																	onChange={handleInputChange}
																/>
															</div>

															<div className="form-group">
																<label htmlFor="address">Adress</label>
																<input
																	type="text"
																	id="address"
																	name="address"
																	value={formData.address}
																	onChange={handleInputChange}
																/>
															</div>

															<div className="form-group form-group-full">
																<label htmlFor="password">
																	Nytt lösenord (lämna tomt för att behålla)
																</label>
																<input
																	type="password"
																	id="password"
																	name="password"
																	value={formData.password}
																	onChange={handleInputChange}
																	placeholder="Minst 6 tecken"
																/>
															</div>
														</div>

														<div className="action-buttons-right">
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	handleCancel();
																}}
																className="btn-cancel">
																Avbryt
															</button>
															<button 
																type="submit" 
																className="btn-save"
																disabled={loading}>
																{loading ? 'Sparar...' : 'Spara ändringar'}
															</button>
														</div>
													</form>
												</div>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
};
