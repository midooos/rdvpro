import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { getInitials, avatarColor, formatDateShort } from '../../utils/formatters';

// ── Client Row ────────────────────────────────────────────────────
function ClientRow({ client, onStatusChange, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr style={{
        borderBottom: '1px solid var(--gray-1)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--off)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <td style={{ padding: '14px 20px', cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: avatarColor(client.firstName || ''),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {getInitials(`${client.firstName} ${client.lastName}`)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {client.firstName} {client.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-3)' }}>
                {client.email}
              </div>
            </div>
          </div>
        </td>
        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--gray-3)' }}>
          {client.phone || '—'}
        </td>
        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--gray-3)' }}>
          {formatDateShort(client.createdAt)}
        </td>
        <td style={{ padding: '14px 20px' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px',
            borderRadius: 12, background: client.isActive ? '#D1FAE5' : '#FEE2E2',
            color: client.isActive ? '#065F46' : '#991B1B',
          }}>
            {client.isActive ? 'Actif' : 'Inactif'}
          </span>
        </td>
        <td style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => onStatusChange(client)}
              style={{
                padding: '6px 12px', fontSize: 11, fontWeight: 600,
                borderRadius: 6, border: 'none', cursor: 'pointer',
                background: client.isActive ? 'var(--red)' : 'var(--green)',
                color: 'white', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {client.isActive ? 'Bloquer' : 'Débloquer'}
            </button>
            <button
              onClick={() => onDelete(client.id)}
              style={{
                padding: '6px 12px', fontSize: 11, fontWeight: 600,
                borderRadius: 6, border: '1px solid var(--red)',
                background: 'transparent', color: 'var(--red)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--red)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--red)';
              }}
            >
              Supprimer
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded details */}
      {isExpanded && (
        <tr style={{ background: 'var(--off)', borderBottom: '1px solid var(--gray-1)' }}>
          <td colSpan="5" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)', fontWeight: 600, marginBottom: 4 }}>ID</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{client.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)', fontWeight: 600, marginBottom: 4 }}>INSCRIT</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatDateShort(client.createdAt)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)', fontWeight: 600, marginBottom: 4 }}>E-MAIL</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{client.email}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminClients() {
  const { success, error: toastError } = useToast();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name'

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, searchTerm, filterStatus, sortBy]);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await userService.getAll({ limit: 1000 });
      const clientList = data.users ? data.users.filter(u => u.role === 'client') : [];
      setClients(clientList);
    } catch (err) {
      toastError('Erreur lors du chargement des clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = [...clients];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      result = result.filter(c => c.isActive);
    } else if (filterStatus === 'inactive') {
      result = result.filter(c => !c.isActive);
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredClients(result);
  }

  async function handleStatusChange(client) {
    try {
      await userService.toggleActive(client.id);
      success(client.isActive ? 'Client bloqué' : 'Client débloqué');
      loadClients();
    } catch (err) {
      toastError('Erreur lors du changement de statut');
    }
  }

  async function handleDelete(clientId) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée.')) {
      return;
    }
    try {
      await userService.delete(clientId);
      success('Client supprimé avec succès');
      loadClients();
    } catch (err) {
      toastError('Erreur lors de la suppression');
    }
  }

  const activeCount = clients.filter(c => c.isActive).length;
  const inactiveCount = clients.filter(c => !c.isActive).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 18, color: 'var(--gray-3)' }}>Chargement des clients…</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--gray-3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          Administration
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>
          Gestion des clients
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Gérez tous les clients de votre plateforme, consultez leurs informations et contrôlez leur accès.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        {[
          { icon: '👥', label: 'Total clients', value: clients.length, color: 'var(--blue)' },
          { icon: '✅', label: 'Actifs', value: activeCount, color: 'var(--green)' },
          { icon: '❌', label: 'Inactifs', value: inactiveCount, color: 'var(--red)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--gray-1)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginTop: 6 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-1)',
        boxShadow: 'var(--shadow-sm)',
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
          {/* Search */}
          <div>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--gray-4)',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: 6,
            }}>
              RECHERCHER
            </label>
            <input
              type="text"
              placeholder="Nom, e-mail…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid var(--gray-1)',
                borderRadius: 10,
                fontSize: 13,
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--gray-1)'}
            />
          </div>

          {/* Status filter */}
          <div>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--gray-4)',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: 6,
            }}>
              STATUT
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid var(--gray-1)',
                borderRadius: 10,
                fontSize: 13,
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--gray-4)',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: 6,
            }}>
              TRIER PAR
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid var(--gray-1)',
                borderRadius: 10,
                fontSize: 13,
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="recent">Plus récents</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-1)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {filteredClients.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--gray-3)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun client trouvé</div>
            <p style={{ fontSize: 13 }}>
              {searchTerm || filterStatus !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les clients apparaîtront ici'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--off)',
                borderBottom: '1px solid var(--gray-1)',
              }}>
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--gray-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>Client</th>
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--gray-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>Téléphone</th>
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--gray-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>Inscrit</th>
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--gray-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>Statut</th>
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'right',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--gray-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer info */}
      {filteredClients.length > 0 && (
        <div style={{
          marginTop: 16,
          fontSize: 12,
          color: 'var(--gray-3)',
          textAlign: 'center',
        }}>
          Affichage de {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} sur {clients.length}
        </div>
      )}
    </div>
  );
}
