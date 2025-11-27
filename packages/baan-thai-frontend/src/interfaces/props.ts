import { CartItem } from './cart';
import { User } from './user';

export interface HeaderProps {
	cartItemCount: number;
	onCartClick: () => void;
}

export interface CartProps {
	// the whole Cart component interface
	cartItems: CartItem[];
	setCartItems: (items: CartItem[]) => void;
	onClose: () => void;
	user: User | null;
	mode?: 'popup' | 'inline'; // header = pop-up // menu-pages = Cart is inline/static
}

// Helene
