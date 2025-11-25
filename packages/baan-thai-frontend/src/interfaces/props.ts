import { CartItem } from './cart';

export interface HeaderProps {
	cartItemCount: number;
	onCartClick: () => void;
}

export interface CartProps {
	cartItems: CartItem[];
	setCartItems: (items: CartItem[]) => void;
	onClose: () => void;
}

// Helene
