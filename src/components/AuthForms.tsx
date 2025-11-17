// src/components/AuthForms.tsx
import React, { useEffect, useState } from 'react';
import { isValidEmail, validatePassword, passwordStrengthLabel } from '../utils/validators';

type SignHandler = (data: { username: string; password: string }) => void;

export function SignInForm({
  onSubmit,
  switchToSignup,
  serverError,
}: {
  onSubmit: SignHandler;
  switchToSignup?: () => void;
  serverError?: string | null;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalError(null);
  }, [username, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!isValidEmail(username)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({ username: username.trim(), password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {(localError || serverError) && <div className="text-sm text-red-600">{localError ?? serverError}</div>}

      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        name="username"
        type="email"
        placeholder="name@example.com"
        className="mt-1 mb-3 block w-full rounded-md border-black border p-2"
        required
        autoComplete="username"
      />

      <label className="block text-sm font-medium text-gray-700">Password</label>
      <div className="relative">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Your password"
          className="mt-1 mb-2 block w-full rounded-md border-black border p-2 pr-12"
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2 top-2 text-sm cursor-pointer text-gray-500"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {switchToSignup && (
          <button type="button" onClick={switchToSignup} className="text-sm text-blue-600 cursor-pointer underline">
            Create account
          </button>
        )}
      </div>
    </form>
  );
}

export function SignUpForm({
  onSubmit,
  switchToSignin,
  serverError,
}: {
  onSubmit: SignHandler;
  switchToSignin?: () => void;
  serverError?: string | null;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [pwHint, setPwHint] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalError(null);
    setPwHint(null);
  }, [username, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setPwHint(null);

    if (!isValidEmail(username)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setPwHint(pwCheck.message ?? 'Password does not meet requirements');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({ username: username.trim(), password });
    } finally {
      setSubmitting(false);
    }
  };

  const strength = validatePassword(password).score;
  const strengthMeta = passwordStrengthLabel(strength);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {(localError || pwHint || serverError) && (
        <div className="text-sm text-red-600">{localError ?? pwHint ?? serverError}</div>
      )}

      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        name="username"
        type="email"
        placeholder="name@example.com"
        className="mt-1 mb-3 block w-full rounded-md border-black border p-2"
        required
        autoComplete="username"
      />

      <label className="block text-sm font-medium text-gray-700">Password</label>
      <div className="relative">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 chars, mix upper/lower/number/symbol"
          className="mt-1 mb-2 block w-full rounded-md border-black border p-2 pr-12"
          required
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2 top-2 text-sm cursor-pointer text-gray-500"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* strength meter */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-full ${strengthMeta.colorClass}`}
              style={{ width: `${(strength / 4) * 100}%`, transition: 'width 160ms ease' }}
              aria-hidden
            />
          </div>
          <div className="text-sm text-gray-600">{password ? strengthMeta.label : 'Enter password'}</div>
        </div>
        <div className="text-xs text-gray-500">
          Password must be at least 8 characters and include at least three of: lowercase, uppercase, number, symbol.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-md disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        {switchToSignin && (
          <button type="button" onClick={switchToSignin} className="text-sm text-blue-600 cursor-pointer underline">
            Sign in
          </button>
        )}
      </div>
    </form>
  );
}
