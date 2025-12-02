import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './ProfilePage.css';

interface Order {
  orderId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  order: Array<{
    name: string;
    amount: number;
    price: number;
  }>;
}

interface Profile {
  userId: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  address?: string;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Hämta användare från localStorage (satt vid inloggning)
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const userId = currentUser?.userId;

  // Använd localStorage-data för profilen (alltid tillgänglig)
  const profile: Profile = {
    userId: currentUser?.userId || '',
    name: currentUser?.name || 'Användare',
    email: currentUser?.email || '',
    username: currentUser?.username || '',
    phoneNumber: currentUser?.phoneNumber,
    address: currentUser?.address
  };

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [userId, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Kunde inte hämta ordrar:', err);
      // Visa inte error - vi har fortfarande profilinfo från localStorage
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f0ad4e';    // Orange - väntar på accept
      case 'locked': return '#5bc0de';     // Blå - accepterad, tillagas
      case 'ready': return '#5cb85c';      // Grön - redo att hämtas
      case 'completed': return '#28a745';  // Mörkgrön - slutförd
      case 'cancelled': return '#d9534f';  // Röd - avbruten
      default: return '#777';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Väntar på bekräftelse';
      case 'locked': return 'Tillagas';
      case 'ready': return 'Redo att hämtas';
      case 'completed': return 'Slutförd';
      case 'cancelled': return 'Avbruten';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Laddar profil...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profilinfo */}
        <section className="profile-header">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            {profile.phoneNumber && (
              <p className="profile-phone">{profile.phoneNumber}</p>
            )}
            {profile.address && (
              <p className="profile-address">{profile.address}</p>
            )}
          </div>
        </section>

        {/* Orderhistorik */}
        <section className="orders-section">
          <h2>Din orderhistorik</h2>
          {orders.length === 0 ? (
            <p className="empty-message">Inga tidigare ordrar</p>
          ) : (
            <ul className="orders-list">
              {orders.map(order => (
                <li key={order.orderId} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order.orderId}</span>
                    <span
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="order-items">
                      {order.order?.map((item, index) => (
                        <span key={index} className="order-item-name">
                          {item.amount}x {item.name}
                        </span>
                      ))}
                    </div>
                    <div className="order-meta">
                      <span className="order-total">{order.totalPrice} kr</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
