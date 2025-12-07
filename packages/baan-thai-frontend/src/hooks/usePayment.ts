import { useState } from 'react';
import { createOrder } from '../services/paymentService';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    code: string;
}

interface PaymentData {
    name: string;
    phone: string;
    email: string;
    cartItems: CartItem[];
    totalPrice: number;
    deliveryMethod: string;
    pickupTime: string;
    paymentMethod: 'swish' | 'card';
    comment?: string;
}

export function usePayment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const processPayment = async (data: PaymentData) => {
        setLoading(true);
        setError('');

        try {
            // Hämta inloggad användare från localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            const userId = currentUser?.userId || 'guest';

            // Skapa order data för backend
            const orderData = {
                userId: userId,
                firstName: data.name.split(' ')[0],
                lastName: data.name.split(' ').slice(1).join(' ') || data.name,
                email: data.email,
                phoneNumber: parseInt(data.phone.replace(/\D/g, '')) || 0,
                message: data.comment 
                    ? `${data.deliveryMethod === 'pickup' ? 'Avhämtning' : 'Leverans'} - ${data.pickupTime === 'now' ? 'Direkt' : 'Senare'} | Kommentar: ${data.comment}`
                    : `${data.deliveryMethod === 'pickup' ? 'Avhämtning' : 'Leverans'} - ${data.pickupTime === 'now' ? 'Direkt' : 'Senare'}`,
                paymentStatus: 'paid' as const,
                order: data.cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // Skicka till backend
            const orderResult = await createOrder(orderData);

            if (!orderResult.success) {
                throw new Error('Kunde inte skapa order');
            }

            console.log('Order result:', orderResult);
            setOrderId(orderResult.order.orderId || orderResult.orderId || 'N/A');
            
            // Simulera kort fördröjning för realistisk känsla
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPaymentSuccess(true);
            setShowConfirmation(true);
            setLoading(false);

        } catch (err: any) {
            console.error('Payment error:', err);
            setPaymentSuccess(false);
            setShowConfirmation(true);
            setError(err.message || 'Kunde inte ansluta till servern');
            setLoading(false);
        }
    };

    const handlePayment = async (data: PaymentData, validateCustomerInfo: () => boolean) => {
        if (!validateCustomerInfo()) {
            setError('Vänligen fyll i alla fält');
            return;
        }

        if (data.cartItems.length === 0) {
            setError('Din varukorg är tom');
            return;
        }

        setError('');

        // If card payment, show card modal
        if (data.paymentMethod === 'card') {
            setShowPaymentModal(true);
            return;
        }

        // If Swish, process directly
        await processPayment(data);
    };

    const handleCardPayment = async (data: PaymentData, validateCardInfo: () => boolean) => {
        if (!validateCardInfo()) {
            setError('Vänligen fyll i all kortinformation');
            return;
        }

        setShowPaymentModal(false);
        await processPayment(data);
    };

    const resetPaymentState = () => {
        setLoading(false);
        setError('');
        setShowPaymentModal(false);
        setShowConfirmation(false);
        setPaymentSuccess(false);
        setOrderId('');
    };

    return {
        loading,
        error,
        showPaymentModal,
        showConfirmation,
        paymentSuccess,
        orderId,
        setShowPaymentModal,
        setShowConfirmation,
        setError,
        handlePayment,
        handleCardPayment,
        resetPaymentState
    };
}

/* Create by: Sunsanee */
/* Changes made by: Tim */
/* customer comment added*/