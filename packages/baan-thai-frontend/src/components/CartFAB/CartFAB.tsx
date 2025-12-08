import './CartFAB.css';
import basketIcon from '../../assets/basket.png';

interface CartFABProps {
    itemCount: number;
    onClick: () => void;
}

function CartFAB({ itemCount, onClick }: CartFABProps) {
    return (
        <button className="cart-fab" onClick={onClick} aria-label="Open cart">
            <img src={basketIcon} alt="Cart" className="cart-fab__icon" />
            {itemCount > 0 && (
                <span className="cart-fab__badge">{itemCount}</span>
            )}
        </button>
    );
}

export default CartFAB;

// Create by: Sunsanee
