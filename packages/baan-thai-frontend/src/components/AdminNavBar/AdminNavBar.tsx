import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './AdminNavBar.css';

export const AdminNavBar = () => {
	const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const menuDropdownRef = useRef<HTMLDivElement>(null);
	const userDropdownRef = useRef<HTMLDivElement>(null);

	// Stäng dropdowns när man klickar utanför
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
				setIsMenuDropdownOpen(false);
			}
			if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
				setIsUserDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleMenuDropdown = () => {
		setIsMenuDropdownOpen(!isMenuDropdownOpen);
		setIsUserDropdownOpen(false); // Stäng user dropdown när menu öppnas
	};

	const toggleUserDropdown = () => {
		setIsUserDropdownOpen(!isUserDropdownOpen);
		setIsMenuDropdownOpen(false); // Stäng menu dropdown när user öppnas
	};

	return (
		<nav className="admin-navbar">
			<div className="admin-nav-content">
				<h2>Admin Panel</h2>
				<div className="admin-nav-links">
                    <Link to="/admin">ArbetsYta</Link>
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
									onClick={() => setIsMenuDropdownOpen(false)}
								>
									Skapa meny
								</Link>
								<Link 
									to="/admin/menu/edit" 
									className="dropdown-item"
									onClick={() => setIsMenuDropdownOpen(false)}
								>
									Redigera meny
								</Link>
							</div>
						)}
					</div>
					
					{/* Dropdown för User */}
					<div className="dropdown-container" ref={userDropdownRef}>
						<button 
							className="dropdown-toggle" 
							onClick={toggleUserDropdown}
						>
							User
							<span className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`}>
								▼
							</span>
						</button>
						{isUserDropdownOpen && (
							<div className="dropdown-menu">
								<Link 
									to="/admin/users" 
									className="dropdown-item"
									onClick={() => setIsUserDropdownOpen(false)}
								>
									Admin users
								</Link>
								<Link 
									to="/admin/users/edit" 
									className="dropdown-item"
									onClick={() => setIsUserDropdownOpen(false)}
								>
									Redigera user
								</Link>
							</div>
						)}
					</div>
					
					<Link to="/landing">Till huvudsida</Link>
				</div>
			</div>
		</nav>
	);
};
