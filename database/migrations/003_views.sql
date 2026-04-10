

-- ── 1. Vue : résumé d'un RDV avec toutes les infos jointes ───────────

CREATE OR REPLACE VIEW v_appointments_full AS
SELECT
    a.id,
    a.date,
    a.status,
    a.note,
    a.cancellation_reason,
    a.reminder_sent,
    a.created_at,
    a.updated_at,
    -- Client
    u.id            AS client_id,
    u.first_name    AS client_first_name,
    u.last_name     AS client_last_name,
    u.email         AS client_email,
    u.phone         AS client_phone,
    -- Service
    s.id            AS service_id,
    s.name          AS service_name,
    s.duration      AS service_duration,
    s.icon          AS service_icon,
    s.color         AS service_color,
    -- Slot
    sl.id           AS slot_id,
    sl.start_time   AS slot_start,
    sl.end_time     AS slot_end
FROM appointments a
JOIN users    u  ON u.id  = a.client_id
JOIN services s  ON s.id  = a.service_id
LEFT JOIN slots sl ON sl.id = a.slot_id;

-- ── 2. Vue : statistiques journalières ───────────────────────────────

CREATE OR REPLACE VIEW v_daily_stats AS
SELECT
    DATE(a.date)                                            AS day,
    COUNT(*)                                                AS total,
    COUNT(*) FILTER (WHERE a.status = 'confirmed')          AS confirmed,
    COUNT(*) FILTER (WHERE a.status = 'pending')            AS pending,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')          AS cancelled,
    COUNT(*) FILTER (WHERE a.status = 'completed')          AS completed,
    COUNT(*) FILTER (WHERE a.status = 'no_show')            AS no_show,
    COUNT(DISTINCT a.client_id)                             AS unique_clients
FROM appointments a
GROUP BY DATE(a.date)
ORDER BY day DESC;

-- ── 3. Vue : statistiques par service ────────────────────────────────

CREATE OR REPLACE VIEW v_service_stats AS
SELECT
    s.id,
    s.name,
    s.icon,
    s.color,
    s.duration,
    COUNT(a.id)                                              AS total_appointments,
    COUNT(a.id) FILTER (WHERE a.status = 'confirmed')        AS confirmed,
    COUNT(a.id) FILTER (WHERE a.status = 'completed')        AS completed,
    COUNT(a.id) FILTER (WHERE a.status = 'cancelled')        AS cancelled,
    ROUND(
        100.0 * COUNT(a.id) FILTER (WHERE a.status IN ('confirmed','completed'))
        / NULLIF(COUNT(a.id), 0), 1
    )                                                        AS success_rate_pct
FROM services s
LEFT JOIN appointments a ON a.service_id = s.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.icon, s.color, s.duration
ORDER BY total_appointments DESC;

-- ── 4. Vue : créneaux disponibles (non pris) ─────────────────────────

CREATE OR REPLACE VIEW v_available_slots AS
SELECT
    sl.id,
    sl.date,
    sl.start_time,
    sl.end_time,
    s.id    AS service_id,
    s.name  AS service_name,
    s.icon  AS service_icon,
    s.color AS service_color
FROM slots sl
JOIN services s ON s.id = sl.service_id
WHERE sl.is_taken = FALSE
  AND sl.date >= CURRENT_DATE
  AND s.is_active = TRUE
ORDER BY sl.date, sl.start_time;

-- ── 5. Vue : tableau de bord admin (snapshot actuel) ─────────────────

CREATE OR REPLACE VIEW v_admin_dashboard AS
SELECT
    (SELECT COUNT(*) FROM appointments WHERE DATE(date) = CURRENT_DATE)                          AS today_total,
    (SELECT COUNT(*) FROM appointments WHERE DATE(date) = CURRENT_DATE AND status='confirmed')    AS today_confirmed,
    (SELECT COUNT(*) FROM appointments WHERE DATE(date) = CURRENT_DATE AND status='pending')      AS today_pending,
    (SELECT COUNT(*) FROM appointments WHERE status = 'pending')                                  AS all_pending,
    (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled'
        AND DATE(created_at) = CURRENT_DATE)                                                      AS today_cancellations,
    (SELECT COUNT(*) FROM users WHERE role = 'client' AND is_active = TRUE)                       AS active_clients,
    (SELECT COUNT(*) FROM slots WHERE date >= CURRENT_DATE AND is_taken = FALSE)                  AS available_slots,
    (SELECT COUNT(*) FROM appointments WHERE reminder_sent = FALSE
        AND status = 'confirmed' AND date BETWEEN NOW() AND NOW() + INTERVAL '48 hours')          AS reminders_due;

-- ── 6. Vue : notifications non lues par utilisateur ──────────────────

CREATE OR REPLACE VIEW v_unread_notifications AS
SELECT
    n.user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(*) AS unread_count,
    MAX(n.created_at) AS latest_at
FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE n.is_read = FALSE
GROUP BY n.user_id, u.first_name, u.last_name, u.email
ORDER BY latest_at DESC;
