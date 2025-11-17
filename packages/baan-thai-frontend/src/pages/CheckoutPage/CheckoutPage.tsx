import React from 'react';
import './CheckoutPage.css';

function CheckoutPage() {
	return (
		<>
			<section className="checkout-wrapper">
				<section className="hero-section"></section>

				<hr className="divider" />
				<h1 className="checkout-wrapper__heading">DIN BESTÄLLNING</h1>
				<hr className="divider" />

				<section className="checkout-section">
					<section className="order-section">
						{/* PICKUP TYPE SECTION */}
						{/* Kanske vi tar bort denna, sedan det endast er take away anyway? Och ha en text som säger "Välg blablabla för avhämtning blablabla"?  */}
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
						<article className="customer-info">
							<label className="text-label">
								Namn:
								<input
									className="customer-info__name"
									type="text"
								/>
							</label>

							<label className="text-label">
								Telefonnummer:
								<input
									className="customer-info__phone"
									type="text"
								/>
							</label>

							<label className="text-label">
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

						{/* PAYMENT SECTION */}
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
					<section className="confirm-order__section">
						<article className="confirm-article">
							<h2 className="confirm-article__heading">
								Du är nästan klar!
							</h2>
							{/* SUMMERING mini-section*/}
							<section className="confirm-group">
								<hr className="divider" />
								<h3 className="confirm-article__sub-heading">
									Summering
								</h3>
								<hr className="divider" />
								{/* dynamic txt here */}
								<p className="PLACEHOLDER-TXT-FOR-SPACING">
									HALLO DETTE ER LITT SPACE
								</p>
							</section>

							{/*  TYPE + DATE mini-section */}
							<section className="confirm-group">
								<hr className="divider" />
								<p className="confirm-article__type">Type</p>
								{/* dynamic type here */}
								<p className="confirm-article__date">Datum</p>
								{/* dynamic date here */}
								<hr className="divider" />
							</section>

							{/*  CAMPAIGN CODE INPUT mini-section */}
							<section className="confirm-group">
								<p className="confirm-article__code">
									Kampanjkod
								</p>
								<label className="form-label confirm-article__field-container">
									<input
										className="confirm-article__field"
										type="text"
									/>
								</label>
								<hr className="divider" />
							</section>

							{/*  TOTAL PRICE mini-section */}
							<section className="confirm-group">
								<p className="confirm-article__total">
									Total inkl. moms
								</p>
								{/* dynamic total price here */}
							</section>

							<button className="confirm-article__pay-btn">
								Betala
							</button>
						</article>
					</section>
				</section>
			</section>
		</>
	);
	// import footer here
}

export default CheckoutPage;
