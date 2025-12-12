import { useEffect, useState } from 'react';
import { MenuCard } from '../../components/MenuCard/MenuCard';
import { CategoryNav } from '../../components/CategoryNav/CategoryNav';
import './ThaiMenuPage.css';
import thaiHero from '../../assets/Tom-yam-Goong 1.png';
import { MenuPageProps } from '../../interfaces/menuProps';
import { API_BASE_URL } from '../../config/api';
import { fetchWithApiKey } from '../../api/fetchWithApiKey';

// Thailändska kategorier (inkluderar alla som ska visas)
const THAI_CATEGORIES = [
	'forratter',
	'forratter-sallader',
	'forratter-soppor',
	'thailandskt',
	'biff',
	'flask',
	'kyckling',
	'fiskochskaldjur',
	'fiskochskaldjur-soppor',
	'anka',
	'risochnudlar',
	'vegetariskt',
	'tofu',
	'dryck',
	'tillagg',
];

export default function ThaiMenuPage({
	onAddToCart,
	cartItems,
	setCartItems,
}: MenuPageProps) {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// ---------------------------------------- START OF FETCH --------------------------------------------
	useEffect(() => {
		console.log('ThaiMenuPage! Fetching menu...');
		
		fetchWithApiKey(`${API_BASE_URL}/api/menu`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)

	// ---------------------------------------- END OF FETCH --------------------------------------------
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				const arr = Array.isArray(data) ? data : data?.items ?? [];

				// Filtrera endast thailändska produkter
				const thaiItems = arr.filter((item: any) => {
					const categoryKey = item.categoryKey?.toLowerCase() || '';
					return THAI_CATEGORIES.some((cat) => categoryKey === cat);
				});

				// Mappa AWS-fält till MenuCard-format
				const mappedItems = thaiItems.map((item: any) => ({
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
		forratter: 'Förrätter',
		'forratter-sallader': 'Förrätter - Sallader',
		'forratter-soppor': 'Förrätter - Soppor',
		thailandskt: 'Thailändsk mat',
		biff: 'Biff',
		flask: 'Fläsk',
		kyckling: 'Kyckling',
		fiskochskaldjur: 'Fisk och Skaldjur',
		'fiskochskaldjur-soppor': 'Fisk och Skaldjur - Soppor',
		anka: 'Anka',
		risochnudlar: 'Ris och Nudlar',
		vegetariskt: 'Vegetariskt',
		tofu: 'Tofu',
		dryck: 'Dryck',
		tillagg: 'Tillägg',
	};

	// Ordning för kategorier
	const categoryOrder = [
		'forratter',
		'thailandskt',
		'biff',
		'flask',
		'kyckling',
		'fiskochskaldjur',
		'anka',
		'risochnudlar',
		'vegetariskt',
		'tofu',
		'tillagg',
		'dryck',
	];

	/* Gruppera rätter efter kategori 
      Slå ihop alla förrätter-underkategorier till en */
	const groupedItems = items.reduce((acc: any, item: any) => {
		let categoryKey = item.categoryKey || 'other';

		// Slå ihop alla förrätter
		if (
			categoryKey === 'forratter-sallader' ||
			categoryKey === 'forratter-soppor'
		) {
			categoryKey = 'forratter';
		}

		// Slå ihop fiskochskaldjur-soppor med fiskochskaldjur
		if (categoryKey === 'fiskochskaldjur-soppor') {
			categoryKey = 'fiskochskaldjur';
		}

		// Extra Tofu ska visas i både vegetariskt och tillägg
		if (categoryKey === 'tillagg' && item.id === 126) {
			// Lägg till i vegetariskt
			if (!acc['vegetariskt']) {
				acc['vegetariskt'] = [];
			}
			acc['vegetariskt'].push(item);
		}

		if (!acc[categoryKey]) {
			acc[categoryKey] = [];
		}
		acc[categoryKey].push(item);
		return acc;
	}, {});

	// Sortera rätter inom varje kategori efter productId
	Object.keys(groupedItems).forEach((categoryKey) => {
		groupedItems[categoryKey].sort((a: any, b: any) => {
			return (a.id || 0) - (b.id || 0);
		});
	});

	// Sortera kategorier i rätt ordning
	const sortedCategories = categoryOrder.filter((cat) => groupedItems[cat]);


	// Scrolla till kategori
	const scrollToCategory = (categoryKey: string) => {
		const element = document.getElementById(`category-${categoryKey}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<>
			{/* Hero Image med text overlay - full bredd */}
			<div className="hero-image thai-hero">
				<img src={thaiHero} alt="Thailändsk maträtt" />
				<div className="hero-text">
					<h1>En smakfull upplevelse</h1>
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

			<div className="menu-page thai-menu">
				{error && <p className="error">{error}</p>}

				{loading && <p>Laddar meny...</p>}

				{!loading && Array.isArray(items) && items.length === 0 && (
					<p>Inga thailändska rätter hittades.</p>
				)}

				{!loading &&
					sortedCategories.map((categoryKey) => (
						<section
							key={categoryKey}
							id={`category-${categoryKey}`}
							className="category-section">
							<h2 className="category-title" aria-label={`Kategori: ${categoryNames[categoryKey] || categoryKey}`}> {categoryNames[categoryKey] || categoryKey}
							</h2>
							<div className="grid">
								{groupedItems[categoryKey].map((item: any) => (
									<MenuCard
										key={item.id}
										menuItem={item}
										onAddToCart={onAddToCart}
										cartItems={cartItems}
										setCartItems={setCartItems}
									/>
								))}
							</div>
						</section>
					))}
				{/* <section className="cart-section">
					<Cart
						cartItems={cartItems}
						setCartItems={setCartItems}
						onClose={() => {}}
						user={currentUser}
						mode="inline" // cart is inline/static on menu pages
					/>
				</section> */}
			</div>
		</>
	);
}



/* Författare: Tim */
/*  visar thailändska menyn med kategorinavigering */
// added onAddToCart and MenuItem type here. Removed mockup alert. Added cart prompt mode/ comp. - Helene

/* Tim: löste problem med notifications under Hero image och kommenterade ut static cart från botten */
// Felicia: add cartitems och setcartitem för att kontrollera antal och koppla den med quanity button i menucard funktion