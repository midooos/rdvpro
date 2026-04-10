import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { validateLogin } from '../../utils/validators';

export default function LoginPage() {
  const { login }    = useAuth();
  const { error: toastError } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [showPwd, setShowPwd] = useState(false);

  const from = location.state?.from?.pathname || null;

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ email: '', password: '' }, validateLogin);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const user = await login(email, password);
      const dest = from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      toastError(err.message);
    }
  });

  return (
    <div style={styles.root}>
      {/* Background glows */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.grid}>
        {/* ── LEFT: Brand panel ── */}
        <div style={styles.brand}>
          <div style={styles.brandLogo}>
            <div style={styles.brandIcon}>📆</div>
            <div>
              <div style={styles.brandName}>RDVPro</div>
              <div style={styles.brandTagline}>GESTION DE RENDEZ-VOUS</div>
            </div>
          </div>

          <div style={styles.heroText}>
            <h2 style={styles.heroH2}>
              Gérez vos rendez-vous<br />avec précision
            </h2>
            <p style={styles.heroP}>
              Plateforme professionnelle de gestion de rendez-vous — rapide, fiable, et élégante.
            </p>

            <div style={styles.features}>
              {[
                { icon: '📅', text: 'Planification intelligente des créneaux' },
                { icon: '🔔', text: 'Rappels automatiques par e-mail' },
                { icon: '📊', text: 'Tableau de bord analytique en temps réel' },
              ].map(f => (
                <div key={f.text} style={styles.featureItem}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={styles.brandFooter}>© 2026 RDVPro — ISG Bizerte</p>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Connexion</h1>
            <p style={styles.formSubtitle}>Bienvenue, veuillez vous identifier</p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>ADRESSE E-MAIL</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    ...styles.input,
                    ...(touched.email && errors.email ? styles.inputError : {}),
                  }}
                  autoComplete="email"
                />
              </div>
              {touched.email && errors.email && (
                <span style={styles.errorMsg}>⚠ {errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>MOT DE PASSE</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    ...styles.input,
                    ...(touched.password && errors.password ? styles.inputError : {}),
                    paddingRight: 44,
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.password && errors.password && (
                <span style={styles.errorMsg}>⚠ {errors.password}</span>
              )}
            </div>

            {/* Forgot */}
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 20 }}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitBtn,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <><span style={styles.spinnerInline} /> Connexion en cours…</>
              ) : (
                'Se connecter →'
              )}
            </button>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>ou</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Register link */}
            <p style={styles.registerText}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={styles.registerLink}>
                Créer un compte
              </Link>
            </p>
          </form>

        </div>
      </div>

      <style>{`
        @keyframes spinInline {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 720px) {
          .login-brand { display: none !important; }
          .login-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--navy)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: 16,
  },
  glow1: {
    position: 'absolute', top: '-20%', right: '-10%',
    width: '60%', height: '80%', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,111,217,0.25) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute', bottom: '-20%', left: '-10%',
    width: '50%', height: '70%', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(13,186,171,0.15) 0%, transparent 55%)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'relative', zIndex: 1,
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    width: 'min(1060px, 96vw)', minHeight: 640,
    borderRadius: 24, overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
  },
  brand: {
    background: 'linear-gradient(145deg, #1A3070 0%, #112050 100%)',
    padding: '52px 48px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
  },
  brandLogo: { display: 'flex', alignItems: 'center', gap: 12 },
  brandIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'var(--blue)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  brandName: { fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 700 },
  brandTagline: { fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 },
  heroText: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' },
  heroH2: { fontFamily: 'var(--font-display)', fontSize: 34, color: 'white', lineHeight: 1.2, marginBottom: 16 },
  heroP: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32 },
  features: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 9,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
  },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  brandFooter: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },

  formPanel: {
    background: 'white',
    padding: '52px 48px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  formHeader: { marginBottom: 32 },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--navy)', marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: 'var(--gray-3)' },

  formGroup: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 },
  label: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 16px 12px 42px',
    border: '1.5px solid var(--gray-1)', borderRadius: 10,
    fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    background: 'var(--off)',
  },
  inputError: { borderColor: 'var(--red)' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4,
  },
  errorMsg: { fontSize: 11, color: 'var(--red)', fontWeight: 500 },
  forgotLink: { fontSize: 12, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' },

  submitBtn: {
    width: '100%', padding: '13px 24px',
    background: 'var(--blue)', color: 'white',
    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  spinnerInline: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white', borderRadius: '50%',
    display: 'inline-block',
    animation: 'spinInline 0.7s linear infinite',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: 'var(--gray-1)' },
  dividerText: { fontSize: 12, color: 'var(--gray-3)', fontWeight: 500 },
  registerText: { textAlign: 'center', fontSize: 13, color: 'var(--gray-4)' },
  registerLink: { color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' },
  demoBox: {
    marginTop: 24, padding: '12px 16px',
    background: 'var(--off)', borderRadius: 10,
    border: '1px dashed var(--gray-2)',
  },
};
