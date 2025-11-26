import { CartItem } from './cart';
import { User } from './user';

export interface HeaderProps {
	cartItemCount: number;
	onCartClick: () => void;
}

export interface CartProps {
	cartItems: CartItem[];
	setCartItems: (items: CartItem[]) => void;
	onClose: () => void;
	user: User | null;
}

// Helene
