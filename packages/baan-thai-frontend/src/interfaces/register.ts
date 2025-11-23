export interface RegisterUser {
	namn: string;
	epost: string;
	lösenord: string;
	adress: string;
	telefonnummer: string; // string is better for phone numbers that start with "0" or have "+"() 12345678
}
// this is how the input fields are gonna look like (FormData on RegisterPage)

// Författare: Helene
// RegisterUser form interface

// Eventuell buggfix av: *namn-här:
// Vad blev fixad: *skriv vad som (evt) fixades*
