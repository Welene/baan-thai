import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { cancelOrder } from '../../services/paymentService';
import { EditOrderModal } from './EditOrderModal';
import './ProfilePage.css';
import { fetchWithApiKey } from '../../api/fetchWithApiKey';

interface Order {
  orderId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  order: Array<{
    name: string;
    quantity: number;
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
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderItems, setEditingOrderItems] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Hämta användare från localStorage (satt vid inloggning)
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const userId = currentUser?.userId;

  // Använd profileData state om det finns, annars fallback till localStorage
  const profile: Profile = profileData || {
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
    
    // Hämta ordrar varje 30 sekund för att se uppdateringar från köket
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, [userId, navigate]);

  // ----------------------------------------START OF FETCH 1--------------------------------------------
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
      const response = await fetchWithApiKey(`${API_BASE_URL}/api/profile/${userId}`);
      
      // ----------------------------------------END OF FETCH 1--------------------------------------------
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        
        // Uppdatera profildata från backend
        if (data.profile) {
          setProfileData({
            userId: data.profile.userId || userId,
            name: data.profile.name || currentUser?.name || 'Användare',
            email: data.profile.email || '',
            username: data.profile.username || currentUser?.username || '',
            phoneNumber: data.profile.phoneNumber,
            address: data.profile.address
          });
          
          // Uppdatera även localStorage
          const updatedUser = {
            ...currentUser,
            email: data.profile.email,
            phoneNumber: data.profile.phoneNumber,
            address: data.profile.address
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error('Kunde inte hämta ordrar:', err);
      // Visa inte error - vi har fortfarande profilinfo från localStorage
    } finally {
      setLoading(false);
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

  const handleCancelOrder = async (orderId: string) => {
    if (!userId) return;

    const confirmed = window.confirm('Är du säker på att du vill avbryta denna beställning?');
    if (!confirmed) return;

    try {
      setCancellingOrderId(orderId);
      await cancelOrder(orderId, userId);
      
      // Uppdatera order-listan lokalt
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      alert('Beställningen har avbrutits');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kunde inte avbryta beställningen';
      alert(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleEditOrder = (orderId: string, currentOrder: any) => {
    setEditingOrderId(orderId);
    setEditingOrderItems(currentOrder);
  };

  const handleEditOrderClose = () => {
    setEditingOrderId(null);
    setEditingOrderItems([]);
  };

  const handleEditOrderSuccess = () => {
    // Uppdatera order-listan efter redigering
    fetchOrders();
  };

  const handleStartEditProfile = () => {
    setEditFormData(profile);
    setIsEditingProfile(true);
    setProfileMessage(null);
  };

  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  //  ----------------------------------------START OF FETCH 2--------------------------------------------
  const handleSaveProfile = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      // const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
      const response = await fetchWithApiKey(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editFormData.email,
          phoneNumber: editFormData.phoneNumber,
          address: editFormData.address
        })
      });

      if (!response.ok) {
        throw new Error('Kunde inte uppdatera profil');
      }
      //-----------------------------------------END OF FETCH 2--------------------------------------------

      // Uppdatera profileData state med nya värdena
      setProfileData(prev => prev ? {
        ...prev,
        email: editFormData.email || prev.email,
        phoneNumber: editFormData.phoneNumber || prev.phoneNumber,
        address: editFormData.address || prev.address
      } : null);

      // Uppdatera även localStorage
      const updatedUser = {
        ...currentUser,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        address: editFormData.address
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setProfileMessage({
        text: 'Profil uppdaterad!',
        type: 'success'
      });
      setIsEditingProfile(false);
      
      // Hämta alla data från backend för att säkerställa synkronisering
      setTimeout(() => fetchOrders(), 1000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileMessage({
        text: 'Kunde inte uppdatera profil. Försök igen.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditFormData({});
    setProfileMessage(null);
  };

  	// Logga ut-knapp visas om användaren är inloggad
	const handleLogout = () => {
		localStorage.removeItem('currentUser');
		localStorage.removeItem('user');
		window.location.reload();
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
          <button className="edit-profile-btn" onClick={handleStartEditProfile}>
            Redigera profil
          </button>
          <button	className="profile__logout-btn" onClick={handleLogout}>
								Logga ut
					</button>
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
                      className={`order-status status-${order.status || 'default'}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="order-items">
                      {order.order?.map((item, index) => (
                        <span key={index} className="order-item-name">
                          {item.quantity} x {item.name}
                        </span>
                      ))}
                    </div>
                    <div className="order-meta">
                      <span className="order-total">{order.totalPrice} kr</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button
                        className="edit-order-btn"
                        onClick={() => handleEditOrder(order.orderId, order.order)}
                        disabled={editingOrderId === order.orderId}
                      >
                        {editingOrderId === order.orderId ? 'Redigerar...' : 'Ändra beställning'}
                      </button>
                      <button
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order.orderId)}
                        disabled={cancellingOrderId === order.orderId}
                      >
                        {cancellingOrderId === order.orderId ? 'Avbryter...' : 'Ångra beställning'}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Edit Order Modal */}
        {editingOrderId && (
          <EditOrderModal
            isOpen={!!editingOrderId}
            orderId={editingOrderId}
            currentItems={editingOrderItems}
            onClose={handleEditOrderClose}
            onSuccess={handleEditOrderSuccess}
          />
        )}

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="modal-backdrop" onClick={handleCancelEditProfile}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Redigera profil</h2>
              {profileMessage && (
                <div className={`message message--${profileMessage.type}`}>
                  {profileMessage.text}
                </div>
              )}
              <form className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleEditProfileChange}
                    placeholder="Email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-phone">Telefonnummer</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phoneNumber"
                    value={editFormData.phoneNumber || ''}
                    onChange={handleEditProfileChange}
                    placeholder="Telefonnummer"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-address">Adress</label>
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleEditProfileChange}
                    placeholder="Adress"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Sparar...' : 'Spara'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCancelEditProfile}
                    disabled={isSaving}
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

/* Författare: Tim */
/* Visar användarprofil med orderhistorik och möjlighet att avbryta pending orders, kan även ändra order innan den accepteras*/
/* edit :tim 
edit profile , telefonnummer adress och email */
/* Felicia byta amout till quantity */
// Helene edit: added fetch with API_KEY
// Felicia: la till logout knapp