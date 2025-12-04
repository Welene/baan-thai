import './Cart.css';
//import { CartProps } from '../../interfaces/props';
import { useNavigate } from 'react-router-dom';
import { User } from '../../interfaces/user';
import { useCallback } from 'react';
import { CartPropsExtra } from '../../interfaces/props';

function Cart({
	cartItems,
	setCartItems,
	onClose,
	mode = 'popup', // it is popup menu in header
	isCheckoutPage = false, // since cart is REUSED on checkoutpage, and I changed the BETALA btn (that normally navs to reg/checkout), when you ARE in checkout, the btn changes with the help of this prop, so the btn's function can change into navigate to payment page instead of the old register/checkout navigation
}: CartPropsExtra & { user: User | null }) {
	// cart gets user so it can check if logged in or not
	const navigate = useNavigate();

	// change amount of the chosen menu item, when clicking + or -
	const changeQuantity = (id: number, delta: number) => {
		const updated = cartItems
			.map((item) =>
				item.id === id
					? { ...item, quantity: item.quantity + delta }
					: item
			)
			.filter((item) => item.quantity > 0);
		setCartItems(updated);
	};

	// calculated total price
	const total = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	const handleCheckout = useCallback(() => {
		// useCallBack only rerenders/changes the handleCheckout --> inside checkout button
		
		// Check if user is logged in - localStorage
		const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
		const isLoggedIn = currentUser && currentUser.userId;

		if (!isLoggedIn) {
			// if not logged in redirect to login page
			navigate('/login');
		} else if (isCheckoutPage) {
			navigate('/payment'); // when on checkout page in cart, cart button - > goes to payment page
		} else {
			// if logged in: go to checkout
			navigate('/checkout');
		}
	}, [navigate, isCheckoutPage]); // [] DEPENDENCIES: useCallback then has to be dependent on the user (logged in or not) & on the navigation because nav changes

	return (
		<>
			{mode === 'popup' && (
				<section className="overlay" onClick={onClose}></section>
			)}

			<aside
				className={`cart ${
					mode === 'inline' ? 'cart--inline' : 'cart--popup'
				}`}>
				<header className="cart__header">
					<section className="cart__header-text">
						<h3 className="cart__header-title">Avämtning</h3>
						<p className="cart__header-subtitle">
							Direkt (~20 min)
						</p>
					</section>
					{mode === 'popup' && (
						<button
							className="cart__header-close"
							onClick={onClose}>
							×
						</button>
					)}
				</header>

				<hr className="cart__divider" />

				<section className="cart__items">
					{cartItems.length === 0 && (
						<p className="cart__empty">Cart is empty</p>
					)}

					{cartItems.map((item, index) => (
						<div key={item.id}>
							<article className="cart__item">
								<section className="cart__item-info">
									<span className="cart__item-name">
										{item.name} ({item.price} kr)
									</span>
								</section>

								<section className="cart__item-controls">
									<button
										className="cart__item-btn"
										onClick={() =>
											changeQuantity(item.id, -1)
										}>
										-
									</button>
									<span className="cart__item-quantity">
										{item.quantity}
									</span>
									<button
										className="cart__item-btn cart__item-btn--plus"
										onClick={() =>
											changeQuantity(item.id, +1)
										}>
										+
									</button>
								</section>
							</article>

							{index < cartItems.length - 1 && (
								<hr className="cart__item-divider" />
							)}
						</div>
					))}
				</section>

				<hr className="cart__divider" />

				<footer className="cart__footer">
					<button className="cart__checkout" onClick={handleCheckout}>
						{isCheckoutPage
							? `TILL BETALING: ${total} kr`
							: `TILL KASSAN: ${total} kr`}
					</button>
				</footer>
			</aside>
		</>
	);
}

export default Cart;

// Helene


/* Changes by: Tim */
/* if logged in redirect to orderpage if not redirect to loginpage */