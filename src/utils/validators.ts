
// Reusable validators for email and password fields

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const e = email.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(e);
}

export type PasswordValidationResult = {
  valid: boolean;
  score: number;           // 0..4 score based on classes matched
  message?: string | null; // message when invalid
};


//  validatePassword:
//  - minimum length 8
//  - checks presence of: lowercase, uppercase, digit, special
//  - requires at least 3 of the 4 classes for a pass (configurable in one place)

export function validatePassword(password: string): PasswordValidationResult {
  if (typeof password !== 'string') {
    return { valid: false, score: 0, message: 'Invalid password type' };
  }
  const p = password;
  if (p.length < 8) {
    return { valid: false, score: 0, message: 'Password must be at least 8 characters' };
  }

  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /[0-9]/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const score = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

  if (score < 3) {
    return {
      valid: false,
      score,
      message: 'Password should include at least three of: lowercase, uppercase, number, special character'
    };
  }

  return { valid: true, score, message: null };
}

// Optional small helper to convert score -> friendly label / color for UI
 
export function passwordStrengthLabel(score: number): { label: string; colorClass: string } {
  if (score <= 1) return { label: 'Very weak', colorClass: 'bg-red-400' };
  if (score === 2) return { label: 'Weak', colorClass: 'bg-orange-400' };
  if (score === 3) return { label: 'Good', colorClass: 'bg-yellow-400' };
  return { label: 'Strong', colorClass: 'bg-emerald-400' };
}
