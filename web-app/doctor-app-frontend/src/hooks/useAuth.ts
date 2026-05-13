import { useState } from 'react';
import { loginUser, registerUser, type AuthResponse, type RegisterExtras } from '../services/authService';
import type { AxiosError } from 'axios';

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<{ detail?: string; errors?: Record<string, string>; title?: string }>;
  const data = axiosErr.response?.data;
  if (data?.errors) return Object.values(data.errors).join(' ');
  if (data?.detail) return data.detail;
  if (data?.title) return data.title;
  return 'Something went wrong. Please try again.';
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      return await loginUser(email, password);
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: string, extras?: RegisterExtras): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      return await registerUser(email, password, role, extras);
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error };
}
