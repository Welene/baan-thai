import React, { useEffect, useState } from "react";
import OrderCard from "../OrderAdminCard/OrderAdminCard";


type OrderItem = {
  name: string;
  quantity: number;
  code: string;
  price: number;
};


type Order = {
  orderId: string;
  status: "pending" | "confirmed" | "done";
  confirmedAt?: string; // when admin confirms customers order
  createdAt: string; // when customer makes order
  order: OrderItem[];
};

const AdminPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]); // LS state for all orders

  // fetch all orders made, from the backend get all orders endpoint
  useEffect(() => {
    fetch("http://localhost:3000/api/orders") // later --> AWS URL
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched orders:", data);
        setOrders(data.orders || []);
      })
      .catch((err) => console.error("Failed to fetch orders", err));
  }, []);


  // calculates waitStatus (for colors) based on when confirmed btn was clicked
  const calculateWaitStatus = (confirmedAt?: string) => {
    if (!confirmedAt) return undefined; // går til pending (ingen waitStatus hvis ikke confirmed)
    const diffMinutes = (Date.now() - new Date(confirmedAt).getTime()) / 1000 / 60;
    if (diffMinutes < 5) return "new";
    if (diffMinutes < 25) return "waiting";
    return "overdue";
  };

  // vonfirms order with the help of the backend status changer
  const handleConfirm = async (orderId: string) => {
    await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });

    // updates LS with confirmedAt when clicked by admin
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.orderId === orderId ? { ...o, status: "confirmed", confirmedAt: new Date().toISOString() } : o
      )
    );
  };

  // waitStatus (colors) is updated by setInterval every min
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.status === "confirmed" && order.confirmedAt
            ? { ...order } // triggers rerender, calculateWaitStatus is used on render
            : order
        )
      );
    }, 60000); // setInterval runs every minute

    return () => clearInterval(interval); // cleanup when comp unmounts
  }, []);

  return (
    <section className="admin-page">
      <h1 className="admin-page__heading">Alla ordrer</h1>

      <section className="orders-container">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            orderId={order.orderId}
            status={order.status}
            waitStatus={order.status === "confirmed" ? calculateWaitStatus(order.confirmedAt) : undefined} 
            items={order.order}
            onConfirm={handleConfirm} // connect handleConfirm to confirm-btn on order item
          />
        ))}
      </section>
    </section>
  );
};

export default AdminPage;
