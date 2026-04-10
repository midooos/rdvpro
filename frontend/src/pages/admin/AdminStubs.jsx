// Shared stub template for admin pages not yet fully implemented
import React from 'react';
import { Link } from 'react-router-dom';

function StubPage({ icon, title, description, links = [] }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)' }}>{title}</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)', marginTop: 4 }}>{description}</p>
      </div>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', padding: 64, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-3)', maxWidth: 400, margin: '0 auto 24px' }}>
          Ce module est en cours de développement et sera disponible prochainement.
        </p>
        {links.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} className="btn btn-primary">{l.label}</Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminClients() {
  return <StubPage icon="👥" title="Clients" description="Gestion de la base de clients." links={[{ to: '/admin', label: '← Tableau de bord' }]} />;
}

export function AdminSlots() {
  return <StubPage icon="🕐" title="Créneaux" description="Gestion des disponibilités et des plages horaires." links={[{ to: '/admin', label: '← Tableau de bord' }]} />;
}

export function AdminReports() {
  return <StubPage icon="📈" title="Rapports & Analytiques" description="Rapports IA et analyses des tendances de rendez-vous." links={[{ to: '/admin', label: '← Tableau de bord' }]} />;
}

export function AdminSettings() {
  return <StubPage icon="⚙️" title="Paramètres" description="Configuration du système et préférences globales." links={[{ to: '/admin', label: '← Tableau de bord' }]} />;
}

export default AdminClients;
