

-- users : rôle valide uniquement
ALTER TABLE users
    ADD CONSTRAINT chk_users_role
    CHECK (role IN ('admin', 'client'));

-- appointments : statut valide uniquement
ALTER TABLE appointments
    ADD CONSTRAINT chk_appointments_status
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'));

-- slots : end_time doit être après start_time
ALTER TABLE slots
    ADD CONSTRAINT chk_slots_time_order
    CHECK (end_time > start_time);

-- slots : pas deux créneaux identiques pour le même service/date
ALTER TABLE slots
    ADD CONSTRAINT uq_slot_service_date_start
    UNIQUE (service_id, date, start_time);

-- appointments : un créneau ne peut être lié qu'à un seul RDV actif
CREATE UNIQUE INDEX IF NOT EXISTS uq_slot_active_appointment
    ON appointments (slot_id)
    WHERE slot_id IS NOT NULL
      AND status NOT IN ('cancelled', 'no_show');

-- services : durée entre 5 et 480 minutes
ALTER TABLE services
    ADD CONSTRAINT chk_services_duration
    CHECK (duration BETWEEN 5 AND 480);

-- ── 2. Table notification_preferences ────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_confirmed   BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_reminder_48 BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_cancelled   BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_updated     BOOLEAN NOT NULL DEFAULT TRUE,
    marketing               BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_notif_prefs_user UNIQUE (user_id)
);

-- Créer les préférences par défaut pour les utilisateurs existants
INSERT INTO notification_preferences (user_id)
    SELECT id FROM users
    ON CONFLICT (user_id) DO NOTHING;

-- ── 3. Table audit_logs (traçabilité des actions admin) ───────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(80)  NOT NULL,  -- ex: 'appointment.confirm', 'user.deactivate'
    entity_type VARCHAR(40),            -- ex: 'appointment', 'user'
    entity_id   INTEGER,
    details     JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ── 4. Trigger : updated_at automatique ──────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Appliquer sur appointments
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Appliquer sur notification_preferences
DROP TRIGGER IF EXISTS trg_notif_prefs_updated_at ON notification_preferences;
CREATE TRIGGER trg_notif_prefs_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. Trigger : libérer le slot quand un RDV est annulé ─────────────

CREATE OR REPLACE FUNCTION free_slot_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('cancelled', 'no_show') AND OLD.status NOT IN ('cancelled', 'no_show') THEN
        UPDATE slots SET is_taken = FALSE WHERE id = NEW.slot_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_free_slot_on_cancel ON appointments;
CREATE TRIGGER trg_free_slot_on_cancel
    AFTER UPDATE OF status ON appointments
    FOR EACH ROW
    WHEN (NEW.slot_id IS NOT NULL)
    EXECUTE FUNCTION free_slot_on_cancel();

-- ── 6. Trigger : marquer slot is_taken à la création d'un RDV ────────

CREATE OR REPLACE FUNCTION mark_slot_taken()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slot_id IS NOT NULL THEN
        UPDATE slots SET is_taken = TRUE WHERE id = NEW.slot_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mark_slot_taken ON appointments;
CREATE TRIGGER trg_mark_slot_taken
    AFTER INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION mark_slot_taken();

-- ── 7. Index supplémentaires pour les performances ───────────────────

-- Recherche rapide des RDV d'un client par statut
CREATE INDEX IF NOT EXISTS idx_appt_client_status
    ON appointments(client_id, status);

-- Recherche rapide des RDV à venir (pour rappels)
CREATE INDEX IF NOT EXISTS idx_appt_date_status
    ON appointments(date, status)
    WHERE status = 'confirmed';

-- Recherche des tokens non expirés
CREATE INDEX IF NOT EXISTS idx_rt_user_active
    ON refresh_tokens(user_id)
    WHERE revoked = FALSE;

CREATE INDEX IF NOT EXISTS idx_prt_user_valid
    ON password_reset_tokens(user_id)
    WHERE used = FALSE;

-- Notifications non lues (polling fréquent)
CREATE INDEX IF NOT EXISTS idx_notif_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;
