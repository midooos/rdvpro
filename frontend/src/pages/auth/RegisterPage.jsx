import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { validateRegister } from '../../utils/validators';

// ── Field moved OUTSIDE RegisterPage so it never gets recreated on re-render
const Field = ({ name, label, type = 'text', placeholder, icon, half, values, errors, touched, handleChange, handleBlur, showPwd, setShowPwd }) => (
  <div style={{ gridColumn: half ? 'span 1' : 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={styles.label}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <input
        name={name}
        type={name === 'password' ? (showPwd ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          ...styles.input,
          paddingLeft: icon ? 42 : 16,
          ...(touched[name] && errors[name] ? styles.inputError : {}),
        }}
        autoComplete={name}
      />
      {name === 'password' && (
        <button type="button" onClick={() => setShowPwd(s => !s)} style={styles.eyeBtn} tabIndex={-1}>
          {showPwd ? '🙈' : '👁️'}
        </button>
      )}
    </div>
    {touched[name] && errors[name] && (
      <span style={styles.errorMsg}>⚠ {errors[name]}</span>
    )}
  </div>
);

export default function RegisterPage() {
  const { register }  = useAuth();
  const { error: toastError } = useToast();
  const navigate      = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useForm({ firstName: '', lastName: '', email: '', password: '', phone: '' }, validateRegister);

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await register(vals);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toastError(err.message);
    }
  });

  const fieldProps = { values, errors, touched, handleChange, handleBlur, showPwd, setShowPwd };

  return (
    <div style={styles.root}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <Link to="/login" style={styles.back}>← Retour</Link>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📆</div>
            <span style={styles.logoName}>RDVPro</span>
          </div>
        </div>

        <h1 style={styles.title}>Créer un compte</h1>
        <p style={styles.subtitle}>Rejoignez RDVPro en quelques secondes</p>

        <form onSubmit={onSubmit} noValidate style={styles.grid}>
          <Field name="firstName" label="PRÉNOM"        placeholder="Mohamed"        icon="👤" half {...fieldProps} />
          <Field name="lastName"  label="NOM"           placeholder="Ben Ali"        icon="👤" half {...fieldProps} />
          <Field name="email"     label="E-MAIL"        placeholder="vous@email.com" icon="✉️" type="email" {...fieldProps} />
          <Field name="phone"     label="TÉLÉPHONE (OPTIONNEL)" placeholder="+216 XX XXX XXX" icon="📞" {...fieldProps} />
          <Field name="password"  label="MOT DE PASSE"  placeholder="Min. 8 caractères" icon="🔒" {...fieldProps} />

          <button
            type="submit"
            disabled={submitting}
            style={{ ...styles.submitBtn, gridColumn: 'span 2', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Création du compte…' : 'Créer mon compte →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-4)' }}>
          Déjà inscrit ?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh', background: 'var(--navy)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: 16,
  },
  glow1: { position: 'absolute', top: '-20%', right: '-10%', width: '50%', height: '70%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,111,217,0.2) 0%, transparent 60%)', pointerEvents: 'none' },
  glow2: { position: 'absolute', bottom: '-20%', left: '-10%', width: '40%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,186,171,0.12) 0%, transparent 55%)', pointerEvents: 'none' },
  card: { position: 'relative', zIndex: 1, background: 'white', borderRadius: 24, padding: '40px 48px', width: 'min(560px, 96vw)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  back: { fontSize: 13, color: 'var(--gray-3)', textDecoration: 'none', fontWeight: 500 },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoName: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--navy)', marginBottom: 6 },
  subtitle: { fontSize: 13, color: 'var(--gray-3)', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 16px' },
  label: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' },
  inputIcon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  input: { width: '100%', padding: '11px 16px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', background: 'var(--off)', outline: 'none', transition: 'border-color 0.2s' },
  inputError: { borderColor: 'var(--red)' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 },
  errorMsg: { fontSize: 11, color: 'var(--red)', fontWeight: 500 },
  submitBtn: { padding: '13px 24px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
