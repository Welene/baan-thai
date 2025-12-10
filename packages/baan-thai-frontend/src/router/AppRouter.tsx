import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';
import Cart from '../components/Cart/Cart';
import CartFAB from '../components/CartFAB/CartFAB';
import Layout from '../components/Layout/Layout';
import LandingPage from '../pages/landingPage/landingPage';
import ThaiMenuPage from '../pages/ThaiMenuPage/ThaiMenuPage';
import SushiMenuPage from '../pages/SushiMenuPage/SushiMenuPage';
import { AboutUsPage } from '../pages/AboutUsPage/aboutUsPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import { User } from '../interfaces/user';
import AdminPage from '../pages/AdminPage/AdminPage';
import { AdminMenuPage } from '../pages/AdminPage/CreateNewMenu/AdminMenuPage';
import { EditMenuPage } from '../pages/AdminPage/EditMenu/EditMenuPage';
import { EditUserPage } from '../pages/AdminPage/EditUser/EditUserPage';
import { AdminUserPage } from '../pages/AdminPage/AdminUserPage/AdminUserPage';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { useState } from 'react';
import { CartItem } from '../interfaces/cart';
import { MenuItem } from '../interfaces/menu';
import LoginPage from '../pages/LoginPage/LoginPage';

function CartFABWrapper({ cartItems, cartOpen, setCartOpen }: { cartItems: CartItem[], cartOpen: boolean, setCartOpen: (open: boolean) => void }) {
	const location = useLocation();
	const hideCartOnRoutes = ['/admin', '/admin/menu', '/admin/menu/edit', '/admin/users', '/admin/users/edit'];
	
	if (hideCartOnRoutes.includes(location.pathname)) {
		return null;
	}
	
	return (
		<CartFAB 
			itemCount={cartItems.length}
			onClick={() => setCartOpen(!cartOpen)}
		/>
	);
}

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
			
			{/* Floating Action Button - döljs på admin-sidor */}
			<CartFABWrapper 
				cartItems={cartItems}
				cartOpen={cartOpen}
				setCartOpen={setCartOpen}
			/>
			
			<Routes>
				<Route
					element={<Layout />}>
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
						path="/admin" 
						element={
							<ProtectedRoute currentUser={currentUser} requiredRole="admin">
								<AdminPage />
							</ProtectedRoute>
						} 
					/>

					<Route 
						path="/admin/menu" 
						element={
							<ProtectedRoute currentUser={currentUser} requiredRole="admin">
								<AdminMenuPage />
							</ProtectedRoute>
						} 
					/>

					<Route 
						path="/admin/menu/edit" 
						element={
							<ProtectedRoute currentUser={currentUser} requiredRole="admin">
								<EditMenuPage />
							</ProtectedRoute>
						} 
					/>

					<Route 
						path="/admin/users/edit" 
						element={
							<ProtectedRoute currentUser={currentUser} requiredRole="admin">
								<EditUserPage />
							</ProtectedRoute>
						} 
					/>

					<Route 
						path="/admin/users" 
						element={
							<ProtectedRoute currentUser={currentUser} requiredRole="admin">
								<AdminUserPage />
							</ProtectedRoute>
						} 
					/>

					<Route
						path="/checkout"
						element={
							<CheckoutPage
								cartItems={cartItems}
								currentUser={currentUser}
							/>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
