import { useState, useEffect } from 'react';
import './CheckoutPage.css';
import Delivery from '../../assets/delivery.png';
import Pay from '../../assets/pay.png';
import Clock from '../../assets/clock.png';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
import { usePayment } from '../../hooks/usePayment';
import { PaymentModal } from '../../components/PaymentModal/PaymentModal';
import { ConfirmationModal } from '../../components/ConfirmationModal/ConfirmationModal';
import { CustomerInfoForm } from '../../components/CustomerInfoForm/CustomerInfoForm';
import { OrderSummary } from '../../components/OrderSummary/OrderSummary';
import { User } from '../../interfaces/user';
import HeroImg from '../../assets/hero-img-blur.png';

interface CheckoutPageProps {
    cartItems: Array<{ id: number; name: string; price: number; quantity: number; code: string }>;
    currentUser: User | null;
}

function CheckoutPage({ currentUser, cartItems = [] }: CheckoutPageProps) {
    // const [deliveryMethod] = useState('pickup');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // ny för default value, starts with pickup
    
    // Custom hooks
    const {
        name, setName,
        phone, setPhone,
        email, setEmail,
        pickupTime, setPickupTime,
        paymentMethod, setPaymentMethod,
        comment, setComment,
        cardNumber, setCardNumber,
        cardName, setCardName,
        expiryDate, setExpiryDate,
        cvv, setCvv,
        validateCustomerInfo,
        validateCardInfo
    } = useCheckoutForm();

    const {
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
        handleCardPayment
    } = usePayment();

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const onPaymentClick = () => {
        handlePayment(
            {
                name,
                phone,
                email,
                cartItems,
                totalPrice,
                deliveryMethod,
                pickupTime,
                paymentMethod,
                comment
            },
            validateCustomerInfo
        );
    };

    const onCardPaymentSubmit = () => {
        handleCardPayment(
            {
                name,
                phone,
                email,
                cartItems,
                totalPrice,
                deliveryMethod,
                pickupTime,
                paymentMethod,
                comment
            },
            validateCardInfo
        );
    };

    useEffect(() => {
    if (currentUser) {
        if (currentUser.name) setName(currentUser.name);
        if (currentUser.phoneNumber) setPhone(currentUser.phoneNumber);
        if (currentUser.email) setEmail(currentUser.email);
    }
}, [currentUser]); 

    return (
        <>
            {/* Card Payment Modal */}
            <PaymentModal
                showModal={showPaymentModal}
                loading={loading}
                error={error}
                cardNumber={cardNumber}
                cardName={cardName}
                expiryDate={expiryDate}
                cvv={cvv}
                onClose={() => setShowPaymentModal(false)}
                onCardNumberChange={setCardNumber}
                onCardNameChange={setCardName}
                onExpiryDateChange={setExpiryDate}
                onCvvChange={setCvv}
                onSubmit={onCardPaymentSubmit}
            />

            {/* Order Confirmation Modal */}
            <ConfirmationModal
                showModal={showConfirmation}
                success={paymentSuccess}
                orderId={orderId}
                totalPrice={totalPrice}
                paymentMethod={paymentMethod}
                email={email}
                error={error}
                comment={comment}
                onClose={() => setShowConfirmation(false)}
                onRetry={() => {
                    setShowConfirmation(false);
                    setError('');
                }}
            />

            <section className="checkout-wrapper">
                <section
                    className="hero-section"
                    style={{ backgroundImage: `url(${HeroImg})` }}
                >
                    <div className="hero-section__heading">
                        <h1 className="hero-section__txt">
                            DIN BESTÄLLNING
                        </h1>
                    </div>
                </section>

                <section className="checkout-section">
                    <section className="order-section">
                        {/* PICKUP TYPE SECTION */}
                        <div className="icontxt-container">
                            <figure className="order-section__icon">
                                <img
                                    className="order-section__img"
                                    src={Delivery}
                                    alt="Delivery icon"
                                />
                            </figure>
                            <h2 className="order-section__heading">
                                Leveranssätt
                            </h2>
                        </div>
                        <article className="delivery-method">
                            <label className="radio-label">
                                <input // default value (avhämtning) is already checked
                                    className="delivery-method__pickup"
                                    type="radio"
                                    name="delivery"
                                    value="pickup" // we give this input field the value PICKUP
                                    checked={deliveryMethod === 'pickup'} // cheking if deliveryMethod is PICKUP
                                    onChange={(e) => setDeliveryMethod(e.target.value)} // can still change delivery method -- if we add more buttons soon/later
                                />
                                Avhämtning
                            </label>
                        </article>

                        {/* PICKUP TIME SECTION */}
                        <div className="icontxt-container">
                            <figure className="order-section__icon">
                                <img
                                    className="order-section__img"
                                    src={Clock}
                                    alt="Clock icon"
                                />
                            </figure>
                            <h2 className="order-section__heading">
                                Upphämtningstid
                            </h2>
                        </div>
                        <article className="pickup-time">
                            <label className="radio-label">
                                <input
                                    className="pickup-time__now"
                                    type="radio"
                                    name="pickupTime"
                                    value="now"
                                    checked={pickupTime === 'now'}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                />
                                Direkt
                            </label>

                            <label className="radio-label">
                                <input
                                    className="pickup-time__later"
                                    type="radio"
                                    name="pickupTime"
                                    value="later"
                                    checked={pickupTime === 'later'}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                />
                                Senare
                            </label>
                        </article>

                        {/* CUSTOMER INFO SECTION */}
                        <CustomerInfoForm
                            name={name}
                            phone={phone}
                            email={email}
                            onNameChange={setName}
                            onPhoneChange={setPhone}
                            onEmailChange={setEmail}
                        />

                        {/* COMMENT SECTION */}
                        <div className="comment-section">
                            <label htmlFor="order-comment" className="comment-section__label">
                                Kommentar till beställningen (valfritt)
                            </label>
                            <textarea
                                id="order-comment"
                                className="comment-section__textarea"
                                placeholder="T.ex. allergier, specialönskemål..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                maxLength={500}
                            />
                            <span className="comment-section__counter">
                                {comment.length}/500
                            </span>
                        </div>

                        {/* PAYMENT SECTION */}
                        <div className="icontxt-container">
                            <figure className="order-section__icon">
                                <img
                                    className="order-section__img"
                                    src={Pay}
                                    alt="Payment icon"
                                />
                            </figure>
                            <h2 className="order-section__heading">
                                Betalning
                            </h2>
                        </div>
                        <article className="payment-method">
                            <label className="radio-label">
                                <input
                                    className="payment-method__swish"
                                    type="radio"
                                    name="payment"
                                    value="swish"
                                    checked={paymentMethod === 'swish'}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'swish' | 'card')}
                                />
                                Swish
                            </label>

                            <label className="radio-label">
                                <input
                                    className="payment-method__card"
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'swish' | 'card')}
                                />
                                Card
                            </label>
                        </article>
                    </section>

                    {/* CONFIRM ORDER SECTION */}
                    <OrderSummary
                        cartItems={cartItems}
                        deliveryMethod={deliveryMethod}
                        pickupTime={pickupTime}
                        totalPrice={totalPrice}
                        loading={loading}
                        error={error}
                        onPayment={onPaymentClick}
                    />
                </section>
            </section>
        </>
    );
}

export default CheckoutPage;

// Author: Helene

/* Changes made by: Sunsanee */
/* Refactored with custom hooks and separate components */
// Added payment and confirmation functions

/* Changes made by: Tim */
/* Added customer comment field */