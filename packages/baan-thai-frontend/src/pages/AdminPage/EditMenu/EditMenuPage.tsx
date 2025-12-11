import { useState, useEffect } from 'react';
import './EditMenuPage.css';
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar';
import { fetchWithApiKey } from '../../../api/fetchWithApiKey';

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

	useEffect(() => {
		console.log('selectedItem changed:', selectedItem);
	}, [selectedItem]);


	// ---------------------------------------- START OF FETCH 1--------------------------------------------
	const handleSearch = async () => {
		try {
			// const response = await fetch('https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu');
			const response = await fetchWithApiKey('https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu');
			const data = await response.json();
			
			console.log('Fetched data:', data);

			// Transformera data för att matcha MenuItem interface
			const transformedData = data.map((item: any) => ({
				productId: String(item.productId || ''),
				name: item.name || item.title || '',
				type: item.categoryKey || item.category || '',
				category: item.category || item.categoryKey || '',
				description: item.description || '',
				price: String(item.price || '0'),
				imageUrl: item.imageUrl || ''
			}));
		// ---------------------------------------- END OF FETCH 1--------------------------------------------

			if (searchTerm) {
				const filtered = transformedData.filter(
					(item: MenuItem) =>
						item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						String(item.productId).toLowerCase().includes(searchTerm.toLowerCase())
				);
				setMenuItems(filtered);
			} else {
				setMenuItems(transformedData);
			}
		} catch (error) {
			console.error('Error searching menu items:', error);
			alert('Kunde inte hämta menyobjekt');
		}
	};

	const handleSelectItem = (item: MenuItem) => {
		console.log('Selected item:', item);
		setSelectedItem(item);
		setFormData(item);
		console.log('FormData set to:', item);
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
// ----------------------------------------START OF FETCH 2--------------------------------------------

			// const response = await fetch(
			// 	`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
			// 	{
			const response = await fetchWithApiKey(
    			`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(menuItem)
				}
			);
// ----------------------------------------END OF FETCH 2--------------------------------------------

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


// ---------------------------------------- START OF FETCH 3--------------------------------------------
	const handleDelete = async () => {
		if (!selectedItem) return;

		if (!confirm('Är du säker på att du vill ta bort detta menyobjekt?')) return;

		try {
			// const response = await fetch(
			// 	`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
			// 	{
			const response = await fetchWithApiKey(
    			`https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/menu/${selectedItem.productId}`,
			{
					method: 'DELETE'
				}
			);
// ---------------------------------------- END OF FETCH 3--------------------------------------------
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
				<h1>Redigera meny</h1>

				{!selectedItem && (
					<>
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
						{menuItems.map((item: MenuItem) => (
							<div
								key={item.productId}
								className="menu-item-card"
								onClick={() => handleSelectItem(item)}>
								<h3>{item.name}</h3>
								<p>ID: {item.productId}</p>
								<p>Pris: {item.price} kr</p>
							</div>
						))}
					</div>
					</>
				)}

				{selectedItem && (
					<>
						<button 
							onClick={() => {
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
							}}
							className="back-btn"
						>
							← Tillbaka till listan
						</button>
						<form onSubmit={handleSubmit} className="edit-form">
						<h2>Redigera: {selectedItem.name}</h2>						<div className="form-group">
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
					</>
				)}
			</div>
		</div>
	);
};

// Helene edit: added fetch with API_KEY