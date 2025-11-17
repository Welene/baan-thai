import React from 'react';
import './CheckoutPage.css';

function CheckoutPage() {
	return (
		<>
			<section className="checkout-wrapper">
				<section className="hero-section">
					<img
						src=""
						alt="Picture of thai food"
						className="hero-section__img"
					/>
				</section>

				<section className="checkout-section">
					<section className="order-section">
						<article className="delivery-method">
							<label>
								<input
									className="delivery-method__pickup"
									type="radio"
									name="delivery"
								/>
								Avhämtning
							</label>
						</article>

						<article className="pickup-time">
							<label>
								<input
									className="pickup-time__now"
									type="radio"
									name="pickupTime"
								/>
								Direkt
							</label>

							<label>
								<input
									className="pickup-time__later"
									type="radio"
									name="pickupTime"
								/>
								Senare
							</label>
						</article>

						<article className="customer-info">
							<label>
								Namn:
								<input
									className="customer-info__name"
									type="text"
								/>
							</label>

							<label>
								Telefonnummer:
								<input
									className="customer-info__phone"
									type="text"
								/>
							</label>

							<label>
								E-post:
								<input
									className="customer-info__mail"
									type="text"
								/>
							</label>
							<p className="customer-info__notice">
								Ordrebekräftelse skickas till din angivna
								e-postadress
							</p>
						</article>

						<article className="payment-method">
							<label>
								<input
									className="payment-method__swish"
									type="radio"
									name="payment"
								/>
								Swish
							</label>

							<label>
								<input
									className="payment-method__card"
									type="radio"
									name="payment"
								/>
								Card
							</label>
						</article>
					</section>
				</section>
			</section>
		</>
	);
	// import footer here
}

export default CheckoutPage;
