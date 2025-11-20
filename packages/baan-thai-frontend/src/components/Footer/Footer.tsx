import React from 'react';
import './Footer.css';
import GiftCard from '../../assets/giftcard.png';

function Footer() {
	return <>
	<footer className="bottom">
		<section className="gift-section">

			<article className='gift-card'>
				<figure className="gift-card__container">
					<img src={GiftCard} alt="Baan thai gift card" className="gift-card__image" />
				</figure>
				<article className="gift-info__container">
					<h3 className="gift-info__heading">ENKEL ATT GE,<br /> UNDERBART ATT FÅ</h3>
					<p className="gift-info__txt">Ge bort en smakrik upplevelse med ett presentkort från Baan Thaikök.</p>
					<p className="gift-info__txt">Överraska dina nära och kära med en oförglömlig kulinarisk resa till Thailand, utan att behöva lämna stan.</p>
				</article>
			</article>

			<article className='us-info'>
				<article className="open-times">
					<h3 className="open-times__heading">ÖPPETTIDER</h3>
					<p className="open-times__time">MÅNDAG: 11:30 - 20:00</p>
					<p className="open-times__time">TISDAG: 11:30 - 20:00</p>
					<p className="open-times__time">ONSDAG: 11:30 - 20:00</p>
					<p className="open-times__time">TORSDAG: 11:30 - 20:00</p>
					<p className="open-times__time">FREDAG: 11:30 - 20:00</p>
					<p className="open-times__time">LÖRDAG: 11:30 - 20:00</p>
					<p className="open-times__time">SÖNDAG: STÄNGT</p>
					<p className="open-times__time--red">OBS: köket stänger 30 minuter före stängningsdags </p>
				</article>

				<article className="contact">
					<h3 className="contact__heading">KONTAKTA OSS:</h3>
					<address className='contact__adress'>
						<p className='contact__txt'>
							<strong>Baan Thaikök Restaurang</strong><br />
							Kyrkogatan 36<br />
							671 31 Arvika<br />
							Sverige
						</p>
						<p className='contact__txt'>
							Tel: 0570-155 17<br />
							Mobil: 076-019 91 76
						</p>
					</address>
				</article>

				<article className="location">
					<h3 className="location__heading">HITTA HIT:</h3>
					{/* FETCH API KARTA HÄR */}
				</article>
				
			</article>
		</section>
		<section className="info-section"></section>
	</footer>
	</>;
}

export default Footer;

// Författare: Helene
// Footer komponent

// Eventuell buggfix av: *namn-här:
// Vad blev fixad: *skriv vad som (evt) fixades*
