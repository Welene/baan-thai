import { useEffect, useState } from 'react';
import { MenuCard } from '../../components//MenuCard/MenuCard';
import './MenuPage.css';
import { MenuPageProps } from '../../interfaces/menu';

export default function MenuPage({ onAddToCart }: MenuPageProps) {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(
		null
	); /* kom ihåg att koppla error! */

	useEffect(() => {
		fetch('https://tivva34.github.io/MenuAPI/menu.json')
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				const arr = Array.isArray(data)
					? data
					: data?.menu ??
					  data?.items ??
					  []; /* Se till så items ej läggs till två gånger! */
				const unique = Array.from(
					new Map(arr.map((it: any) => [it.id, it])).values()
				);
				console.debug(
					'Fetched menu, items:',
					Array.isArray(arr) ? arr.length : typeof arr,
					'unique:',
					unique.length
				);
				setItems(unique);
			})
			.catch((err: any) => {
				console.error('Failed to fetch menu:', err);
				setError(String(err?.message ?? err));
				setItems([]);
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="menu-page">
			<h1>Meny</h1>

			<div className="grid">
				{loading && <p>Loading...</p>}
				{!loading && Array.isArray(items) && items.length === 0 && (
					<p>Inga meny-objekt hittades.</p>
				)}
				{!loading &&
					Array.isArray(items) &&
					items.map((item: any) => (
						<MenuCard
							key={item.id}
							menuItem={item}
							onAddToCart={onAddToCart}
						/>
					))}
			</div>
		</div>
	);
}
