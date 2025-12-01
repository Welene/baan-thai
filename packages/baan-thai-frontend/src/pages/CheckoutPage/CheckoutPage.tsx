import { useState } from 'react';
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

interface CheckoutPageProps {
    cartItems: Array<{ id: number; name: string; price: number; quantity: number; code: string }>;
}

function CheckoutPage({ cartItems = [] }: CheckoutPageProps) {
    const [deliveryMethod] = useState('pickup');
    
    // Custom hooks
    const {
        name, setName,
        phone, setPhone,
        email, setEmail,
        pickupTime, setPickupTime,
        paymentMethod, setPaymentMethod,
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
                paymentMethod
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
                paymentMethod
            },
            validateCardInfo
        );
    };

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
                onClose={() => setShowConfirmation(false)}
                onRetry={() => {
                    setShowConfirmation(false);
                    setError('');
                }}
            />

            <section className="checkout-wrapper">
                <section className="hero-section"></section>
                <hr className="divider--h1" />
                <h1 className="checkout-wrapper__heading">DIN BESTÄLLNING</h1>
                <hr className="divider--h1" />

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
                                <input
                                    className="delivery-method__pickup"
                                    type="radio"
                                    name="delivery"
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

/* Changes made by: Sunsanee */
/* Refactored with custom hooks and separate components */
