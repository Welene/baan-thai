export interface MenuPageProps {
	onAddToCart: (item: any) => void;
}

export interface MenuItem {
	id: number; // tog bort string här
	name: string;
	description: string;
	price: number;
}
