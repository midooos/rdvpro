/**
 * RDVPro — Shared TypeScript Type Definitions
 * Reference types for the full-stack application.
 */

// ── Users & Auth ──────────────────────────────────────────────────────────

export type Role = 'admin' | 'client';

export interface User {
  id:          number;
  firstName:   string;
  lastName:    string;
  email:       string;
  phone?:      string;
  role:        Role;
  isActive:    boolean;
  isVerified:  boolean;
  avatarUrl?:  string;
  createdAt:   string; // ISO string
}

export interface AuthState {
  user:            User | null;
  loading:         boolean;
  error:           string | null;
  isAuthenticated: boolean;
  isAdmin:         boolean;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  phone?:    string;
}

export interface AuthResponse {
  user:         User;
  token:        string;
  refreshToken: string;
}

// ── Services ──────────────────────────────────────────────────────────────

export interface Service {
  id:          number;
  name:        string;
  description: string;
  duration:    number;   // minutes
  icon:        string;
  color:       string;
  isActive:    boolean;
}

// ── Slots ─────────────────────────────────────────────────────────────────

export interface Slot {
  id:        number;
  serviceId: number;
  date:      string;   // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime:   string;   // HH:MM
  isTaken:   boolean;
}

// ── Appointments ──────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id:               number;
  clientId:         number;
  clientName?:      string;
  serviceId:        number;
  serviceName?:     string;
  slotId?:          number;
  date:             string;   // ISO datetime
  status:           AppointmentStatus;
  note?:            string;
  cancellationReason?: string;
  reminderSent:     boolean;
  createdAt:        string;
}

export interface CreateAppointmentPayload {
  serviceId: number;
  date:      string;   // YYYY-MM-DD
  time:      string;   // HHhMM
  note?:     string;
}

// ── Notifications ─────────────────────────────────────────────────────────

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'appointment_updated'
  | 'new_appointment'
  | 'welcome'
  | 'system';

export interface Notification {
  id:             number;
  type:           NotificationType;
  title:          string;
  message:        string;
  isRead:         boolean;
  appointmentId?: number;
  recipientName?: string;
  createdAt:      string;
}

export interface NotificationPreferences {
  appointmentConfirmed:  boolean;
  appointmentReminder48: boolean;
  appointmentCancelled:  boolean;
  marketing:             boolean;
}

// ── API Responses ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:   T[];
  total:  number;
  page:   number;
  pages:  number;
  limit:  number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?:   string;
}
