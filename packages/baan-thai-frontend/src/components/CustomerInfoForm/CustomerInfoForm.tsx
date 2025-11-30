import Edit from '../../assets/edit.png';

interface CustomerInfoFormProps {
    name: string;
    phone: string;
    email: string;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onEmailChange: (value: string) => void;
}

export function CustomerInfoForm({
    name,
    phone,
    email,
    onNameChange,
    onPhoneChange,
    onEmailChange
}: CustomerInfoFormProps) {
    return (
        <>
            <div className="icontxt-container">
                <figure className="order-section__icon">
                    <img
                        className="order-section__img"
                        src={Edit}
                        alt="Edit icon"
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
                        onChange={(e) => onNameChange(e.target.value)}
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
                        onChange={(e) => onPhoneChange(e.target.value)}
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
                        onChange={(e) => onEmailChange(e.target.value)}
                        required
                    />
                </label>
                <p className="customer-info__notice">
                    Ordrebekräftelse skickas till din angivna e-postadress
                </p>
            </article>
        </>
    );
}
