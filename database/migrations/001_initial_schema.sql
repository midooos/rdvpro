

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(80)  NOT NULL,
    last_name     VARCHAR(80)  NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    phone         VARCHAR(30),
    role          VARCHAR(20)  NOT NULL DEFAULT 'client',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    avatar_url    VARCHAR(256),
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    duration    INTEGER NOT NULL, -- minutes
    icon        VARCHAR(10),
    color       VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Slots (FIXED: added UNIQUE constraint)
CREATE TABLE IF NOT EXISTS slots (
    id         SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date       DATE    NOT NULL,
    start_time TIME    NOT NULL,
    end_time   TIME    NOT NULL,
    is_taken   BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_slots_service_date_time UNIQUE (service_id, date, start_time)
);
CREATE INDEX IF NOT EXISTS idx_slots_service_date ON slots(service_id, date);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id                  SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id          INTEGER NOT NULL REFERENCES services(id),
    slot_id             INTEGER REFERENCES slots(id),
    date                TIMESTAMP NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending',
    note                TEXT,
    cancellation_reason TEXT,
    reminder_sent       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date   ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type           VARCHAR(60)  NOT NULL,
    title          VARCHAR(200) NOT NULL,
    message        TEXT         NOT NULL,
    is_read        BOOLEAN DEFAULT FALSE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    appointment_confirmed   BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_reminder_48 BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_cancelled   BOOLEAN NOT NULL DEFAULT TRUE,
    appointment_updated     BOOLEAN NOT NULL DEFAULT TRUE,
    marketing               BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(256) NOT NULL UNIQUE,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP    NOT NULL,
    revoked    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rt_token ON refresh_tokens(token);
