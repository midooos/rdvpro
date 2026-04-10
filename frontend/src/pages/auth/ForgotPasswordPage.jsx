import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { validateForgotPassword } from '../../utils/validators';
import authService from '../../services/authService';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ email: '' }, validateForgotPassword);

  const onSubmit = handleSubmit(async ({ email }) => {
    await authService.forgotPassword(email);
    setSent(true);
  });

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <Link to="/login" style={styles.back}>← Retour à la connexion</Link>

        <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
        <h1 style={styles.title}>Mot de passe oublié</h1>
        <p style={styles.subtitle}>
          Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.
        </p>

        {sent ? (
          <div style={styles.successBox}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <p style={{ fontWeight: 600, color: '#065F46', marginBottom: 6 }}>E-mail envoyé !</p>
            <p style={{ fontSize: 13, color: '#065F46' }}>
              Vérifiez votre boîte de réception et suivez le lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>ADRESSE E-MAIL</label>
              <div style={{ position: 'relative' }}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  name="email" type="email"
                  placeholder="votre@email.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ ...styles.input, ...(touched.email && errors.email ? styles.inputError : {}) }}
                />
              </div>
              {touched.email && errors.email && <span style={styles.errorMsg}>⚠ {errors.email}</span>}
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Envoi en cours…' : 'Envoyer le lien →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { background: 'white', borderRadius: 24, padding: '44px 48px', width: 'min(480px, 96vw)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center' },
  back: { display: 'inline-block', marginBottom: 24, fontSize: 12, color: 'var(--gray-3)', textDecoration: 'none', fontWeight: 500 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--navy)', marginBottom: 8 },
  subtitle: { fontSize: 13, color: 'var(--gray-3)', marginBottom: 28, lineHeight: 1.6 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' },
  label: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' },
  inputIcon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 16px 11px 40px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', background: 'var(--off)', outline: 'none' },
  inputError: { borderColor: 'var(--red)' },
  errorMsg: { fontSize: 11, color: 'var(--red)' },
  submitBtn: { width: '100%', padding: '13px 24px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  successBox: { background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 12, padding: 24 },
};
