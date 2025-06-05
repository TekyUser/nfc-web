import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function RoleSetup() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const setUserRole = useMutation(api.nfcCards.setUserRole);

  const handleSetAdmin = async () => {
    if (!loggedInUser) return;
    
    try {
      await setUserRole({
        userId: loggedInUser._id,
        role: "admin",
      });
      toast.success("You are now an admin!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSetUser = async () => {
    if (!loggedInUser) return;
    
    try {
      await setUserRole({
        userId: loggedInUser._id,
        role: "user",
      });
      toast.success("Role set to user");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
          Set as User
        </button>
      </div>
    </div>
  );
}
