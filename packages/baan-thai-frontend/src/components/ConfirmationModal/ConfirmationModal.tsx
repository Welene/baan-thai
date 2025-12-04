interface ConfirmationModalProps {
    showModal: boolean;
    success: boolean;
    orderId: string;
    totalPrice: number;
    paymentMethod: 'swish' | 'card';
    email: string;
    error: string;
    comment?: string;
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
    comment,
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
                            <p><strong>Beställd:</strong> {new Date().toLocaleString('sv-SE', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                            {comment && <p><strong>Kommentar:</strong> {comment}</p>}
                        </div>
                        <p className="confirmation-note">
                            En bekräftelse har skickats till {email}
                        </p>
                        <button
                            className="payment-modal__button payment-modal__button--submit"
                            onClick={() => window.location.href = '/profile'}
                            type="button"
                        >
                            Se Min Beställning
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
