import React from 'react';
import './MenuCard.css';
import { MenuItem } from '../../interfaces/menu';
import { CartItem } from '../../interfaces/cart';

interface MenuCardProps {
	menuItem: MenuItem;
	onAddToCart?: (menuItem: MenuItem) => void;
	cartItems: CartItem[];
	setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const MenuCard: React.FC<MenuCardProps> = ({
	menuItem,
	onAddToCart,
	cartItems,
	setCartItems,
}) => {
	const cartItem = cartItems.find((item) => item.id === menuItem.id);
	const quantity = cartItem?.quantity ?? 0;

	const handleAdd = () => {
		if (!cartItem) {
			onAddToCart?.(menuItem);
		} else {
			setCartItems(
				cartItems.map((item) => 
					item.id === menuItem.id
						? { ...item, quantity: item.quantity + 1}
						: item
				)
			)
		}
	}

	const handleRemove = () => {
		if (!cartItem) return;

		if (cartItem.quantity === 1) {
			setCartItems(cartItems.filter((item) => item.id != menuItem.id));
		} else {
			setCartItems(
				cartItems.map((item) => 
					item.id === menuItem.id
						? { ...item, quantity: item.quantity - 1}
						: item
				)
			);
		}
	}

	return (
		    <div
		      className="menu-card"
		      aria-label={`Maträtt: ${menuItem.name}${menuItem.price ? `, Pris: ${menuItem.price} kr` : ''}${menuItem.description ? `, ${menuItem.description}` : ''}`}>
			    <h3>{menuItem.name}</h3>
			<p className="description">{menuItem.description}</p>

			<p className="price">{menuItem.price} kr</p>

			{quantity === 0 ? (
				<button
					className="add-button"
					onClick={handleAdd}>
					LÄGG TILL
				</button>
      ) : (
        <div className="quantity-controls">
          <button className="add-button qty-button minus-button" onClick={handleRemove}>-</button>
          <span className="qty">{quantity}</span>
          <button className="add-button qty-button plus-button" onClick={handleAdd}>+</button>
        </div>
      )}
		</div>
	);
};
//author tim	
// Component for displaying a menu item with add to cart functionality
//Felicia // lägga till plus, minus och antal knapp 
//Tim: tillgänglighets anpassning  / styling