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

export interface CartPropsExtra extends CartProps {
	isCheckoutPage?: boolean; // new prop that can change the BETALA buttons nsvigation from register/checkout TO navigate to payment instead WHEN ON checkout pahe (since the cart is reused, I just change the btn's functionality/navigation)
} // extends AKA takes whatever is in cartprops but also extends it with this so it can override original cartprops interface

// Helene
