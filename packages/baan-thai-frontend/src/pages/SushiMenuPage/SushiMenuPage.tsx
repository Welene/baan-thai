import { useEffect, useState } from 'react';
import { MenuCard } from '../../components/MenuCard/MenuCard';
import { CategoryNav } from '../../components/CategoryNav/CategoryNav';
import './SushiMenuPage.css';
import sushiHero from '../../assets/sushi-tåg 1.png';
// import { MenuItem } from '../../interfaces/menu';
import Cart from '../../components/Cart/Cart';
import { MenuPageProps } from '../../interfaces/menuProps';
import { API_BASE_URL } from '../../config/api';

// Sushi-kategorier
const SUSHI_CATEGORIES = [
	'sushi-smaratter',
	'sushi', // Mix sushi har denna kategori i DB
	'sushi-mix',
	'sushi-specialrulle',
	'sushi-drakerullar',
	'sushi-hosomaki',
	'sushi-rullar', // Alaska, Philadelphia, Friterad, Veggie, Yakiniku rolls
	'pokbowl', // Poké Bowl har denna stavning i DB (utan bindestreck)
	'poke-bowl',
	'bento',
	'bento-special',
	'bowls',
	'varmratter',
	'tillagg',
	'soppor',
	'dryck',
];

export default function SushiMenuPage({
	onAddToCart,
	cartItems,
	setCartItems,
	currentUser,
}: MenuPageProps) {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		console.log('SushiMenuPage! Fetching menu...');
		fetch(
			`${API_BASE_URL}/api/menu`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				const arr = Array.isArray(data) ? data : data?.items ?? [];

				// Filtrera endast sushi-produkter
				const sushiItems = arr.filter((item: any) => {
					const categoryKey = item.categoryKey?.toLowerCase() || '';
					return SUSHI_CATEGORIES.some((cat) => categoryKey === cat);
				});

				// Mappa AWS-fält till MenuCard-format
				const mappedItems = sushiItems.map((item: any) => ({
					id: item.productId,
					name: item.title || item.name || 'Namn saknas',
					description: item.description || '',
					price: item.price || 0,
					categoryKey: item.categoryKey,
					category: item.category,
				}));

				// Ta bort dubbletter baserat på id
				const unique = Array.from(
					new Map(mappedItems.map((it: any) => [it.id, it])).values()
				);

				// Logga vilka produkter som hämtades
				console.log('Antal sushi-produkter:', unique.length);
				console.log(
					'Produkt-ID:n som hämtades:',
					unique.map((it: any) => it.id).sort((a, b) => a - b)
				);
				console.table(
					unique
						.map((it: any) => ({
							id: it.id,
							namn: it.name,
							kategori: it.categoryKey,
						}))
						.sort((a, b) => a.id - b.id)
				);

				setItems(unique);
			})
			.catch((err: any) => {
				console.error('Failed to fetch menu:', err);
				setError(String(err?.message ?? err));
				setItems([]);
			})
			.finally(() => setLoading(false));
	}, []);

	// Kategori-namn för visning
	const categoryNames: { [key: string]: string } = {
		'sushi-smaratter': 'Smårätter',
		'sushi-mix': 'Mix Sushi',
		'sushi-specialrulle': 'Specialrullar',
		'sushi-drakerullar': 'Drake Rullar',
		'sushi-hosomaki': 'Hosomaki',
		'poke-bowl': 'Poké Bowl',
		bento: 'Bento',
		varmratter: 'Varmrätter',
		tillagg: 'Tillägg',
		dryck: 'Dryck',
	};

	// Ordning för kategorier
	const categoryOrder = [
		'sushi-smaratter',
		'sushi-mix',
		'sushi-specialrulle',
		'sushi-drakerullar',
		'sushi-hosomaki',
		'poke-bowl',
		'bento',
		'varmratter',
		'tillagg',
		'dryck',
	];

	// Gruppera rätter efter kategori
	const groupedItems = items.reduce((acc: any, item: any) => {
		let categoryKey = item.categoryKey || 'other';

		// Mappa om kategorier till rätt visningskategorier
		if (item.id === 48) {
			categoryKey = 'tillagg'; // Misosoppa är ett tillägg
		} else if (item.id >= 5 && item.id <= 11) {
			categoryKey = 'sushi-mix'; // Mix Sushi
		} else if (item.id >= 16 && item.id <= 20) {
			categoryKey = 'sushi-drakerullar'; // Drake rullar
		} else if (item.id >= 28 && item.id <= 32) {
			categoryKey = 'poke-bowl'; // Poké Bowl
		} else if (item.id === 37) {
			categoryKey = 'bento'; // Bibimbap till Bento
		} else if (item.id >= 47 && item.id <= 52) {
			categoryKey = 'sushi-specialrulle'; // Rullar (Alaska, Yakiniku, Philadelphia, Friterad, Veggie)
		} else if (item.id === 53 || item.id === 54) {
			categoryKey = 'varmratter'; // Bowls till Varmrätter
		}

		if (!acc[categoryKey]) {
			acc[categoryKey] = [];
		}
		acc[categoryKey].push(item);
		return acc;
	}, {});

	// Sortera rätter inom varje kategori efter productId numeriskt
	Object.keys(groupedItems).forEach((categoryKey) => {
		if (categoryKey === 'sushi-mix') {
			// Speciell sortering för Mix Sushi - gruppera liknande produkter
			const sortOrder = [5, 6, 8, 9, 7, 10, 11]; // Mix 5/10/12, sedan 14 valfria, sedan Big Set
			groupedItems[categoryKey].sort((a: any, b: any) => {
				const indexA = sortOrder.indexOf(a.id);
				const indexB = sortOrder.indexOf(b.id);
				if (indexA !== -1 && indexB !== -1) return indexA - indexB;
				return (a.id || 0) - (b.id || 0);
			});
		} else {
			groupedItems[categoryKey].sort((a: any, b: any) => {
				return (a.id || 0) - (b.id || 0);
			});
		}
	});

	// Sortera kategorier i rätt ordning
	const sortedCategories = categoryOrder.filter((cat) => groupedItems[cat]);

	// Hantera lägg till i varukorg MOCKUP ALERT
	// const handleAddToCart = (menuItem: any) => {
	// 	console.log('Lägg till i varukorg:', menuItem);
	// 	alert(`${menuItem.name} har lagts till i varukorgen!`);
	// };

	// Scrolla till kategori
	const scrollToCategory = (categoryKey: string) => {
		const element = document.getElementById(`category-${categoryKey}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<>
			<div className="hero-image">
				<img src={sushiHero} alt="Sushi tåg" />
				<div className="hero-text">
					<h1>Sushi för alla tillfällen - från lunch till fest!</h1>
				</div>
			</div>

			{/* Kategori-navigering - full bredd */}
			{!loading && sortedCategories.length > 0 && (
				<CategoryNav
					categories={sortedCategories}
					categoryNames={categoryNames}
					onCategoryClick={scrollToCategory}
				/>
			)}

			<div className="menu-page sushi-menu">
				{error && <p className="error">{error}</p>}

				{loading && <p>Laddar meny...</p>}

				{!loading && Array.isArray(items) && items.length === 0 && (
					<p>Inga sushi-rätter hittades.</p>
				)}

				{!loading &&
					sortedCategories.map((categoryKey) => (
						<section
							key={categoryKey}
							id={`category-${categoryKey}`}
							className="category-section">
							<h2 className="category-title">
								{categoryNames[categoryKey] || categoryKey}
							</h2>
							<div className="grid">
								{groupedItems[categoryKey].map((item: any) => (
									<MenuCard
										key={item.id}
										menuItem={item}
										onAddToCart={onAddToCart}
									/>
								))}
							</div>
						</section>
					))}
				<section className="cart-section">
					<Cart
						cartItems={cartItems}
						setCartItems={setCartItems}
						onClose={() => {}}
						user={currentUser}
						mode="inline" // cart is inline/static on menu pages
					/>
				</section>
			</div>
		</>
	);
}

// added onAddToCart and MenuItem type here. Removed mockup alert. Added cart prompt mode/comp.- Helene
