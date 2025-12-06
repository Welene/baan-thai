import React from "react";
import "./OrderAdminCard.css";

type OrderItem = {
  name: string;
  quantity: number;  
  code: string;
  price: number;
  productId: string;
};

type OrderCardProps = {
  orderId: string;
  status: "pending" | "confirmed" | "done";
  waitStatus?: "new" | "waiting" | "overdue";
  items: OrderItem[];
  onConfirm?: (orderId: string) => void;  
  onRemove?: (orderId: string) => void; 
};

const OrderCard: React.FC<OrderCardProps> = ({ orderId, status, waitStatus, items, onConfirm, onRemove }) => {
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
			<p className="order-items" key={item.productId || index}>
				{item.quantity} x {item.name}
			</p>
		))}

		{status === "pending" && onConfirm && (
			<button className="order-confirm" onClick={() => onConfirm(orderId)}>Bekräfta</button> 
		)}
		{onRemove && (
			<button className="order-remove" onClick={() => onRemove(orderId)}>Radera</button> 
		)}
		</article>
	</>
  );
};

export default OrderCard;

// Helene
