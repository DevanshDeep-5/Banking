import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { isValidEmail, validatePassword } from '../utils/validators';

type User = { username: string } | null;

type AuthResult = { ok: boolean; message?: string };

type AuthValue = {
  user: User;
  signup: (input: { username: string; password: string }) => AuthResult;
  signin: (input: { username: string; password: string }) => AuthResult;
  signout: () => void;
};

const AUTH_KEY = 'demo_auth_users';
const SESSION_KEY = 'demo_auth_session';

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const useAuth = (): AuthValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// Demo AuthProvider

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const s = storage.get<{ username: string }>(SESSION_KEY, null);
    if (s?.username) setUser({ username: s.username });
  }, []);

  const loadUsers = () => storage.get<Record<string, { password: string }>>(AUTH_KEY, {}) ?? {};
  const saveUsers = (users: Record<string, { password: string }>) => storage.set(AUTH_KEY, users);

  const normalizeUsername = (u: string) => u.trim().toLowerCase();

  const signup = ({ username, password }: { username: string; password: string }): AuthResult => {
    if (!isValidEmail(username)) return { ok: false, message: 'Please enter a valid email address' };

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return { ok: false, message: pwCheck.message };

    const users = loadUsers();
    const key = normalizeUsername(username);
    if (users[key]) return { ok: false, message: 'An account with this email already exists' };

    // Demo: store base64 (NOT secure) — replace with proper hashing + backend
    users[key] = { password: btoa(password) };
    saveUsers(users);

    storage.set(SESSION_KEY, { username: key, createdAt: Date.now() });
    setUser({ username: key });
    return { ok: true };
  };

  const signin = ({ username, password }: { username: string; password: string }): AuthResult => {
    if (!isValidEmail(username)) return { ok: false, message: 'Enter a valid email address' };
    if (!password) return { ok: false, message: 'Password required' };

    const users = loadUsers();
    const key = normalizeUsername(username);
    const entry = users[key];
    if (!entry) return { ok: false, message: 'No account found for this email' };
    if (entry.password !== btoa(password)) return { ok: false, message: 'Incorrect password' };

    storage.set(SESSION_KEY, { username: key, createdAt: Date.now() });
    setUser({ username: key });
    return { ok: true };
  };

  const signout = () => {
    storage.remove(SESSION_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, signup, signin, signout }}>{children}</AuthContext.Provider>;
}
