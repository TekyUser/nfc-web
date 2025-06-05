export interface NFCCard {
  id: string;
  nfcId: string;
  holderName: string;
  holderEmail?: string;
  holderPhone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive: boolean;
  assignedAt: number;
  assignedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
