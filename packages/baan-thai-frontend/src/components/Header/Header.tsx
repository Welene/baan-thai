import React from 'react';
import './Header.css';
import logo from '../../assets/logo.png';
import manIcon from '../../assets/man.png';
import basketIcon from '../../assets/basket.png';
import bellIcon from '../../assets/bell.png';

function Header() {
	return (
		<header className="header">
			<section className="header__logo-section">
				<img
					src={logo}
					alt="Baan Thaikök logo"
					className="header__logo"
				/>
			</section>

			<section className="header__options-section">
				<section className="header__icons">
					<figure className="header__icon">
						<img src={manIcon} alt="Profil ikon" />
					</figure>

					<figure className="header__icon">
						<img src={basketIcon} alt="Handlekurv ikon" />
					</figure>

					<figure className="header__icon">
						<img src={bellIcon} alt="Varsler ikon" />
					</figure>
				</section>

				<section className="header__navigation">
					<nav className="header__nav">
						<ul className="header__nav-list">
							<li className="header__nav-item">Hem</li>
							<li className="header__nav-item">Sushi</li>
							<li className="header__nav-item">Thailändsk mat</li>
							<li className="header__nav-item">Om oss</li>
						</ul>
					</nav>
				</section>
			</section>
		</header>
	);
}

export default Header;

// Författare: Helene
// Header komponent

// Eventuell buggfix av: *namn-här:
// Vad blev fixad: *skriv vad som (evt) fixades*
