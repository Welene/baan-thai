import React from "react";
import "./OrderAdminCard.css";

type OrderItem = {
  name: string;
  quantity: number;  
  code: string;
  price: number;
};

type OrderCardProps = {
  orderId: string;
  status: "pending" | "confirmed" | "done";
  waitStatus?: "new" | "waiting" | "overdue";
  items: OrderItem[];
  onConfirm?: (orderId: string) => void;  
};

const OrderCard: React.FC<OrderCardProps> = ({ orderId, status, waitStatus, items, onConfirm }) => {
  // base className + status + waitstatus
  let className = "order";

  if (status === "pending") className += " pending";
  else if (status === "confirmed") className += ` confirmed ${waitStatus || "new"}`; 
  else if (status === "done") className += " done";

  return (
	<>
		<article className={className}>
			<p className="order-num"><strong>Ordernr:</strong> {orderId}</p>

			<hr className="order-seperator" />

		{items?.map((item, index) => (
			<p className="order-items" key={item.code || index}>
				{item.quantity} x {item.name} ({item.code})
			</p>
		))}

		{status === "pending" && onConfirm && (
			<button className="order-confirm" onClick={() => onConfirm(orderId)}>Bekräfta</button> 
		)}
		</article>
	</>
  );
};

export default OrderCard;

// Helene
