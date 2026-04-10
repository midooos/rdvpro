import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { validateProfile, validators } from '../../utils/validators';
import { getInitials, avatarColor } from '../../utils/formatters';
import authService from '../../services/authService';

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState('info');

  // Profile form
  const profileForm = useForm(
    { firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' },
    validateProfile
  );

  // Password form
  const pwdForm = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    ({ currentPassword, newPassword, confirmPassword }) => ({
      currentPassword: validators.required(currentPassword),
      newPassword: validators.passwordStrength(newPassword),
      confirmPassword: validators.passwordMatch(newPassword)(confirmPassword),
    })
  );

  const handleProfileSave = profileForm.handleSubmit(async (vals) => {
    try {
      const updated = await authService.updateProfile(vals);
      updateUser(updated);
      success('Profil mis à jour avec succès !');
    } catch {
      toastError('Erreur lors de la mise à jour');
    }
  });

  const handlePasswordChange = pwdForm.handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      success('Mot de passe modifié avec succès !');
      pwdForm.reset();
    } catch {
      toastError('Mot de passe actuel incorrect');
    }
  });

  const TABS = [
    { key: 'info',     label: '👤 Informations' },
    { key: 'security', label: '🔐 Sécurité' },
    { key: 'notifs',   label: '🔔 Notifications' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Espace Client</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)' }}>Mon profil</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)', marginTop: 4 }}>Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar card */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {/* Avatar section */}
          <div style={{ padding: 28, textAlign: 'center', borderBottom: '1px solid var(--gray-1)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatarColor(user?.firstName || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 auto 16px' }}>
              {getInitials(`${user?.firstName} ${user?.lastName}`)}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-3)', marginTop: 4 }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#DBEAFE', color: '#1E40AF' }}>
              Client
            </span>
          </div>

          {/* Nav tabs */}
          <nav style={{ padding: 8 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                border: 'none', cursor: 'pointer', fontSize: 13,
                background: tab === t.key ? 'var(--off)' : 'transparent',
                color: tab === t.key ? 'var(--blue)' : 'var(--text-2)',
                fontWeight: tab === t.key ? 700 : 500,
                marginBottom: 2, transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', padding: 32 }}>

          {tab === 'info' && (
            <form onSubmit={handleProfileSave}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 24 }}>Informations personnelles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { name: 'firstName', label: 'PRÉNOM', placeholder: 'Mohamed' },
                  { name: 'lastName',  label: 'NOM',    placeholder: 'Ben Ali' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input
                      name={f.name} type="text" placeholder={f.placeholder}
                      value={profileForm.values[f.name]}
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${profileForm.touched[f.name] && profileForm.errors[f.name] ? 'var(--red)' : 'var(--gray-1)'}`, borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--off)' }}
                    />
                    {profileForm.touched[f.name] && profileForm.errors[f.name] && (
                      <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ {profileForm.errors[f.name]}</span>
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>E-MAIL</label>
                  <input value={user?.email || ''} disabled style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, background: 'var(--gray-1)', color: 'var(--gray-3)' }} />
                  <p style={{ fontSize: 11, color: 'var(--gray-3)', marginTop: 4 }}>L'e-mail ne peut pas être modifié.</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TÉLÉPHONE</label>
                  <input
                    name="phone" type="text" placeholder="+216 XX XXX XXX"
                    value={profileForm.values.phone}
                    onChange={profileForm.handleChange}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--off)' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={profileForm.submitting} className="btn btn-primary">
                  {profileForm.submitting ? 'Enregistrement…' : 'Sauvegarder les modifications'}
                </button>
              </div>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={handlePasswordChange}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 24 }}>Changer le mot de passe</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
                {[
                  { name: 'currentPassword', label: 'MOT DE PASSE ACTUEL',    placeholder: '••••••••' },
                  { name: 'newPassword',     label: 'NOUVEAU MOT DE PASSE',   placeholder: 'Min. 8 caractères' },
                  { name: 'confirmPassword', label: 'CONFIRMER LE MOT DE PASSE', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input
                      name={f.name} type="password" placeholder={f.placeholder}
                      value={pwdForm.values[f.name]}
                      onChange={pwdForm.handleChange}
                      onBlur={pwdForm.handleBlur}
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${pwdForm.touched[f.name] && pwdForm.errors[f.name] ? 'var(--red)' : 'var(--gray-1)'}`, borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--off)' }}
                    />
                    {pwdForm.touched[f.name] && pwdForm.errors[f.name] && (
                      <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ {pwdForm.errors[f.name]}</span>
                    )}
                  </div>
                ))}
                <button type="submit" disabled={pwdForm.submitting} className="btn btn-primary" style={{ width: 'fit-content' }}>
                  {pwdForm.submitting ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          )}

          {tab === 'notifs' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 24 }}>Préférences de notifications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Confirmation de rendez-vous', sub: 'Recevoir un e-mail à chaque confirmation', defaultVal: true },
                  { label: 'Rappels 48h avant',           sub: 'Rappel automatique 48h avant votre RDV', defaultVal: true },
                  { label: 'Annulation de rendez-vous',   sub: 'Notification en cas d\'annulation',       defaultVal: true },
                  { label: 'Actualités & promotions',     sub: 'Offres et nouvelles du cabinet',          defaultVal: false },
                ].map(pref => (
                  <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--off)', borderRadius: 12, border: '1px solid var(--gray-1)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{pref.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-3)', marginTop: 2 }}>{pref.sub}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
                      <input type="checkbox" defaultChecked={pref.defaultVal} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', inset: 0, background: pref.defaultVal ? 'var(--blue)' : 'var(--gray-2)', borderRadius: 24, cursor: 'pointer', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', left: pref.defaultVal ? 22 : 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary">Sauvegarder les préférences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
