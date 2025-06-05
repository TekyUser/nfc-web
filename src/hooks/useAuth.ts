 import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
 import { AuthState, User } from '../types';
 
 const AuthContext = createContext<{
   authState: AuthState;
   login: (email: string, password: string) => Promise<boolean>;
   logout: () => void;
   setUserRole: (role: 'admin' | 'user') => void;
 } | null>(null);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [authState, setAuthState] = useState<AuthState>({
     user: null,
     isAuthenticated: false,
   });
 
   useEffect(() => {
     // Check for stored auth state
     const storedAuth = localStorage.getItem('nfc-auth');
     if (storedAuth) {
       try {
         const parsed = JSON.parse(storedAuth);
         setAuthState(parsed);
       } catch (error) {
         console.error('Error parsing stored auth:', error);
         localStorage.removeItem('nfc-auth');
       }
     }
   }, []);
 
   const login = async (email: string, password: string): Promise<boolean> => {
     // Simple demo authentication - in real app, this would call your backend
     if (email && password) {
       const user: User = {
         id: Date.now().toString(),
         email,
         name: email.split('@')[0],
         role: 'user', // Default role
       };
       
       const newAuthState: AuthState = {
         user,
         isAuthenticated: true,
       };
       
       setAuthState(newAuthState);
       localStorage.setItem('nfc-auth', JSON.stringify(newAuthState));
       return true;
     }
     return false;
   };
 
   const logout = () => {
     setAuthState({ user: null, isAuthenticated: false });
     localStorage.removeItem('nfc-auth');
   };
 
   const setUserRole = (role: 'admin' | 'user') => {
     if (authState.user) {
       const updatedUser = { ...authState.user, role };
       const newAuthState = { ...authState, user: updatedUser };
       setAuthState(newAuthState);
       localStorage.setItem('nfc-auth', JSON.stringify(newAuthState));
     }
   };
 
   return (
     <AuthContext.Provider value={{ authState, login, logout, setUserRole }}>
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (!context) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }
 