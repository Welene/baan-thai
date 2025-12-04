import { useState } from 'react';

export function useCheckoutForm() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pickupTime, setPickupTime] = useState('now');
    const [paymentMethod, setPaymentMethod] = useState<'swish' | 'card'>('swish');
    const [comment, setComment] = useState('');
    
    // Card info state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const validateCustomerInfo = (): boolean => {
        return !!(name && phone && email);
    };

    const validateCardInfo = (): boolean => {
        return !!(cardNumber && cardName && expiryDate && cvv);
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setPickupTime('now');
        setPaymentMethod('swish');
        setComment('');
        setCardNumber('');
        setCardName('');
        setExpiryDate('');
        setCvv('');
    };

    return {
        // Customer info
        name,
        setName,
        phone,
        setPhone,
        email,
        setEmail,
        
        // Pickup & payment
        pickupTime,
        setPickupTime,
        paymentMethod,
        setPaymentMethod,
        
        // Comment
        comment,
        setComment,
        
        // Card info
        cardNumber,
        setCardNumber,
        cardName,
        setCardName,
        expiryDate,
        setExpiryDate,
        cvv,
        setCvv,
        
        // Validation
        validateCustomerInfo,
        validateCardInfo,
        resetForm
    };
}
/* Changes made by: Tim */
/* customer comment added */