import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function RoleSetup() {
  const { authState, setUserRole } = useAuth();

  const handleSetAdmin = () => {
    setUserRole('admin');
    toast.success('You are now an admin!');
  };

  const handleSetUser = () => {
    setUserRole('user');
    toast.success('Role set to user');
  };

  if (!authState.user || authState.user.role !== 'user') {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Set Your Role</h2>
      <p className="text-gray-600 mb-6">
        Choose your role in the system. Admins can assign NFC cards, while users can only scan them.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={handleSetAdmin}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Set as Admin
        </button>
        <button
          onClick={handleSetUser}
          className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Continue as User
        </button>
      </div>
    </div>
  );
}
