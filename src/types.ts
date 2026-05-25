export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  mfaSecret: string;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  location: string;
  device: string;
  status: 'Authorized' | 'Blocked';
}

export interface SessionState {
  token: string;
  userId: string;
  username: string;
  email: string;
  mfaVerified: boolean;
  expiresAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
