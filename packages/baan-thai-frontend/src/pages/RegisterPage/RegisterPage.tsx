import './RegisterPage.css';
import { RegisterUser } from '../../interfaces/register';
import { useNavigate } from 'react-router-dom';
import React, { useState, FormEvent, ChangeEvent } from 'react';

function RegisterPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<RegisterUser>({
		// formData --> has all the input info from user, ready to be sent to backend!
		namn: '',
		epost: '',
		lösenord: '',
		adress: '',
		telefonnummer: '',
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

	const handleRegister = (e: FormEvent): void => {
		e.preventDefault();
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
							name="namn"
							placeholder="Namn"
							value={formData.namn}
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
							name="epost"
							placeholder="Epost"
							value={formData.epost}
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
							name="lösenord"
							placeholder="Lösenord"
							value={formData.lösenord}
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
							name="adress"
							placeholder="Adress"
							value={formData.adress}
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
							name="telefonnummer"
							placeholder="Telefonnummer"
							value={formData.telefonnummer}
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
