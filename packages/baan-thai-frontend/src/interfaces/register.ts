export interface RegisterUser {
	email: string;
	password: string;
	name: string;
	username: string;
	address?: string;
	phoneNumber?: string;
} // string is better for phone numbers that start with "0" or have "+"() 12345678

// this is how the input fields are gonna look like (FormData on RegisterPage)

// Författare: Helene
// RegisterUser form interface
