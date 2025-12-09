import "./AdminPage.css";
import React, { useEffect, useState } from "react";
import OrderCard from "../OrderAdminCard/OrderAdminCard";
import { AdminNavBar } from "../../components/AdminNavBar/AdminNavBar";
import { API_BASE_URL } from "../../config/api";

type OrderItem = {
  name: string;
  quantity: number;
  code: string;
  price: number;
  productId: string;
};


type Order = {
  orderId: string;
  status: "pending" | "confirmed" | "ready" | "completed"; // removed done -- added ready + completed
  confirmedAt?: string; // when admin confirms customers order
  createdAt: string; // when customer makes order
  order: OrderItem[];
  message?: string; // meddelanden från kund
  adminMessages?: string; // meddelanden från admin
};

const AdminPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]); // LS state for all orders
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // fetch all orders made, from the backend get all orders endpoint
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        // console.log("Fetched orders:", data);
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

   // confirms order with the help of the backend status changer
  const handleConfirm = async (orderId: string) => {
    await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
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

const handleRemoveOrder = async (orderId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to delete order:", response.status);
      alert("Kunde inte radera beställningen");
      return;
    }

    setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
  } catch (error) {
    console.error("Error deleting order:", error);
    alert("Kunde inte radera beställningen");
  }
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


  // BUTTON FUNCTION FOR "ready" (KLAR) & "completed" (HÄMTAD) -------------------------------------------------------------
  const handleMarkReady = async (orderId: string) => {
  await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "ready" }),
  });

  setOrders(prev =>
    prev.map(o =>
      o.orderId === orderId ? { ...o, status: "ready" } : o
    )
  );
};

const handleMarkCompleted = async (orderId: string) => {
  await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "completed" }),
  });
 // when clicking completed/hämtad button - it is removed from admin page only
  setOrders(prev => prev.filter(o => o.orderId !== orderId));
  // updates order state by removing that orderId  from the page (AKA orders that have been marked "hämtad", AKA clicked hämtad
};



  // EXTENDED/POPUP ORDER CONTAINER SECTION -- when order container is clicked on admin page ----------------------------------------------------------
   const openPopup = (order: Order) => {
    setSelectedOrder(order);
    setShowPopup(true);
    setPopupMessage(order.adminMessages || ""); // läs gamla meddelanden från order
  };

  const closePopup = () => {
    setSelectedOrder(null);
    setShowPopup(false);
    setPopupMessage("");
  };

  const handleSendMessage = async (orderId: string) => {
    if (!popupMessage.trim()) {
      alert("Meddelande kan inte vara tomt");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMessages: popupMessage }),
      });

      if (response.ok) {
        // Ladda om alla orders från backend för att få uppdaterade meddelanden
        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`);
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);

        // Uppdatera selectedOrder med nya data och fyll textarea med sparat meddelande
        const updatedOrder = ordersData.orders?.find((o: Order) => o.orderId === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
          setPopupMessage(updatedOrder.adminMessages ?? popupMessage);
        }

      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Kunde inte skicka meddelande");
    }
  };

  const popupClass = selectedOrder ? (() => {
    if (selectedOrder.status === 'pending') return 'pending';
    if (selectedOrder.status === 'ready') return 'ready'; // CHANGED FROM DONE TO READY HERE
    if (selectedOrder.status === 'confirmed') {
      const w = calculateWaitStatus(selectedOrder.confirmedAt);
      return `confirmed ${w || 'new'}`;
    }
    if (selectedOrder.status === 'completed') return 'completed';
    return '';
  })() : '';

  // SORT AFTER ORDERID SECTION --------------------------------------
    const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = {
      pending: 0,
      confirmed: 1,
      ready: 2,
      completed: 3,
    };

    const sA = statusOrder[a.status];
    const sB = statusOrder[b.status];

    if (sA !== sB) return sA - sB;

    return Number(a.orderId) - Number(b.orderId);
  });

  return (
    <section className="admin-page">
      <AdminNavBar />
      
      <h1 className="admin-page__heading">Alla ordrar</h1>

      <section className="orders-container">
        {sortedOrders.map((order) => (
          <OrderCard
            key={order.orderId}
            orderId={order.orderId}
            status={order.status}
            waitStatus={order.status === "confirmed" ? calculateWaitStatus(order.confirmedAt) : undefined} 
            items={order.order}
            onConfirm={handleConfirm}
            onRemove={handleRemoveOrder}
            onMarkReady={handleMarkReady}
            onMarkCompleted={handleMarkCompleted}
            onClick={() => openPopup(order)}
          />
        ))}
      </section>
      {showPopup && selectedOrder && (
        <div className="popup-backdrop" onClick={closePopup}>
          <div className={`popup-window ${popupClass}`} onClick={(e) => e.stopPropagation()}>
            <h2>Order {selectedOrder.orderId}</h2>

            <p>Status: {selectedOrder.status}</p>

            <h3>Produkter:</h3>
            <ul>
              {selectedOrder.order.map((item) => (
                <li key={item.productId}>
                  {item.quantity} x {item.name}
                </li>
              ))}
            </ul>

            <h3>Meddelande från kund:</h3>
            <p>{selectedOrder.message || "Inga meddelanden från kund."}</p>

            <h3>Meddelande till köken:</h3>
            <textarea
              value={popupMessage}
              onChange={(e) => setPopupMessage(e.target.value)}
              placeholder="Skriv ett meddelande till köken..."
            />

            <button onClick={() => handleSendMessage(selectedOrder.orderId)}>
              Skicka meddelande
            </button>
            <button onClick={closePopup}>Stäng</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPage;

// Helene
// Popup för att skicka meddelande till köken när admin klickar på en order //Felicia
// Tim: fix wrong url