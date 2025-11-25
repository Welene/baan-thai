import './Cart.css';
import { useState } from 'react';
import { CartItem } from '../../interfaces/cart';
import { CartProps } from '../../interfaces/props';

function Cart({ cartItems, setCartItems, onClose }: CartProps) {
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

	const total = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	return (
		<>
			<section className="overlay" onClick={onClose}></section>

			<aside className="cart">
				<header className="cart__header">
					<section className="cart__header-text">
						<h3 className="cart__header-title">Avämtning</h3>
						<p className="cart__header-subtitle">
							Direkt (~20 min)
						</p>
					</section>
					<button className="cart__header-close" onClick={onClose}>
						×
					</button>
				</header>

				<hr className="cart__divider" />

				<section className="cart__items">
					{cartItems.length === 0 && (
						<p className="cart__empty">Cart is empty</p>
					)}
					{cartItems.map((item) => (
						<article key={item.id} className="cart__item">
							<section className="cart__item-info">
								<span className="cart__item-name">
									{item.name} ({item.price} kr)
								</span>
							</section>

							<section className="cart__item-controls">
								<button
									className="cart__item-btn"
									onClick={() => changeQuantity(item.id, -1)}>
									-
								</button>
								<span className="cart__item-quantity">
									{item.quantity}
								</span>
								<button
									className="cart__item-btn"
									onClick={() => changeQuantity(item.id, +1)}>
									+
								</button>
							</section>
						</article>
					))}
				</section>

				<hr className="cart__divider" />

				<footer className="cart__footer">
					<button className="cart__checkout">
						Checkout {total} kr
					</button>
				</footer>
			</aside>
		</>
	);
}

export default Cart;

// Helene
