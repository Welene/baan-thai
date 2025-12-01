import './RegisterPage.css';
import { RegisterUser } from '../../interfaces/register';
import { useNavigate } from 'react-router-dom';
import { useState, FormEvent, ChangeEvent } from 'react';

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
	const [message, setMessage] = useState<{
		text: string;
		type: 'success' | 'error';
	} | null>(null);
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

		console.log('Försöker registrera med data:', formData);

		try {
			const response = await fetch(
				'https://nicx8149f2.execute-api.eu-north-1.amazonaws.com/api/register',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				}
			);

			console.log('Response status:', response.status);
			const data = await response.json();
			console.log('Response data:', data);

			if (!response.ok) {
				throw new Error(data.error || 'Could not register user');
			}

			setMessage({
				text: 'Registrering lyckades! Du skickas nu till inloggningen...',
				type: 'success',
			});
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (error) {
			console.error('Registration failed:', error);
			setMessage({
				text: 'Registrering misslyckades. Försök igen.',
				type: 'error',
			});
		}
	};

	const handleLogin = (): void => {
		navigate('/login');
	};

	return (
		<section className="register-section">
			<article className="register__card">
				<h3 className="register__heading">SKAPA KONTO</h3>
				{message && (
					<div
						className={`register__message register__message--${message.type}`}>
						{message.text}
					</div>
				)}
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

// Eventuell buggfix av:Tim
// Vad blev fixad: *skriv vad som (evt) fixades* la till rätt api-url, fixade react-import,tog bort dubbel navigate.
