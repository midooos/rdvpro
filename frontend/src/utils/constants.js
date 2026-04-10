// ─── RDVPro Constants ─────────────────────────────────────────────────────

export const APP_NAME = 'RDVPro';
export const APP_TAGLINE = 'GESTION DE RENDEZ-VOUS';

export const ROLES = {
  ADMIN:  'admin',
  CLIENT: 'client',
};

export const APPOINTMENT_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'no_show',
};

export const APPOINTMENT_STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show:   'Absent',
};

export const APPOINTMENT_STATUS_BADGE = {
  pending:   'badge-orange',
  confirmed: 'badge-green',
  cancelled: 'badge-red',
  completed: 'badge-blue',
  no_show:   'badge-gray',
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT_CONFIRMED:  'appointment_confirmed',
  APPOINTMENT_CANCELLED:  'appointment_cancelled',
  APPOINTMENT_REMINDER:   'appointment_reminder',
  APPOINTMENT_UPDATED:    'appointment_updated',
  NEW_APPOINTMENT:        'new_appointment',   // admin
  WELCOME:                'welcome',
  SYSTEM:                 'system',
};

export const NOTIFICATION_ICONS = {
  appointment_confirmed: '✅',
  appointment_cancelled: '❌',
  appointment_reminder:  '⏰',
  appointment_updated:   '📝',
  new_appointment:       '📅',
  welcome:               '👋',
  system:                '🔔',
};

export const SERVICES = [
  { id: 1, name: 'Consultation',       duration: 30, icon: '🩺', color: '#1E6FD9' },
  { id: 2, name: 'Suivi médical',      duration: 45, icon: '📋', color: '#0DBAAB' },
  { id: 3, name: 'Bilan annuel',       duration: 60, icon: '🏥', color: '#7C5CBF' },
  { id: 4, name: 'Suivi nutritionnel', duration: 30, icon: '🥗', color: '#27C47A' },
  { id: 5, name: 'Téléconsultation',   duration: 20, icon: '💻', color: '#F5A623' },
];

export const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

export const PAGINATION_LIMIT = 10;
