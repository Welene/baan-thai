export interface MenuPageProps {
	onAddToCart?: (item: any) => void; // ? -->  menupages need onAddToCart to connect menu items and cart - while checkout does not, it only needs cart, but not addtocart, so we make it optional, so checkoutpage works without addtocart prop
} // menuProps is a newer version of this interface

export interface MenuItem {
	id: number; 
	name: string;
	description: string;
	price: number;
}
