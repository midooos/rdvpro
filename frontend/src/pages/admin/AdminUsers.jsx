import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { getInitials, avatarColor, formatDateShort } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export default function AdminUsers() {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  // ✅ FIXED: stable function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll({
        search: debouncedSearch,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(data.users || []);
    } catch {
      toastError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, toastError]);

  // ✅ FIXED: clean dependency
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      await userService.toggleActive(user.id);
      success(`Compte ${user.isActive ? 'désactivé' : 'activé'}`);
      fetchUsers();
    } catch {
      toastError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await userService.delete(id);
      success('Utilisateur supprimé');
      fetchUsers();
    } catch {
      toastError('Erreur lors de la suppression');
    }
  };

  const ROLE_COLORS = { admin: '#EDE9FE', client: '#DBEAFE' };
  const ROLE_TEXT = { admin: '#5B21B6', client: '#1E40AF' };

  return (
    <div>
      <h1>Utilisateurs</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filter */}
      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="all">Tous</option>
        <option value="admin">Admin</option>
        <option value="client">Client</option>
      </select>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>Aucun utilisateur</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Email</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                {/* Avatar + Name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: '50%',
                        background: avatarColor(u.firstName),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {getInitials(`${u.firstName} ${u.lastName}`)}
                    </div>

                    {u.firstName} {u.lastName}
                  </div>
                </td>

                {/* Role */}
                <td>
                  <span
                    style={{
                      background: ROLE_COLORS[u.role],
                      color: ROLE_TEXT[u.role],
                      padding: '4px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {u.role}
                  </span>
                </td>

                <td>{u.email}</td>

                <td>{formatDateShort(u.createdAt)}</td>

                <td>{u.isActive ? 'Actif' : 'Inactif'}</td>

                <td>
                  <button onClick={() => handleToggleActive(u)}>
                    {u.isActive ? 'Désactiver' : 'Activer'}
                  </button>

                  <button onClick={() => handleDelete(u.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}