import React from 'react';
import './MenuCard.css';
import { MenuItem } from '../../interfaces/menu';

interface MenuCardProps {
	menuItem: MenuItem;
	onAddToCart?: (menuItem: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
	menuItem,
	onAddToCart,
}) => {
	return (
		<div className="menu-card">
			<h3>{menuItem.name}</h3>
			<p className="description">{menuItem.description}</p>

			<p className="price">{menuItem.price} kr</p>

			{onAddToCart && (
				<button
					className="add-button"
					onClick={() => onAddToCart(menuItem)}>
					Lägg till
				</button>
			)}
		</div>
	);
};
