import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ role = 'client' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--off)' }}>
      {/* Sidebar */}
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11,20,55,0.5)',
            zIndex: 'calc(var(--z-nav) - 1)',
          }}
        />
      )}

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        <Header role={role} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{
          flex: 1,
          padding: 'var(--space-8)',
          maxWidth: 'var(--container-max)',
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          [data-sidebar] { transform: translateX(-100%); }
          [data-sidebar].open { transform: translateX(0); }
          [data-main] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
