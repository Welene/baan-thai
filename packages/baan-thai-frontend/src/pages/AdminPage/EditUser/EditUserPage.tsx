import { useState, useEffect } from 'react';
import './EditUserPage.css';
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

export const EditUserPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
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

	useEffect(() => {
		console.log('selectedUser changed:', selectedUser);
	}, [selectedUser]);

	const handleSearch = async () => {
		try {
			// Hämta alla användare
			const response = await fetch(`${API_BASE_URL}/api/users`);
			const data = await response.json();
			
			console.log('Fetched users:', data);

			const allUsers = data.users || [];

			if (searchTerm) {
				const filtered = allUsers.filter(
					(user: User) =>
						user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
						user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
						user.userId.toLowerCase().includes(searchTerm.toLowerCase())
				);
				setUsers(filtered);
			} else {
				setUsers(allUsers);
			}
		} catch (error) {
			console.error('Error searching users:', error);
			alert('Kunde inte hämta användare');
		}
	};

	const handleSelectUser = (user: User) => {
		console.log('Selected user:', user);
		setSelectedUser(user);
		setFormData(user);
		setNewPassword(''); // Reset password field
		console.log('FormData set to:', user);
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
			// Bygg update object - skicka bara ifyllda fält
			const updateData: any = {
				name: formData.name,
				username: formData.username,
				email: formData.email,
				role: formData.role,
				address: formData.address,
				phoneNumber: formData.phoneNumber
			};

			// Lägg till password om det är satt
			if (newPassword) {
				updateData.password = newPassword;
			}

			const response = await fetch(
				`${API_BASE_URL}/api/users/${selectedUser.userId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(updateData)
				}
			);

			if (response.ok) {
				alert('Användare uppdaterad!');
				handleSearch();
				setSelectedUser(null);
				setNewPassword('');
				setFormData({
					userId: '',
					name: '',
					username: '',
					email: '',
					role: 'customer',
					address: '',
					phoneNumber: ''
				});
			} else {
				const error = await response.json();
				alert(`Fel: ${error.error || 'Kunde inte uppdatera användare'}`);
			}
		} catch (error) {
			console.error('Error updating user:', error);
			alert('Ett fel uppstod vid uppdatering av användare');
		}
	};

	const handleCancel = () => {
		setSelectedUser(null);
		setNewPassword('');
		setFormData({
			userId: '',
			name: '',
			username: '',
			email: '',
			role: 'customer',
			address: '',
			phoneNumber: ''
		});
	};

	return (
		<>
			<AdminNavBar />
			<div className="edit-user-page">
				<div className="edit-user-container">
					<h1>Redigera Användare</h1>

					{/* Söksektion */}
					<div className="search-section">
						<div className="search-bar">
							<input
								type="text"
								placeholder="Sök efter namn, email, användarnamn eller ID..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter') handleSearch();
								}}
							/>
							<button onClick={handleSearch} className="search-button">
								Sök
							</button>
						</div>

						{/* Användarresultat */}
						{users.length > 0 && (
							<div className="user-results">
								<h3>Sökresultat ({users.length})</h3>
								<div className="user-list">
									{users.map((user) => (
										<div
											key={user.userId}
											className={`user-item ${
												selectedUser?.userId === user.userId ? 'selected' : ''
											}`}
											onClick={() => handleSelectUser(user)}>
											<div className="user-info">
												<span className="user-name">{user.name}</span>
												<span className="user-email">{user.email}</span>
												<span className={`user-role ${user.role}`}>
													{user.role === 'admin' ? 'Admin' : 'Kund'}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Redigeringsformulär */}
					{selectedUser && (
						<div className="edit-form-section">
							<h2>Redigera: {selectedUser.name}</h2>
							<form onSubmit={handleSubmit} className="edit-form">
								<div className="form-row">
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
								</div>

								<div className="form-row">
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
								</div>

								<div className="form-row">
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
								</div>

								<div className="form-group">
									<label htmlFor="newPassword">
										Nytt lösenord (lämna tomt för att behålla nuvarande)
									</label>
									<input
										type="password"
										id="newPassword"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Ange nytt lösenord om du vill ändra"
									/>
								</div>

								<div className="form-actions">
									<button type="submit" className="submit-button">
										Spara ändringar
									</button>
									<button
										type="button"
										onClick={handleCancel}
										className="cancel-button">
										Avbryt
									</button>
								</div>

								<div className="user-meta">
									<small>Användare-ID: {selectedUser.userId}</small>
									{selectedUser.createdAt && (
										<small>
											Skapad: {new Date(selectedUser.createdAt).toLocaleDateString('sv-SE')}
										</small>
									)}
									{selectedUser.updatedAt && (
										<small>
											Uppdaterad: {new Date(selectedUser.updatedAt).toLocaleDateString('sv-SE')}
										</small>
									)}
								</div>
							</form>
						</div>
					)}
				</div>
			</div>
		</>
	);
};
