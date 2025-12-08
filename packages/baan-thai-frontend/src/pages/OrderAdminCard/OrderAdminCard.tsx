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
  status: "pending" | "confirmed" | "ready" | "completed"; // removed done -- added ready + completed
  waitStatus?: "new" | "waiting" | "overdue";
  items: OrderItem[];
  onConfirm?: (orderId: string) => void;
  onRemove?: (orderId: string) => void;
  onClick?: () => void;
  onMarkReady?: (orderId: string) => void;
  onMarkCompleted?: (orderId: string) => void;
};

const OrderCard: React.FC<OrderCardProps> = ({ orderId, status, waitStatus, items, onConfirm, onRemove, onClick, onMarkReady, onMarkCompleted }) => {
  // base className + status + waitstatus
  let className = "order";
  let sortOrderValue = 0;
    // console.log("onRemove:", onRemove);

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
		<article className={className} style={{ order: sortOrderValue, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
			<p className="order-num"><strong>Ordernr:</strong> {orderId}</p>

			<hr className="order-seperator" />

      {items?.map((item, index) => (
        <p className="order-items" key={item.productId || index}>
          {item.quantity} x {item.name}
        </p>
      ))}

      {status === "pending" && onConfirm && (
        <button
          className="order-confirm"
          onClick={(e) => { e.stopPropagation(); onConfirm(orderId); }} //stopPropagation -- trigger ikke onCLick på artikkelen (popup), når man trykker på en knapp
        >
          Bekräfta
        </button> 
      )}
        <button
          className="order-remove"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveClick();
          }}
        >
          Radera
        </button>
      {status === "confirmed" && onMarkReady && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkReady(orderId); }}
        >
          KLAR
        </button>
      )}
      {status === "ready" && onMarkCompleted && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkCompleted(orderId); }}
        >
          HÄMTAD
        </button>
      )}
		</article>
	</>
  );
};

export default OrderCard;

// Helene
