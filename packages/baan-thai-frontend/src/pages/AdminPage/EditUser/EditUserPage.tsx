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
			alert('Kunde inte hämta användare');
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
			alert('Användare uppdaterad!');
			await loadUsers();
			setSelectedUser(null);
			setNewPassword('');
		} catch (error: any) {
			console.error('Error updating user:', error);
			alert(`Fel: ${error.message || 'Kunde inte uppdatera användare'}`);
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
			alert('Användare borttagen!');
			await loadUsers();
			setSelectedUser(null);
		} catch (error: any) {
			console.error('Error deleting user:', error);
			alert(`Fel: ${error.message || 'Kunde inte ta bort användare'}`);
		}
	};

	return (
		<>
			<AdminNavBar />
			<div className="edit-user-page">
				<div className="edit-user-container">
					<h1>Admin-användare</h1>

					{/* Användarlista */}
					<div className="user-results">
						<div className="user-list">
							{users.map((user) => (
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

											<form onSubmit={handleSubmit} className="edit-form">
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
														/>
													</div>
												</div>

												<div className="form-actions">
													<button type="button" onClick={handleDelete} className="btn-delete">
														Ta bort användare
													</button>
													<div className="action-buttons-right">
														<button type="button" onClick={handleCancel} className="btn-cancel">
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
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
