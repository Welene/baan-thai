import { useState, useEffect } from 'react';
import './EditUserPage.css';
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

export const EditUserPage = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
	const [formData, setFormData] = useState<User>({
		userId: '',
		name: '',
		username: '',
		email: '',
		role: 'customer',
		address: '',
		phoneNumber: ''
	});
	const [newPassword, setNewPassword] = useState('');

	// Ladda alla användare när komponenten monteras
	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			const data = await getAllUsers();
			const allUsers = data.users || [];
			setUsers(allUsers);
		} catch (error) {
			console.error('Error loading users:', error);
			setStatusMessage({ type: 'error', text: 'Kunde inte hämta användare' });
			setTimeout(() => setStatusMessage(null), 5000);
		}
	};

	const handleSelectUser = (user: User) => {
		console.log('handleSelectUser called with:', user);
		setSelectedUser(user);
		setFormData(user);
		setNewPassword('');
		console.log('selectedUser set to:', user);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedUser) return;

		try {
			const updateData: any = {
				name: formData.name,
				username: formData.username,
				email: formData.email,
				role: formData.role,
				address: formData.address,
				phoneNumber: formData.phoneNumber
			};

			if (newPassword) {
				updateData.password = newPassword;
			}

			await updateUser(selectedUser.userId, updateData);
			setStatusMessage({ type: 'success', text: 'Användare uppdaterad!' });
			await loadUsers();
			
			// Auto-hide efter 3 sekunder
			setTimeout(() => {
				setStatusMessage(null);
				setSelectedUser(null);
				setNewPassword('');
			}, 3000);
		} catch (error: any) {
			console.error('Error updating user:', error);
			setStatusMessage({ 
				type: 'error', 
				text: `Fel: ${error.message || 'Kunde inte uppdatera användare'}`
			});
			setTimeout(() => setStatusMessage(null), 5000);
		}
	};

	const handleCancel = () => {
		setSelectedUser(null);
		setNewPassword('');
	};

	const handleDelete = async () => {
		if (!selectedUser) return;

		const confirmDelete = window.confirm(
			`Är du säker på att du vill ta bort användaren "${selectedUser.name}"? Detta går inte att ångra.`
		);

		if (!confirmDelete) return;

		try {
			await deleteUser(selectedUser.userId);
			setStatusMessage({ type: 'success', text: 'Användare borttagen!' });
			await loadUsers();
			
			// Auto-hide efter 3 sekunder
			setTimeout(() => {
				setStatusMessage(null);
				setSelectedUser(null);
			}, 3000);
		} catch (error: any) {
			console.error('Error deleting user:', error);
			setStatusMessage({ 
				type: 'error', 
				text: `Fel: ${error.message || 'Kunde inte ta bort användare'}`
			});
			setTimeout(() => setStatusMessage(null), 5000);
		}
	};

	// Filtrera användare baserat på sökning
	const filteredUsers = users.filter(user => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			user.name.toLowerCase().includes(query) ||
			user.username.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query)
		);
	});

	return (
		<>
			<AdminNavBar />
			<div className="edit-user-page">
				<div className="edit-user-container">
					<h1>Användare</h1>

					{/* Statusmeddelande */}
					{statusMessage && (
						<div className={`status-message status-${statusMessage.type}`}>
							<p>{statusMessage.text}</p>
						</div>
					)}

					{/* Sökfält */}
					<div className="search-section">
						<div className="search-bar">
							<input
								type="text"
								placeholder="Sök användare (namn, användarnamn, email)..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery && (
								<button
									type="button"
									className="clear-search-button"
									onClick={() => setSearchQuery('')}
								>
									Rensa
								</button>
							)}
						</div>
						{searchQuery && (
							<p className="search-results-text">
								Visar {filteredUsers.length} av {users.length} användare
							</p>
						)}
					</div>

					{/* Användarlista */}
					<div className="user-results">
						<div className="user-list">
							{filteredUsers.length === 0 ? (
								<div className="no-results">
									<p>Inga användare hittades{searchQuery ? ' för din sökning' : ''}.</p>
								</div>
							) : (
								filteredUsers.map((user) => (
								<div
									key={user.userId}
									className={`user-card ${selectedUser?.userId === user.userId ? 'expanded' : ''}`}
									onClick={() => !selectedUser && handleSelectUser(user)}>
									
									{/* Kort header - alltid synlig */}
									<div className="user-card-header">
										<div className="user-basic-info">
											<span className="user-name">{user.name}</span>
											<span className={`user-role ${user.role}`}>
												{user.role === 'admin' ? 'Admin' : 'Kund'}
											</span>
										</div>
										<span className="user-username">@{user.username}</span>
										<span className="user-email">{user.email}</span>
									</div>

									{/* Expanderad sektion med redigeringsformulär */}
									{selectedUser?.userId === user.userId && (
										<div className="user-card-expanded" onClick={(e) => e.stopPropagation()}>
											<div className="detaljer-section">
												<h4>Detaljer</h4>
												<div className="detail-item">
													<span className="detail-label">User ID:</span>
													<span className="detail-value">{user.userId}</span>
												</div>
												{user.phoneNumber && (
													<div className="detail-item">
														<span className="detail-label">Telefon:</span>
														<span className="detail-value">{user.phoneNumber}</span>
													</div>
												)}
												{user.address && (
													<div className="detail-item">
														<span className="detail-label">Adress:</span>
														<span className="detail-value">{user.address}</span>
													</div>
												)}
												<div className="detail-item">
													<span className="detail-label">Skapad:</span>
													<span className="detail-value">
														{user.createdAt ? new Date(user.createdAt).toLocaleString('sv-SE', {
															year: 'numeric',
															month: 'short',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														}) : '-'}
													</span>
												</div>
												<div className="detail-item">
													<span className="detail-label">Uppdaterad:</span>
													<span className="detail-value">
														{user.updatedAt ? new Date(user.updatedAt).toLocaleString('sv-SE', {
															year: 'numeric',
															month: 'short',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														}) : '-'}
													</span>
												</div>
											</div>

											<form onSubmit={handleSubmit} className="edit-form" onClick={(e) => e.stopPropagation()}>
												<h4>Redigera användare</h4>
												
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
															onClick={(e) => e.stopPropagation()}
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
															onClick={(e) => e.stopPropagation()}
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
															onClick={(e) => e.stopPropagation()}
														/>
													</div>

													<div className="form-group">
														<label htmlFor="role">Roll *</label>
														<select
															id="role"
															name="role"
															value={formData.role}
															onChange={handleInputChange}
															required
															onClick={(e) => e.stopPropagation()}>
															<option value="customer">Kund</option>
															<option value="admin">Admin</option>
														</select>
													</div>

													<div className="form-group">
														<label htmlFor="phoneNumber">Telefonnummer</label>
														<input
															type="tel"
															id="phoneNumber"
															name="phoneNumber"
															value={formData.phoneNumber || ''}
															onChange={handleInputChange}
															onClick={(e) => e.stopPropagation()}
														/>
													</div>

													<div className="form-group">
														<label htmlFor="address">Adress</label>
														<input
															type="text"
															id="address"
															name="address"
															value={formData.address || ''}
															onChange={handleInputChange}
															onClick={(e) => e.stopPropagation()}
														/>
													</div>

													<div className="form-group full-width">
														<label htmlFor="newPassword">
															Nytt lösenord (lämna tomt för att behålla nuvarande)
														</label>
														<input
															type="password"
															id="newPassword"
															value={newPassword}
															onChange={(e) => setNewPassword(e.target.value)}
															placeholder="Ange nytt lösenord"
															onClick={(e) => e.stopPropagation()}
														/>
													</div>
												</div>

												<div className="form-actions">
													<button 
														type="button" 
														onClick={(e) => {
															e.stopPropagation();
															handleDelete();
														}} 
														className="btn-delete">
														Ta bort användare
													</button>
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
														<button type="submit" className="btn-submit">
															Uppdatera
														</button>
													</div>
												</div>
											</form>
										</div>
									)}
								</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
