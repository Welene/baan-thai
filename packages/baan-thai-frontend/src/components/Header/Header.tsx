import React from 'react';
import './Header.css';
import logo from '../../assets/logo.png';
import manIcon from '../../assets/man.png';
import basketIcon from '../../assets/basket.png';
import bellIcon from '../../assets/bell.png';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../interfaces/user';



function Header() {
	const userString = localStorage.getItem("user");
	const user: User | null = userString ? JSON.parse(userString) : null;

	const userId = user?.userId ?? "";

	const navigate = useNavigate();
	
	return (
		<header className="header">
			<section className="header__logo-section">
				<img
					src={logo}
					alt="Baan Thaikök logo"
					className="header__logo"
					onClick={() => navigate('/')} 
					// / = PATH TIL LANDINGPAGE, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ LANDINGPAGE

				/>
			</section>

			<section className="header__options-section">
				<section className="header__icons">
					<figure className="header__icon">
						<img src={manIcon} alt="Profil ikon" onClick={() => navigate(`/profile/${userId}`)} />
					 {/* /profile = PATH TIL PROFIL, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ PROFILPAGE */}
					</figure>

					<figure className="header__icon">
						<img src={basketIcon} alt="Handlekurv ikon" onClick={() => navigate(`/cart/${userId}`)} />
						 {/* /cart = PATH TIL CARTPAGE, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ PARTPAGE */}
					</figure>

					<figure className="header__icon">
						<img src={bellIcon} alt="Varsler ikon" onClick={() => navigate(`/notifications`)} />
						{/* /notifications = PATH TIL NOTIS-PAGE, ENDRE PATH INNI ('/') OM ANNET NAVN PÅ NOTIS-PAGE */}
					</figure>
				</section>

				<section className="header__navigation">
					<nav className="header__nav">
						<ul className="header__nav-list">
							<li className="header__nav-item" onClick={() => navigate('/')}>Hem</li>
							<li className="header__nav-item" onClick={() => navigate('/menu/sushi')}>Sushi</li>
							<li className="header__nav-item" onClick={() => navigate('/menu/thai')}>Thailändsk mat</li>
							<li className="header__nav-item" onClick={() => navigate('/about')}>Om oss</li>
							{/* har inte skapad alla pages än, så ändra / path bara när man vet */}
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
