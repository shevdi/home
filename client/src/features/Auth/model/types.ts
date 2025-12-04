
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
}

export interface Credentials { token: string; user: User }

export interface AccessToken { accessToken: string }

export interface LoginInputRequest { username: string, password: string }