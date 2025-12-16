import { Navigate } from 'react-router-dom';
import { User } from '../../interfaces/user';

interface ProtectedRouteProps {
	children: React.ReactNode;
	currentUser: User | null;
	requiredRole?: string;
	redirectTo?: string;
}

export const ProtectedRoute = ({
	children,
	currentUser,
	requiredRole = 'admin',
	redirectTo = '/login'
}: ProtectedRouteProps) => {
	if (!currentUser || currentUser.role !== requiredRole) {
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
};

// Create: Sunsanee 