import { useState } from 'react';
import './EditMenuPage.css';
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar';

interface MenuItem {
	productId: string;
	name: string;
	type: string;
	category: string;
	description: string;
	price: string;
	imageUrl: string;
}

export const EditMenuPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
	const [formData, setFormData] = useState<MenuItem>({
		productId: '',
		name: '',
		type: '',
		category: '',
		description: '',
		price: '0',
		imageUrl: ''
	});

	const handleSearch = async () => {
		try {
			const response = await fetch('https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu');
			const data = await response.json();

			if (searchTerm) {
				const filtered = data.filter(
					(item: MenuItem) =>
						item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						item.productId.toLowerCase().includes(searchTerm.toLowerCase())
				);
				setMenuItems(filtered);
			} else {
				setMenuItems(data);
			}
		} catch (error) {
			console.error('Error searching menu items:', error);
			alert('Kunde inte hämta menyobjekt');
		}
	};

	const handleSelectItem = (item: MenuItem) => {
		setSelectedItem(item);
		setFormData(item);
	};

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

		if (!selectedItem) return;

		try {
			const menuItem = {
				...formData,
				price: parseFloat(formData.price)
			};

			const response = await fetch(
				`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(menuItem)
				}
			);

			if (response.ok) {
				alert('Menyobjekt uppdaterat!');
				handleSearch();
				setSelectedItem(null);
				setFormData({
					productId: '',
					name: '',
					type: '',
					category: '',
					description: '',
					price: '0',
					imageUrl: ''
				});
			} else {
				const error = await response.json();
				alert(`Fel: ${error.message || 'Kunde inte uppdatera menyobjekt'}`);
			}
		} catch (error) {
			console.error('Error updating menu item:', error);
			alert('Ett fel uppstod vid uppdatering av menyobjekt');
		}
	};

	const handleDelete = async () => {
		if (!selectedItem) return;

		if (!confirm('Är du säker på att du vill ta bort detta menyobjekt?')) return;

		try {
			const response = await fetch(
				`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
				{
					method: 'DELETE'
				}
			);

			if (response.ok) {
				alert('Menyobjekt borttaget!');
				handleSearch();
				setSelectedItem(null);
				setFormData({
					productId: '',
					name: '',
					type: '',
					category: '',
					description: '',
					price: '0',
					imageUrl: ''
				});
			} else {
				const error = await response.json();
				alert(`Fel: ${error.message || 'Kunde inte ta bort menyobjekt'}`);
			}
		} catch (error) {
			console.error('Error deleting menu item:', error);
			alert('Ett fel uppstod vid borttagning av menyobjekt');
		}
	};

	return (
		<div className="edit-menu-page">
			<AdminNavBar />
			<div className="admin-content">
				<h1>Redigera menyobjekt</h1>

				<div className="search-section">
					<input
						type="text"
						placeholder="Sök efter namn eller produkt-ID..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
					<button onClick={handleSearch} className="search-btn">
						Sök
					</button>
				</div>

				<div className="menu-items-list">
					{menuItems.map((item) => (
						<div
							key={item.productId}
							className={`menu-item-card ${selectedItem?.productId === item.productId ? 'selected' : ''}`}
							onClick={() => handleSelectItem(item)}>
							<h3>{item.name}</h3>
							<p>ID: {item.productId}</p>
							<p>Pris: {item.price} kr</p>
						</div>
					))}
				</div>

				{selectedItem && (
					<form onSubmit={handleSubmit} className="edit-form">
						<h2>Redigera: {selectedItem.name}</h2>

						<div className="form-group">
							<label htmlFor="productId">Produkt ID:</label>
							<input
								type="text"
								id="productId"
								name="productId"
								value={formData.productId}
								onChange={handleInputChange}
								disabled
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

						<div className="form-actions">
							<button type="submit" className="submit-btn">
								Uppdatera
							</button>
							<button
								type="button"
								onClick={handleDelete}
								className="delete-btn">
								Ta bort
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};
