interface PaymentModalProps {
    showModal: boolean;
    loading: boolean;
    error: string;
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    onClose: () => void;
    onCardNumberChange: (value: string) => void;
    onCardNameChange: (value: string) => void;
    onExpiryDateChange: (value: string) => void;
    onCvvChange: (value: string) => void;
    onSubmit: () => void;
}

export function PaymentModal({
    showModal,
    loading,
    error,
    cardNumber,
    cardName,
    expiryDate,
    cvv,
    onClose,
    onCardNumberChange,
    onCardNameChange,
    onExpiryDateChange,
    onCvvChange,
    onSubmit
}: PaymentModalProps) {
    if (!showModal) return null;

    return (
        <div className="payment-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Kortinformation</h2>
                
                <div className="payment-modal__field">
                    <label htmlFor="cardNumber">Kortnummer:</label>
                    <input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => onCardNumberChange(e.target.value)}
                    />
                </div>

                <div className="payment-modal__field">
                    <label htmlFor="cardName">Kortinnehavare:</label>
                    <input
                        id="cardName"
                        type="text"
                        placeholder="Namn på kort"
                        value={cardName}
                        onChange={(e) => onCardNameChange(e.target.value)}
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
                            onChange={(e) => onExpiryDateChange(e.target.value)}
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
                            onChange={(e) => onCvvChange(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="payment-modal__error">{error}</p>}

                <div className="payment-modal__buttons">
                    <button
                        className="payment-modal__button payment-modal__button--cancel"
                        onClick={onClose}
                        type="button"
                    >
                        Avbryt
                    </button>
                    <button
                        className="payment-modal__button payment-modal__button--submit"
                        onClick={onSubmit}
                        disabled={loading}
                        type="button"
                    >
                        {loading ? 'BEARBETAR...' : 'BETALA'}
                    </button>
                </div>
            </div>
        </div>
    );
}


// Create: Sunsanee