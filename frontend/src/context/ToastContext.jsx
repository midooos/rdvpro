import React, {
  createContext, useContext, useState, useCallback, useRef
} from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((message, opts) => toast({ type: 'success', message, ...opts }), [toast]);
  const error   = useCallback((message, opts) => toast({ type: 'error',   message, ...opts }), [toast]);
  const info    = useCallback((message, opts) => toast({ type: 'info',    message, ...opts }), [toast]);
  const warning = useCallback((message, opts) => toast({ type: 'warning', message, ...opts }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Internal Toast Container ──────────────────────────────────────────────
const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: { bg: '#D1FAE5', border: '#6EE7B7', icon: '#065F46', text: '#065F46' },
  error:   { bg: '#FEE2E2', border: '#FCA5A5', icon: '#991B1B', text: '#991B1B' },
  info:    { bg: '#DBEAFE', border: '#93C5FD', icon: '#1E40AF', text: '#1E40AF' },
  warning: { bg: '#FEF3C7', border: '#FCD34D', icon: '#92400E', text: '#92400E' },
};

function ToastContainer({ toasts, dismiss }) {
  const containerStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 9999,
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const c = COLORS[toast.type];
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(11,20,55,0.12)',
    minWidth: 280,
    maxWidth: 400,
    pointerEvents: 'all',
    animation: 'slideInRight 0.25s ease',
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={style}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: c.icon, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {ICONS[toast.type]}
        </span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.text }}>
          {toast.message}
        </span>
        <button
          onClick={() => onDismiss(toast.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: c.icon, fontSize: 16, lineHeight: 1, padding: 2,
          }}
        >×</button>
      </div>
    </>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
