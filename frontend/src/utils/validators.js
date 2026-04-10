// ─── RDVPro Validation Helpers ───────────────────────────────────────────

export const validators = {
  required: (value) =>
    !value || String(value).trim() === '' ? 'Ce champ est obligatoire' : undefined,

  email: (value) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Adresse e-mail invalide'
      : undefined,

  minLength: (min) => (value) =>
    value && value.length < min
      ? `Minimum ${min} caractères`
      : undefined,

  maxLength: (max) => (value) =>
    value && value.length > max
      ? `Maximum ${max} caractères`
      : undefined,

  phone: (value) =>
    value && !/^[+]?[\d\s\-().]{8,20}$/.test(value)
      ? 'Numéro de téléphone invalide'
      : undefined,

  passwordStrength: (value) => {
    if (!value) return 'Mot de passe obligatoire';
    if (value.length < 8) return 'Minimum 8 caractères';
    if (!/[A-Z]/.test(value)) return 'Au moins une majuscule';
    if (!/[0-9]/.test(value)) return 'Au moins un chiffre';
    return undefined;
  },

  passwordMatch: (password) => (value) =>
    value !== password ? 'Les mots de passe ne correspondent pas' : undefined,
};

// ── Pre-built form validators ─────────────────────────────────────────────

export function validateLogin({ email, password }) {
  return {
    email: validators.required(email) || validators.email(email),
    password: validators.required(password),
  };
}

export function validateRegister({ firstName, lastName, email, password, phone }) {
  return {
    firstName: validators.required(firstName) || validators.minLength(2)(firstName),
    lastName:  validators.required(lastName)  || validators.minLength(2)(lastName),
    email:     validators.required(email)     || validators.email(email),
    password:  validators.passwordStrength(password),
    phone:     phone ? validators.phone(phone) : undefined,
  };
}

export function validateForgotPassword({ email }) {
  return {
    email: validators.required(email) || validators.email(email),
  };
}

export function validateResetPassword({ password, confirmPassword }) {
  return {
    password:        validators.passwordStrength(password),
    confirmPassword: validators.passwordMatch(password)(confirmPassword),
  };
}

export function validateProfile({ firstName, lastName, phone }) {
  return {
    firstName: validators.required(firstName) || validators.minLength(2)(firstName),
    lastName:  validators.required(lastName)  || validators.minLength(2)(lastName),
    phone:     phone ? validators.phone(phone) : undefined,
  };
}
