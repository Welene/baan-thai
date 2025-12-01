interface ConfirmationModalProps {
    showModal: boolean;
    success: boolean;
    orderId: string;
    totalPrice: number;
    paymentMethod: 'swish' | 'card';
    email: string;
    error: string;
    onClose: () => void;
    onRetry: () => void;
}

export function ConfirmationModal({
    showModal,
    success,
    orderId,
    totalPrice,
    paymentMethod,
    email,
    error,
    onClose,
    onRetry
}: ConfirmationModalProps) {
    if (!showModal) return null;

    return (
        <div className="payment-overlay">
            <div className="payment-modal confirmation-modal">
                {success ? (
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
                                onClick={onClose}
                                type="button"
                            >
                                Stäng
                            </button>
                            <button
                                className="payment-modal__button payment-modal__button--submit"
                                onClick={onRetry}
                                type="button"
                            >
                                Försök Igen
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
