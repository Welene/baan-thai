interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    code: string;
}

interface OrderSummaryProps {
    cartItems: CartItem[];
    deliveryMethod: string;
    pickupTime: string;
    totalPrice: number;
    loading: boolean;
    error: string;
    onPayment: () => void;
}

export function OrderSummary({
    cartItems,
    deliveryMethod,
    pickupTime,
    totalPrice,
    loading,
    error,
    onPayment
}: OrderSummaryProps) {
    return (
        <section className="confirm-order__section">
            <article className="confirm-article">
                <h2 className="confirm-article__heading">
                    Du är nästan klar!
                </h2>
                
                {/* SUMMERING */}
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

                {/* TYPE + DATE */}
                <section className="confirm-group2">
                    <hr className="divider" />
                    <p className="confirm-article__type">
                        Type: {deliveryMethod === 'pickup' ? 'Avhämtning' : 'Leverans'}
                    </p>
                    <p className="confirm-article__date">
                        Tid: {pickupTime === 'now' ? 'Direkt (~20 min)' : 'Senare'}
                    </p>
                    <hr className="divider" />
                </section>

                <hr className="divider" />
                
                {/* TOTAL PRICE */}
                <section className="confirm-group4">
                    <p className="confirm-article__total">
                        Total inkl. moms: {totalPrice} kr
                    </p>
                </section>

                {error && <p className="payment-modal__error">{error}</p>}

                <button
                    className="confirm-article__pay-btn"
                    onClick={onPayment}
                    disabled={loading || cartItems.length === 0}
                >
                    {loading ? 'BEARBETAR...' : `BETALA ${totalPrice} KR`}
                </button>
            </article>
        </section>
    );
}

// Author: Helene

// Edit: added payment modal --> WHO? WRITE HERE