import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';
import Cart from '../components/Cart/Cart';
import Layout from '../components/Layout/Layout';
import LandingPage from '../pages/landingPage/landingPage';
import ThaiMenuPage from '../pages/ThaiMenuPage/ThaiMenuPage';
import SushiMenuPage from '../pages/SushiMenuPage/SushiMenuPage';
import { AboutUsPage } from '../pages/aboutUsPage/aboutUsPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import { User } from '../interfaces/user';
import ProfilePage from '../pages/ProfilePage/ProfilePage';

import { useState } from 'react';
import { CartItem } from '../interfaces/cart';
import { MenuItem } from '../interfaces/menu';
import LoginPage from '../pages/LoginPage/LoginPage';

export default function AppRouter() {
	// MOVE THIS TO ANOTHER FOLDER LATER AND IMPORT HERE, for now this is here
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [cartOpen, setCartOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null); //sets a current logged in user, saves in currentUser state (not logged in --> null)

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
			{cartOpen && (
				<Cart
					cartItems={cartItems}
					setCartItems={setCartItems}
					onClose={() => setCartOpen(false)}
					user={currentUser} // gives currently logged in user to the cart component
					mode="popup"
				/>
			)}
			<Routes>
				<Route
					element={
						<Layout
							cartItemCount={cartItems.length}
							onCartClick={() => setCartOpen(!cartOpen)}
						/>
					}>
					<Route
						path="/"
						element={<Navigate to="/landing" replace />}
					/>
					<Route path="/landing" element={<LandingPage />} />
					<Route
						path="/menu/sushi"
						element={
							<SushiMenuPage
								onAddToCart={addItemToCart}
								cartItems={cartItems}
								setCartItems={setCartItems}
								currentUser={currentUser}
							/>
						}
					/>
					<Route
						path="/menu/thai"
						element={
							<ThaiMenuPage
								onAddToCart={addItemToCart}
								cartItems={cartItems}
								setCartItems={setCartItems}
								currentUser={currentUser}
							/>
						}
					/>
					<Route path="/about" element={<AboutUsPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route
						path="/login"
						element={<LoginPage setCurrentUser={setCurrentUser} />}
					/>
					<Route path="/profile" element={<ProfilePage />} />

					<Route
                        path="/checkout"
                        element={
                            <CheckoutPage
                                cartItems={cartItems}
                            />
                        }
                    />
                </Route>
			</Routes>
		</BrowserRouter>
	);
}
