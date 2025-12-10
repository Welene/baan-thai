import { useState, useEffect } from 'react';
import './UpdateAdminModal.css';

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

interface UpdateAdminModalProps {
	user: User | null;
	onClose: () => void;
	onUpdate: (userId: string, updateData: any) => Promise<void>;
}

export const UpdateAdminModal = ({ user, onClose, onUpdate }: UpdateAdminModalProps) => {
	console.log('UpdateAdminModal rendered with user:', user);
	
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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			setFormData(user);
			setNewPassword('');
			setError(null);
		}
	}, [user]);

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
		setIsSubmitting(true);
		setError(null);

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

			await onUpdate(user!.userId, updateData);
			onClose();
		} catch (err: any) {
			setError(err.message || 'Ett fel uppstod vid uppdatering av användare');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Redigera Användare</h2>
					<button className="modal-close" onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-form">
					{error && <div className="modal-error">{error}</div>}

					<div className="user-details">
						<h3>{user.name}</h3>
						<p className="user-meta">
							<span className={`role-badge ${user.role}`}>
								{user.role === 'admin' ? 'Admin' : 'Kund'}
							</span>
						</p>
					</div>

					<div className="form-section">
						<div className="form-group">
							<label htmlFor="name">Namn *</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
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
								disabled={isSubmitting}
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
								disabled={isSubmitting}
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
								disabled={isSubmitting}>
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
								disabled={isSubmitting}
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
								disabled={isSubmitting}
							/>
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
								placeholder="Ange nytt lösenord"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					<div className="user-meta-info">
						<small>Användare-ID: {user.userId}</small>
						{user.createdAt && (
							<small>
								Skapad: {new Date(user.createdAt).toLocaleString('sv-SE', {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</small>
						)}
						{user.updatedAt && (
							<small>
								Uppdaterad: {new Date(user.updatedAt).toLocaleString('sv-SE', {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</small>
						)}
					</div>

					<div className="modal-actions">
						<button
							type="button"
							onClick={onClose}
							className="btn-cancel"
							disabled={isSubmitting}>
							Avbryt
						</button>
						<button
							type="submit"
							className="btn-submit"
							disabled={isSubmitting}>
							{isSubmitting ? 'Sparar...' : 'Spara ändringar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
