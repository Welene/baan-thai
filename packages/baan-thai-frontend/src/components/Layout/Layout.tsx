import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { HeaderProps } from '../../interfaces/props';

export default function Layout({ cartItemCount, onCartClick }: HeaderProps) {
	return (
		<>
			<Header cartItemCount={cartItemCount} onCartClick={onCartClick} />
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	);
}
