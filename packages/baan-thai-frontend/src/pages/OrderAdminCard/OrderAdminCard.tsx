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
  let sortOrderValue = 0;
    console.log("onRemove:", onRemove);

  if (status === "pending") {
    className += " pending";
    sortOrderValue = 0;  // pending orderst first
  } else if (status === "confirmed") {
    className += ` confirmed ${waitStatus || "new"}`;
    if (waitStatus === "overdue") sortOrderValue = 1;
    else if (waitStatus === "waiting") sortOrderValue = 2;
    else sortOrderValue = 3;
  }

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(orderId);
    }
  }
  

  return (
	<>
		<article className={className} style={{ order: sortOrderValue }}>
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
        <button className="order-remove" onClick={handleRemoveClick}>Radera</button> 
      )}
		</article>
	</>
  );
};

export default OrderCard;

// Helene
