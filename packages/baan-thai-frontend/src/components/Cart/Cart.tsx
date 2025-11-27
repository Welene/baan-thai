import './Cart.css';
import { useState } from 'react';
import { CartItem } from '../../interfaces/cart';
import { CartProps } from '../../interfaces/props';
import { useNavigate } from 'react-router-dom';
import { User } from '../../interfaces/user';
import { useCallback } from 'react';
import { ButtonProps } from '../../interfaces/button';

function Cart({
	cartItems,
	setCartItems,
	onClose,
	user,
	mode = 'popup', // it is popup menu in header
}: CartProps & { user: User | null }) {
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

		if (!user) {
			// so if the user is not logged in:
			navigate('/register'); // useCallBack changes the checkout button to know that and send them to login
		} else {
			// or if logged in:
			navigate('/checkout'); // updates it to /checkout
		}
	}, [user, navigate]); // [] DEPENDENCIES: useCallback then has to be dependent on the user (logged in or not) & on the navigation because nav changes

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
						TILL KASSAN: -{total} kr
					</button>
				</footer>
			</aside>
		</>
	);
}

export default Cart;

// Helene
