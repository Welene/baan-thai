import React from 'react';
import OrderCard from '../OrderAdminCard/OrderAdminCard';

type OrderItem = {
	id: number;
	name: string;
	quantity: number;
}; // HARDCODED NOW, get from order later when it is pushed up

type Order = {
	// what frontend expects from backend - look at backend when it is pushed up
	orderId: number;
	status: 'pending' | 'confirmed'; // admin can confirm order
	done?: boolean; // done is true or false
	waitStatus?: 'new' | 'waiting' | 'overdue'; // green, orange or red depending
	items?: OrderItem[]; // HARDCODED ITEMS IN ORDER FOR NOW
};

const orders: Order[] = [
	// HARDCODED for now...
	{
		orderId: 1,
		status: 'pending',
		items: [
			{ id: 1, name: 'Burger', quantity: 2 },
			{ id: 2, name: 'Fries', quantity: 1 },
		],
	}, // pending is in the grey container AKA not confirmed by admin yet
	{
		orderId: 2,
		status: 'confirmed',
		waitStatus: 'new',
		items: [
			{ id: 1, name: 'Burger', quantity: 2 },
			{ id: 2, name: 'Fries', quantity: 1 },
		],
	}, // after it has been confirmed by admin: it will be green,
	{
		orderId: 3,
		status: 'confirmed',
		waitStatus: 'waiting',
		items: [
			{ id: 1, name: 'Burger', quantity: 2 },
			{ id: 2, name: 'Fries', quantity: 1 },
		],
	}, // orange or
	{
		orderId: 4,
		status: 'confirmed',
		waitStatus: 'overdue',
		items: [
			{ id: 1, name: 'Burger', quantity: 2 },
			{ id: 2, name: 'Fries', quantity: 1 },
		],
	}, // red -  & cooks can interract with the colored ones
	{
		orderId: 5,
		status: 'confirmed',
		done: true,
		items: [
			{ id: 1, name: 'Burger', quantity: 2 },
			{ id: 2, name: 'Fries', quantity: 1 },
		],
	}, // food is done --> cook clicks DONE --> and it changes status to done
];

const AdminPage: React.FC = () => {
	return (
		<section className="admin-page">
			<h1 className="admin-page__title">Alla ordrer</h1>
			<section className="orders-container">
				{orders.map((order) => (
					<OrderCard
						key={order.orderId}
						orderId={order.orderId}
						status={order.status}
						waitStatus={order.waitStatus}
						items={order.items}
					/>
				))}
			</section>
		</section>
	);
};

export default AdminPage;
