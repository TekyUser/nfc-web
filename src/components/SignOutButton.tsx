import { useAuth } from '../hooks/useAuth';

export function SignOutButton() {
  const { authState, logout } = useAuth();

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={logout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
