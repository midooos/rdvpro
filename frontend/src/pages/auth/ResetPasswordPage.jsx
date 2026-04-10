import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { validateResetPassword } from '../../utils/validators';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');
  const navigate       = useNavigate();
  const { success, error: toastError } = useToast();
  const [showPwd, setShowPwd] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ password: '', confirmPassword: '' }, validateResetPassword);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      await authService.resetPassword(token, password);
      success('Mot de passe réinitialisé avec succès !');
      navigate('/login');
    } catch {
      toastError('Lien invalide ou expiré. Veuillez recommencer.');
    }
  });

  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
        <p style={{ fontWeight: 700, color: 'var(--navy)' }}>Lien invalide</p>
        <Link to="/forgot-password" style={{ color: 'var(--blue)', fontSize: 13 }}>
          Demander un nouveau lien
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '44px 48px', width: 'min(440px, 96vw)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--navy)', marginBottom: 8, textAlign: 'center' }}>Nouveau mot de passe</h1>

        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {['password', 'confirmPassword'].map(name => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' }}>
                {name === 'password' ? 'NOUVEAU MOT DE PASSE' : 'CONFIRMER LE MOT DE PASSE'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔒</span>
                <input
                  name={name} type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={values[name]} onChange={handleChange} onBlur={handleBlur}
                  style={{ width: '100%', padding: '11px 44px 11px 40px', border: `1.5px solid ${touched[name] && errors[name] ? 'var(--red)' : 'var(--gray-1)'}`, borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 14, background: 'var(--off)', outline: 'none' }}
                />
                {name === 'password' && (
                  <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                )}
              </div>
              {touched[name] && errors[name] && <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ {errors[name]}</span>}
            </div>
          ))}
          <button type="submit" disabled={submitting} style={{ padding: '13px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
            {submitting ? 'Mise à jour…' : 'Réinitialiser →'}
          </button>
        </form>
      </div>
    </div>
  );
}
