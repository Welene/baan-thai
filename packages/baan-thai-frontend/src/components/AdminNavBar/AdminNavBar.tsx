import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './AdminNavBar.css';
import hamburMenu from '../../assets/burger-menu.png';
import close from '../../assets/close.png';

export const AdminNavBar = () => {
	const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const menuDropdownRef = useRef<HTMLDivElement>(null);
	const navMenuRef = useRef<HTMLDivElement>(null);
	

	// Stäng dropdowns när man klickar utanför
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
				setIsMenuDropdownOpen(false);
			}
			
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleMenuDropdown = () => {
		setIsMenuDropdownOpen(!isMenuDropdownOpen);
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
		setIsMenuDropdownOpen(false);
	};

	return (
		<nav className="admin-navbar">
			<div className="admin-nav-content">
				<h2>Admin Panel</h2>

				{/* Hamburger icon for mobile */}
				<button className="admin-hamburger-btn" onClick={toggleMobileMenu}>
					<img 
						src={hamburMenu}
						alt="hamburger menu icon"
						className='hamburger-icon'
					/>
				</button>

				<div className={`admin-nav-links ${mobileMenuOpen ? 'show-menu' : ''}`} ref={navMenuRef}>
					{/* Close button for mobile */}
					<button className="admin-close-btn" onClick={closeMobileMenu}>
						<img 
							src={close}
							alt="close icon"
							className='close-icon'
						/>
					</button>

                    <Link to="/admin" onClick={closeMobileMenu}>ArbetsYta</Link>
					{/* Dropdown för Menu */}
					<div className="dropdown-container" ref={menuDropdownRef}>
						<button 
							className="dropdown-toggle" 
							onClick={toggleMenuDropdown}
						>
							Menu
							<span className={`dropdown-arrow ${isMenuDropdownOpen ? 'open' : ''}`}>
								▼
							</span>
						</button>
						{isMenuDropdownOpen && (
							<div className="dropdown-menu">
								<Link 
									to="/admin/menu" 
									className="dropdown-item"
									onClick={closeMobileMenu}
								>
									Skapa meny
								</Link>
								<Link 
									to="/admin/menu/edit" 
									className="dropdown-item"
									onClick={closeMobileMenu}
								>
									Redigera meny
								</Link>
							</div>
						)}
					</div>
					
					<Link to="/admin/users/edit" onClick={closeMobileMenu}>Användare</Link>
					
					<Link to="/landing" onClick={closeMobileMenu}>Till huvudsida</Link>
				</div>
			</div>
		</nav>
	);
};
