import { useAuth } from "./hooks/useAuth";
import { SignInForm } from "./components/SignInForm";
import { SignOutButton } from "./components/SignOutButton";
import { Toaster } from "sonner";
import { AdminPanel } from "./components/AdminPanel";
import { NFCScanner } from "./components/NFCScanner";
import { RoleSetup } from "./components/RoleSetup";
import { useEffect, useState } from "react";

export default function App() {
  const [nfcIdFromUrl, setNfcIdFromUrl] = useState<string | null>(null);

  // Check for NFC ID in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcParam = urlParams.get('nfc');
    if (nfcParam) {
      setNfcIdFromUrl(nfcParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">NFC ID System</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <Content nfcIdFromUrl={nfcIdFromUrl} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ nfcIdFromUrl }: { nfcIdFromUrl: string | null }) {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">NFC ID System</h1>
        <p className="text-xl text-secondary mb-8">Sign in to access the system</p>
        <SignInForm />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">NFC ID Card System</h1>
        <p className="text-xl text-secondary">
          Welcome, {authState.user?.email} ({authState.user?.role})
        </p>
      </div>

      {authState.user?.role === 'user' && <RoleSetup />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <NFCScanner initialNfcId={nfcIdFromUrl} />
        </div>
        
        {authState.user?.role === "admin" && (
          <div className="space-y-6">
            <AdminPanel />
          </div>
        )}
      </div>
    </div>
  );
}
