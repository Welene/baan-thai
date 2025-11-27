import { CartItem } from './cart';
import { MenuItem } from './menu';
import { User } from './user';

export interface MenuPageProps {
	// the whole thai & sushi page interface --> BUT ALSO USED ON CHECKOUTPAGE!
	onAddToCart?: (item: MenuItem) => void;
	cartItems: CartItem[];
	setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
	currentUser: User | null;
}

// Helene
