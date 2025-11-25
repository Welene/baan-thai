import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from '../pages/MenuPage/MenuPage';
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';
import Cart from '../components/Cart/Cart';
/* Importera era sidor här som jag gjort med MenuPage */
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { AboutUsPage } from '../pages/aboutUsPage/aboutUsPage';
import { LandingPage } from '../pages/landingPage/landingPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import { useState } from 'react';
import { CartItem } from '../interfaces/cart';
import { MenuItem } from '../interfaces/menu';

export default function AppRouter() {
	// MOVE THIS TO ANOTHER FOLDER LATER AND IMPORT HERE, for now this is here
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [cartOpen, setCartOpen] = useState(false);

	const addItemToCart = (menuItem: MenuItem) => {
		setCartItems((prev: CartItem[]) => {
			const existing = prev.find((i) => i.id === menuItem.id);

			if (existing) {
				return prev.map((i) =>
					i.id === menuItem.id
						? { ...i, quantity: i.quantity + 1 }
						: i
				);
			}

			const newItem: CartItem = {
				id: menuItem.id,
				code: '',
				// code: menuItem.code, // we don't have code in menuItem yet, add it?
				name: menuItem.name,
				price: menuItem.price,
				quantity: 1,
			};

			return [...prev, newItem];
		});
	};

	return (
		<BrowserRouter>
			<Header
				cartItemCount={cartItems.length}
				onCartClick={() => setCartOpen(!cartOpen)}
			/>
			{cartOpen && (
				<Cart
					cartItems={cartItems}
					setCartItems={setCartItems}
					onClose={() => setCartOpen(false)}
				/>
			)}

			<Routes>
				<Route path="/" element={<Navigate to="/landing" replace />} />
				<Route path="/landing" element={<LandingPage />} />
				<Route
					path="/menu"
					element={<MenuPage onAddToCart={addItemToCart} />}
				/>
				<Route path="/om-oss" element={<AboutUsPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/checkout" element={<CheckoutPage />} />
			</Routes>
			<Footer />
		</BrowserRouter>
	);
}
