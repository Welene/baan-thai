import { useState, useEffect } from 'react';
import { editOrder } from '../../services/paymentService';
import './EditOrderModal.css';

interface EditOrderModalProps {
  isOpen: boolean;
  orderId: string;
  currentItems: any[];
  onClose: () => void;
  onSuccess: () => void;
}

interface MenuItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export function EditOrderModal({ isOpen, orderId, currentItems, onClose, onSuccess }: EditOrderModalProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentItems) {
      setItems(currentItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));
      setError(null);
    }
  }, [isOpen, currentItems]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newItems = [...items];
    newItems[index].quantity = newQuantity;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Beställningen måste innehålla minst en vara');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const orderData = {
        order: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      await editOrder(orderId, orderData);
      
      alert('Beställningen har uppdaterats!');
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte uppdatera beställningen';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="edit-order-modal-overlay" onClick={onClose}>
      <div className="edit-order-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-order-modal-header">
          <h2>Redigera beställning #{orderId}</h2>
          <button className="edit-order-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="edit-order-modal-error">{error}</div>}

        <div className="edit-order-modal-content">
          <table className="edit-order-table">
            <thead>
              <tr>
                <th>Vara</th>
                <th>Pris</th>
                <th>Mängd</th>
                <th>Summa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="edit-order-item-name">{item.name}</td>
                  <td className="edit-order-item-price">{item.price} kr</td>
                  <td className="edit-order-item-quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      disabled={isLoading}
                      className="edit-order-quantity-input"
                    />
                  </td>
                  <td className="edit-order-item-total">{(item.price * item.quantity).toFixed(0)} kr</td>
                  <td>
                    <button
                      className="edit-order-remove-btn"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isLoading}
                      title="Ta bort vara"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="edit-order-total-row">
                <td colSpan={3} className="edit-order-total-label">Totalt:</td>
                <td className="edit-order-total-price">{totalPrice.toFixed(0)} kr</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="edit-order-modal-footer">
          <button
            className="edit-order-modal-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Avbryt
          </button>
          <button
            className="edit-order-modal-save-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>
    </div>
  );
}


/* Author: Tim 
Tar emot aktuell beställning (currentItems) och uppdaterar den utan att gå igenom hela checkout-processen. */