import React from 'react';
import './CheckoutPage.css';
import Delivery from '../../assets/delivery.png';
import Pay from '../../assets/pay.png';
import Edit from '../../assets/edit.png';
import Clock from '../../assets/clock.png';
import Hero from '../../assets/hero-img.png';
import { MenuPageProps } from '../../interfaces/menuProps';
import Cart from '../../components/Cart/Cart';

function CheckoutPage({ cartItems, setCartItems, currentUser }: MenuPageProps) {
	return (
		<>
			<section className="checkout-wrapper">
				<section
					className="hero-section"
					style={
						{
							backgroundImage: `url(${Hero})`,
						} as React.CSSProperties
					}></section>

				<hr className="divider--h1" />
				<h1 className="checkout-wrapper__heading">DIN BESTÄLLNING</h1>
				<hr className="divider--h1" />

				<section className="checkout-section">
					<section className="order-section">
						{/* PICKUP TYPE SECTION */}
						{/* Kanske vi tar bort denna, sedan det endast er take away anyway? Och ha en text som säger "Välg blablabla för avhämtning blablabla"?  */}
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
								/>
								Direkt
							</label>

							<label className="radio-label">
								<input
									className="pickup-time__later"
									type="radio"
									name="pickupTime"
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
								/>
							</label>

							<label className="text-label">
								Telefonnummer:
								<input
									className="customer-info__phone"
									type="text"
									placeholder="Ditt telefonnummer"
								/>
							</label>

							<label className="text-label">
								E-post:
								<input
									className="customer-info__mail"
									type="text"
									placeholder="Ditt e-mejl"
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
								/>
								Swish
							</label>

							<label className="radio-label">
								<input
									className="payment-method__card"
									type="radio"
									name="payment"
								/>
								Card
							</label>
						</article>
					</section>

					{/* CONFIRM ORDER SECTION */}
					<div className="checkout-cart-container">
						<Cart
							cartItems={cartItems}
							setCartItems={setCartItems}
							onClose={() => {}}
							user={currentUser}
							mode="inline"
							isCheckoutPage={true}
						/>
					</div>
				</section>
			</section>
		</>
	);
}

export default CheckoutPage;

/* Författare: Helene */
/* CSS för betalningssida/min bästllning */

/* Changes made by: */
/* Changes that were made: */
