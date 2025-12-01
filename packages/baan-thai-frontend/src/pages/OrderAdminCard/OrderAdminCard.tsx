import React from 'react';
import './OrderAdminCard.css';

type OrderItem = {
	id: number;
	name: string;
	quantity: number;
}; // HARDCODED NOW, get from order later when it is pushed up

type OrderCardProps = {
	// what frontend is gonna render
	orderId: number;
	status: 'pending' | 'confirmed' | 'done';
	done?: boolean;
	waitStatus?: 'new' | 'waiting' | 'overdue';
	items?: OrderItem[]; // for ahrdcoded items so I can style
};

const OrderCard: React.FC<OrderCardProps> = ({
	orderId,
	status,
	waitStatus,
	done,
	items,
}) => {
	let className = 'order';

	if (status === 'pending') className += ' pending';
	else if (status === 'confirmed') className += ` confirmed ${waitStatus}`;
	else if (status === 'done') className += ' done';

	let waitText = '';
	if (status === 'confirmed') {
		if (waitStatus === 'new') waitText = '(0 < 5 min)';
		else if (waitStatus === 'waiting') waitText = '(5 < 10 min)';
		else if (waitStatus === 'overdue') waitText = '(15 min >)';
	}

	return (
		<article className={className}>
			OrderNr: {orderId} {status === 'confirmed' && !done && waitText}
			<hr className="order-seperator" />
			{/* Render each item in its own <p> */}
			{items?.map((item) => (
				<p key={item.id}>
					{item.quantity} x {item.name}
				</p>
			))}
		</article>
	);
};

export default OrderCard;
