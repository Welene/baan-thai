import { useState } from 'react';
import './adminMenuPage.css';
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar';
import { fetchWithApiKey } from '../../../api/fetchWithApiKey';

export const AdminMenuPage = () => {
	const [formData, setFormData] = useState({
		productId: '',
		name: '',
		type: '',
		category: '',
		description: '',
		price: '',
		imageUrl: ''
	});

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const menuItem = {
			productId: formData.productId,
			name: formData.name,
			type: formData.type,
			category: formData.category,
			description: formData.description,
			price: parseFloat(formData.price),
			imageUrl: formData.imageUrl
		};

		// ----------------------------------------START OF FETCH--------------------------------------------
		try {
			// const response = await fetch('https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu', {
			const response = await fetchWithApiKey('https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(menuItem)
			});

			if (response.ok) {
				alert('Menyobjekt skapat!');
				setFormData({
					productId: '',
					name: '',
					type: '',
					category: '',
					description: '',
					price: '',
					imageUrl: ''
				});
			} else {
				const error = await response.json();
				alert(`Fel: ${error.message || 'Kunde inte skapa menyobjekt'}`);
			}
		} catch (error) {
			console.error('Error creating menu item:', error);
			alert('Ett fel uppstod vid skapande av menyobjekt');
		}
	};
	// ----------------------------------------END OF FETCH--------------------------------------------

	return (
		<div className="admin-menu-page">
			<AdminNavBar />
			<div className="admin-content">
				<h1>Skapa ny meny</h1>
				<form onSubmit={handleSubmit} className="menu-form">
					<div className="form-group">
						<label htmlFor="productId">Produkt ID:</label>
						<input
							type="text"
							id="productId"
							name="productId"
							value={formData.productId}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="name">Namn:</label>
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
						<label htmlFor="type">Typ:</label>
						<select
							id="type"
							name="type"
							value={formData.type}
							onChange={handleInputChange}
							required>
							<option value="">Välj typ</option>
							<option value="thai">Thai</option>
							<option value="sushi">Sushi</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="category">Kategori:</label>
						<input
							type="text"
							id="category"
							name="category"
							value={formData.category}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">Beskrivning:</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							rows={4}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="price">Pris:</label>
						<input
							type="number"
							id="price"
							name="price"
							value={formData.price}
							onChange={handleInputChange}
							step="0.01"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="imageUrl">Bild URL:</label>
						<input
							type="text"
							id="imageUrl"
							name="imageUrl"
							value={formData.imageUrl}
							onChange={handleInputChange}
							required
						/>
					</div>

					<button type="submit" className="submit-btn">
						Skapa menyobjekt
					</button>
				</form>
			</div>
		</div>
	);
};


// Helene edit: added fetch with API_KEY
