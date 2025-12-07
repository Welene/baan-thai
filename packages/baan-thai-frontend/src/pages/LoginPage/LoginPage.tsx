import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useState, FormEvent, ChangeEvent } from 'react';
import { LoginPageProps } from '../../interfaces/login';
import { API_BASE_URL } from '../../config/api';

interface LoginFormData {
	Email: string;
	password: string;
}

function LoginPage({ setCurrentUser }: LoginPageProps) {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<LoginFormData>({
		Email: '',
		password: '',
	});
	const [message, setMessage] = useState<{
		text: string;
		type: 'success' | 'error';
	} | null>(null);

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLogin = async (e: FormEvent): Promise<void> => {
		e.preventDefault();

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: formData.Email,
						password: formData.password,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Kunde inte logga in');
			}

			localStorage.setItem('token', data.token);

			// Spara användaren till localStorage för profilesidan
			const userToStore = {
				userId: data.user.userId,
				name: data.user.name,
				email: data.user.email,
				username: data.user.username,
				role: data.user.role,
			};
			localStorage.setItem('currentUser', JSON.stringify(userToStore));

			setCurrentUser(userToStore);

			setMessage({
				text: 'Inloggning lyckades! Välkommen...',
				type: 'success',
			});
			
			// Redirect based on user role
			setTimeout(() => {
				if (userToStore.role === 'admin') {
					navigate('/admin');
				} else {
					navigate('/landing');
				}
			}, 1500);
		} catch (error) {
			console.error('Login failed:', error);
			setMessage({
				text: 'Kunde inte logga in. Kontrollera dina uppgifter.',
				type: 'error',
			});
		}
	};

	const handleRegister = (): void => {
		navigate('/register');
	};

	return (
		<section className="login-section">
			<article className="login__card">
				<h3 className="login__heading">LOGGA IN</h3>
				{message && (
					<div
						className={`login__message login__message--${message.type}`}>
						{message.text}
					</div>
				)}
				<form className="login__form" onSubmit={handleLogin}>
					<div>
						<label htmlFor="usernameOrEmail" className="sr-only">
							Email
						</label>
						<input
							type="text"
							id="Email"
							name="Email"
							placeholder="Email"
							value={formData.Email}
							onChange={handleChange}
							className="login__input"
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
							className="login__input"
							required
						/>
					</div>
					<div className="login__buttons">
						<button
							type="submit"
							className="login__button login__button--login">
							LOGGA IN
						</button>
						<button
							type="button"
							className="login__button login__button--register"
							onClick={handleRegister}>
							SKAPA KONTO
						</button>
					</div>
				</form>
			</article>
		</section>
	);
}

export default LoginPage;
