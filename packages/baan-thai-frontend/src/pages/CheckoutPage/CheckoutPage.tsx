
import { useState } from 'react';
import './CheckoutPage.css';
import Delivery from '../../assets/delivery.png';
import Pay from '../../assets/pay.png';
import Edit from '../../assets/edit.png';
import Clock from '../../assets/clock.png';

interface CheckoutPageProps {
    cartItems: Array<{ id: number; name: string; price: number; quantity: number; code: string }>;
}

function CheckoutPage({ cartItems = [] }: CheckoutPageProps) {
    const [deliveryMethod] = useState('pickup');
    const [pickupTime, setPickupTime] = useState('now');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'swish' | 'card'>('swish');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
   
    // Card info state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePayment = async () => {
        // Validate form
        if (!name || !phone || !email) {
            setError('Vänligen fyll i alla fält');
            return;
        }

        if (cartItems.length === 0) {
            setError('Din varukorg är tom');
            return;
        }

        setError('');

        // If card payment, show card modal
        if (paymentMethod === 'card') {
            console.log('Card payment selected, showing modal');
            setShowPaymentModal(true);
            return;
        }

        // If Swish, process directly
        await processPayment();
    };

    const processPayment = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Create order med paymentStatus satt till 'paid'
            const orderResponse = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: `ORDER-${Date.now()}`,
                    firstName: name.split(' ')[0],
                    lastName: name.split(' ').slice(1).join(' ') || name,
                    email: email,
                    phoneNumber: parseInt(phone.replace(/\D/g, '')),
                    order: cartItems.map(item => ({
                        productId: item.id,
                        amount: item.quantity,
                        price: item.price,
                        name: item.name
                    })),
                    totalPrice: totalPrice,
                    message: `${deliveryMethod === 'pickup' ? 'Avhämtning' : 'Leverans'} - ${pickupTime === 'now' ? 'Direkt' : 'Senare'}`,
                    payment: [{ paymentType: paymentMethod }],
                    paymentStatus: 'paid' // Mock: betalning godkänd direkt
                })
            });

            const orderResult = await orderResponse.json();

            if (!orderResult.success) {
                throw new Error('Kunde inte skapa order');
            }

            const orderIdValue = orderResult.order.id;
            setOrderId(orderIdValue);

            // 2. Simulera kort fördröjning för realistisk känsla
            await new Promise(resolve => setTimeout(resolve, 1000));
           
            // 3. Visa success modal direkt
            setPaymentSuccess(true);
            setShowConfirmation(true);
            setLoading(false);

        } catch (err: any) {
            console.error('Payment error:', err);
            setPaymentSuccess(false);
            setShowConfirmation(true);
            setError(err.message || 'Något gick fel vid betalning');
            setLoading(false);
        }
    };

    const handleCardPayment = async () => {
        // Validate card info
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            setError('Vänligen fyll i all kortinformation');
            return;
        }

        // Close modal and process payment
        setShowPaymentModal(false);
        await processPayment();
    };
    return (
        <>
            {/* Card Payment Modal */}
            {showPaymentModal && (
                <div
                    className="payment-overlay"
                    onClick={() => setShowPaymentModal(false)}
                >
                    <div
                        className="payment-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Kortinformation</h2>
                       
                        <div className="payment-modal__field">
                            <label htmlFor="cardNumber">Kortnummer:</label>
                            <input
                                id="cardNumber"
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>

                        <div className="payment-modal__field">
                            <label htmlFor="cardName">Kortinnehavare:</label>
                            <input
                                id="cardName"
                                type="text"
                                placeholder="Namn på kort"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                            />
                        </div>

                        <div className="payment-modal__row">
                            <div className="payment-modal__field">
                                <label htmlFor="expiryDate">Utgångsdatum:</label>
                                <input
                                    id="expiryDate"
                                    type="text"
                                    placeholder="MM/ÅÅ"
                                    maxLength={5}
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                            <div className="payment-modal__field">
                                <label htmlFor="cvv">CVV:</label>
                                <input
                                    id="cvv"
                                    type="text"
                                    placeholder="123"
                                    maxLength={3}
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <p className="payment-modal__error">{error}</p>}

                        <div className="payment-modal__buttons">
                            <button
                                className="payment-modal__button payment-modal__button--cancel"
                                onClick={() => setShowPaymentModal(false)}
                                type="button"
                            >
                                Avbryt
                            </button>
                            <button
                                className="payment-modal__button payment-modal__button--submit"
                                onClick={handleCardPayment}
                                disabled={loading}
                                type="button"
                            >
                                {loading ? 'BEARBETAR...' : 'BETALA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Confirmation Modal */}
            {showConfirmation && (
                <div className="payment-overlay">
                    <div className="payment-modal confirmation-modal">
                        {paymentSuccess ? (
                            <>
                                <div className="confirmation-icon confirmation-icon--success">✓</div>
                                <h2>Betalning Genomförd!</h2>
                                <p className="confirmation-message">
                                    Din beställning har tagits emot och betalningen är genomförd.
                                </p>
                                <div className="confirmation-details">
                                    <p><strong>Ordernummer:</strong> {orderId}</p>
                                    <p><strong>Totalsumma:</strong> {totalPrice} kr</p>
                                    <p><strong>Betalmetod:</strong> {paymentMethod === 'card' ? 'Kort' : 'Swish'}</p>
                                </div>
                                <p className="confirmation-note">
                                    En bekräftelse har skickats till {email}
                                </p>
                                <button
                                    className="payment-modal__button payment-modal__button--submit"
                                    onClick={() => window.location.href = '/menu'}
                                    type="button"
                                >
                                    Tillbaka till Menyn
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="confirmation-icon confirmation-icon--error">✗</div>
                                <h2>Betalning Misslyckades</h2>
                                <p className="confirmation-message">
                                    Något gick fel vid betalningen. Vänligen försök igen.
                                </p>
                                {error && <p className="payment-modal__error">{error}</p>}
                                <div className="payment-modal__buttons">
                                    <button
                                        className="payment-modal__button payment-modal__button--cancel"
                                        onClick={() => setShowConfirmation(false)}
                                        type="button"
                                    >
                                        Stäng
                                    </button>
                                    <button
                                        className="payment-modal__button payment-modal__button--submit"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setError('');
                                        }}
                                        type="button"
                                    >
                                        Försök Igen
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        <section className="checkout-wrapper">
            <section className="hero-section"></section>                <hr className="divider--h1" />
                <h1 className="checkout-wrapper__heading">DIN BESTÄLLNING</h1>
                <hr className="divider--h1" />

                <section className="checkout-section">
                    <section className="order-section">
                        {/* PICKUP TYPE SECTION */}
                        {/* Kanske vi tar bort denna, sedan det endast er take away anyway? Och ha en text som säger "Välg blablabla för avhämtning blablabla"?  */}
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
                                    alt="Delivery icon"
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
                        <div className="icontxt-container">
                            <figure className="order-section__icon">
                                <img
                                    className="order-section__img"
                                    src={Edit}
                                    alt="Delivery icon"
                                />
                            </figure>
                            <h2 className="order-section__heading">
                                Dina uppgifter
                            </h2>
                        </div>
                        <article className="customer-info">
                            <label className="text-label">
                                Namn:
                                <input
                                    className="customer-info__name"
                                    type="text"
                                    placeholder="Förnamn & efternamn"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="text-label">
                                Telefonnummer:
                                <input
                                    className="customer-info__phone"
                                    type="tel"
                                    placeholder="Ditt telefonnummer"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="text-label">
                                E-post:
                                <input
                                    className="customer-info__mail"
                                    type="email"
                                    placeholder="Ditt e-mejl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>
                            <p className="customer-info__notice">
                                Ordrebekräftelse skickas till din angivna
                                e-postadress
                            </p>
                        </article>

                        {/* PAYMENT SECTION */}
                        <div className="icontxt-container">
                            <figure className="order-section__icon">
                                <img
                                    className="order-section__img"
                                    src={Pay}
                                    alt="Delivery icon"
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
                    <section className="confirm-order__section">
                        <article className="confirm-article">
                            <h2 className="confirm-article__heading">
                                Du är nästan klar!
                            </h2>
                            {/* SUMMERING mini-section*/}
                            <section className="confirm-group1">
                                <hr className="divider" />
                                <h3 className="confirm-article__sub-heading">
                                    Summering
                                </h3>
                            <hr className="divider" />
                            {cartItems.map((item) => (
                                <p key={item.id} className="cart-item-text">
                                    {item.quantity}x {item.name} - {item.price * item.quantity} kr
                                </p>
                            ))}
                                {cartItems.length === 0 && <p>Varukorgen är tom</p>}
                            </section>

                            {/*  TYPE + DATE mini-section */}
                            <section className="confirm-group2">
                                <hr className="divider" />
                                <p className="confirm-article__type">Type: {deliveryMethod === 'pickup' ? 'Avhämtning' : 'Leverans'}</p>
                                <p className="confirm-article__date">Tid: {pickupTime === 'now' ? 'Direkt (~20 min)' : 'Senare'}</p>
                                <hr className="divider" />
                            </section>

                        {/*  CAMPAIGN CODE INPUT mini-section */}
                        <section className="confirm-group3">
                            <label className="form-label confirm-article__field-container">
                                <span className="confirm-article__code">Kampanjkod</span>
                                <input
                                    className="confirm-article__field"
                                    type="text"
                                    placeholder="Ange kod"
                                    aria-label="Kampanjkod"
                                />
                            </label>
                        </section>
                        <hr className="divider" />                          {/*  TOTAL PRICE mini-section */}
                            <section className="confirm-group4">
                                <p className="confirm-article__total">
                                    Total inkl. moms: {totalPrice} kr
                                </p>
                            </section>

                            {error && (<p>{error}</p>)}

                            <button
                                className="confirm-article__pay-btn"
                                onClick={handlePayment}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? 'BEARBETAR...' : `BETALA ${totalPrice} KR`}
                            </button>
                        </article>
                    </section>
                </section>
            </section>
        </>
    );
}

export default CheckoutPage;


/* Changes made by: Sunsanee */
/* Changes that were made: */
