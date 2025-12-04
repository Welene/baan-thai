import { Link } from 'react-router-dom';
import './AdminNavBar.css';

export const AdminNavBar = () => {
	return (
		<nav className="admin-navbar">
			<div className="admin-nav-content">
				<h2>Admin Panel</h2>
				<div className="admin-nav-links">
                    <Link to="/admin">ArbetsYta</Link>
					<Link to="/admin/menu">Skapa ny</Link>
					<Link to="/admin/menu/edit">Redigera</Link>
					<Link to="/landing">Till huvudsida</Link>
				</div>
			</div>
		</nav>
	);
};
