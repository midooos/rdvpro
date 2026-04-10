// ─── RDVPro Date / Format Utilities ──────────────────────────────────────

/**
 * Format a date to French locale string
 * e.g. "lundi 14 avril 2025"
 */
export function formatDateFull(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Format a date to short format
 * e.g. "14/04/2025"
 */
export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('fr-FR');
}

/**
 * Format time — e.g. "10h30"
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(':', 'h');
}

/**
 * Format date + time together — e.g. "Lun. 14 avr., 10h30"
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const datePart = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const timePart = formatTime(d);
  return `${datePart}, ${timePart}`;
}

/**
 * Relative time — e.g. "il y a 3 heures", "dans 2 jours"
 */
export function formatRelative(date) {
  const diff = new Date(date) - new Date();
  const abs  = Math.abs(diff);
  const rtf  = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

  if (abs < 60_000)         return rtf.format(Math.round(diff / 1000), 'second');
  if (abs < 3_600_000)      return rtf.format(Math.round(diff / 60_000), 'minute');
  if (abs < 86_400_000)     return rtf.format(Math.round(diff / 3_600_000), 'hour');
  if (abs < 2_592_000_000)  return rtf.format(Math.round(diff / 86_400_000), 'day');
  return rtf.format(Math.round(diff / 2_592_000_000), 'month');
}

/**
 * Get initials from a full name — "Mohamed Ben Ali" → "MBA"
 */
export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Truncate long text
 */
export function truncate(str, max = 60) {
  return str?.length > max ? str.slice(0, max) + '…' : str;
}

/**
 * Capitalize first letter
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate avatar background color from string (deterministic)
 */
const AVATAR_COLORS = [
  '#1E6FD9', '#0DBAAB', '#7C5CBF', '#F5A623', '#27C47A', '#E5474B',
];
export function avatarColor(name = '') {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Format a number as currency (TND)
 */
export function formatCurrency(amount, currency = 'TND') {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency }).format(amount);
}
