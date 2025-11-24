import './RegisterPage.css';
import { RegisterUser } from '../../interfaces/register';
import { useNavigate } from 'react-router-dom';
import React, { useState, FormEvent, ChangeEvent } from 'react';

function RegisterPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<RegisterUser>({
		// formData --> has all the input info from user, ready to be sent to backend!
		name: '',
		password: '',
		email: '',
		username: '',
		phoneNumber: '',
		address: '',
	});
	// makes sure to use the interface, so correct datatype is used in each inputfield

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		// keeps the state updated (formData)
		// event = changes in input field //
		const { name, value } = e.target;
		setFormData((prev) => ({
			// takes previous state from inputfield
			...prev, // a copy from every field
			[name as keyof RegisterUser]: value,
			// updates the setFormData with the imputfield that had its' content changed, makes sure key is correct
		}));
	};

	const handleRegister = async (e: FormEvent): Promise<void> => {
		e.preventDefault();

		try {
			const response = await fetch('http://localhost:3000/api/register', {
				// swap out to your url when testing, this is mine, from offline serverless
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Could not register user');
				return;
			}

			localStorage.setItem('token', data.token);
			navigate('/landing');
		} catch (error) {
			console.error('Registration failed:', error);
			throw new Error('Could not register user');
		}
	};

	const handleLogin = (): void => {
		const navigate = useNavigate();
		navigate('/login');
		// MAKE SURE PATH IS CORRECT HERE LATER
		// nav to login-page if user already has user and chooses to click the login button instead of registering
	};

	return (
		<section className="register-section">
			<article className="register__card">
				<h3 className="register__heading">SKAPA KONTO</h3>
				<form className="register__form" onSubmit={handleRegister}>
					{/* connected to the register button with "type = submit" // formData has all data noe, when the form is submitted the handleRegister function runs */}
					{/* async backend function needs to wait for this data from the inputfields before posting new user */}

					{/* CONNECT TO BACKEND LATER (AKA NEXT WORKDAY) */}
					<div>
						<label htmlFor="namn" className="sr-only">
							Namn
						</label>
						<input
							type="text"
							id="namn"
							name="name"
							placeholder="Namn"
							value={formData.name}
							onChange={handleChange}
							className="register__input"
							required
						/>
					</div>

					{/* behövs username? */}
					<div>
						<label htmlFor="username" className="sr-only">
							Användarnamn
						</label>
						<input
							type="text"
							id="username"
							name="username"
							placeholder="Användarnamn"
							value={formData.username}
							onChange={handleChange}
							className="register__input"
							required
						/>
					</div>

					<div>
						<label htmlFor="epost" className="sr-only">
							Epost
						</label>
						<input
							type="email"
							id="epost"
							name="email"
							placeholder="Epost"
							value={formData.email}
							onChange={handleChange}
							className="register__input"
							required
						/>
					</div>

					<div>
						<label htmlFor="lösenord" className="sr-only">
							Lösenord
						</label>
						<input
							type="password"
							id="lösenord"
							name="password"
							placeholder="Lösenord"
							value={formData.password}
							onChange={handleChange}
							className="register__input"
							required
						/>
					</div>

					<div>
						<label htmlFor="adress" className="sr-only">
							Adress
						</label>
						<input
							type="text"
							id="adress"
							name="address"
							placeholder="Adress"
							value={formData.address}
							onChange={handleChange}
							className="register__input"
						/>
					</div>

					<div>
						<label htmlFor="telefonnummer" className="sr-only">
							Telefonnummer
						</label>
						<input
							type="tel"
							id="telefonnummer"
							name="phoneNumber"
							placeholder="Telefonnummer"
							value={formData.phoneNumber}
							onChange={handleChange}
							className="register__input"
							required
						/>
					</div>

					<div className="register__buttons">
						<button
							type="submit"
							className="register__button register__button--register">
							REGISTRERA
						</button>
						<button
							type="button"
							className="register__button register__button--login"
							onClick={handleLogin}>
							{/* when clicked --> navigates to login page instead using useNavigate */}
							LOGGA IN
						</button>
					</div>
				</form>
			</article>
		</section>
	);
}

export default RegisterPage;

// Författare: Helene
// Register page

// Eventuell buggfix av: *namn-här:
// Vad blev fixad: *skriv vad som (evt) fixades*
