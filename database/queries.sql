-- ============================================================
-- RDVPro — Requêtes utiles (Admin / Reporting / Maintenance)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- SECTION 1 — DASHBOARD ADMIN
-- ════════════════════════════════════════════════════════════

-- Snapshot complet du tableau de bord (utilise la vue v_admin_dashboard)
SELECT * FROM v_admin_dashboard;


-- RDV d'aujourd'hui avec toutes les infos
SELECT
    TO_CHAR(date, 'HH24:MI')    AS heure,
    client_first_name || ' ' || client_last_name AS client,
    service_name,
    status,
    note
FROM v_appointments_full
WHERE DATE(date) = CURRENT_DATE
ORDER BY date;


-- RDV des 7 prochains jours
SELECT
    DATE(date)                                    AS jour,
    COUNT(*)                                      AS total,
    COUNT(*) FILTER (WHERE status = 'confirmed')  AS confirmés,
    COUNT(*) FILTER (WHERE status = 'pending')    AS en_attente
FROM appointments
WHERE date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY DATE(date)
ORDER BY jour;


-- ════════════════════════════════════════════════════════════
-- SECTION 2 — GESTION DES RENDEZ-VOUS
-- ════════════════════════════════════════════════════════════

-- Tous les RDV en attente de confirmation
SELECT
    a.id,
    u.first_name || ' ' || u.last_name AS client,
    s.name                             AS service,
    TO_CHAR(a.date, 'DD/MM/YYYY HH24:MI') AS date_rdv,
    a.note,
    a.created_at
FROM appointments a
JOIN users    u ON u.id = a.client_id
JOIN services s ON s.id = a.service_id
WHERE a.status = 'pending'
ORDER BY a.date;


-- RDV confirmés avec rappel à envoyer dans les prochaines 48h
SELECT
    a.id,
    u.email,
    u.first_name,
    s.name       AS service,
    a.date
FROM appointments a
JOIN users    u ON u.id = a.client_id
JOIN services s ON s.id = a.service_id
WHERE a.status        = 'confirmed'
  AND a.reminder_sent = FALSE
  AND a.date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
ORDER BY a.date;


-- Confirmer un RDV (remplacer :id)
UPDATE appointments
SET status = 'confirmed', updated_at = NOW()
WHERE id = :id AND status = 'pending';


-- Annuler un RDV avec raison
UPDATE appointments
SET status = 'cancelled',
    cancellation_reason = 'Annulé par l''administrateur',
    updated_at = NOW()
WHERE id = :id;


-- Marquer un RDV comme terminé
UPDATE appointments
SET status = 'completed', updated_at = NOW()
WHERE id = :id AND status = 'confirmed';


-- ════════════════════════════════════════════════════════════
-- SECTION 3 — CRÉNEAUX (SLOTS)
-- ════════════════════════════════════════════════════════════

-- Créneaux disponibles pour un service donné et une date
SELECT
    sl.id,
    TO_CHAR(sl.start_time, 'HH24:MI') AS début,
    TO_CHAR(sl.end_time,   'HH24:MI') AS fin
FROM slots sl
JOIN services s ON s.id = sl.service_id
WHERE sl.service_id = 1              -- remplacer par l'id du service
  AND sl.date       = '2026-04-15'   -- remplacer par la date
  AND sl.is_taken   = FALSE
ORDER BY sl.start_time;


-- Taux d'occupation par service cette semaine
SELECT
    s.name,
    COUNT(sl.id)                                    AS total_créneaux,
    COUNT(sl.id) FILTER (WHERE sl.is_taken = TRUE)  AS pris,
    ROUND(100.0 * COUNT(sl.id) FILTER (WHERE sl.is_taken = TRUE)
        / NULLIF(COUNT(sl.id), 0), 1)               AS taux_occupation_pct
FROM services s
JOIN slots sl ON sl.service_id = s.id
WHERE sl.date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
GROUP BY s.id, s.name
ORDER BY taux_occupation_pct DESC;


-- Générer des créneaux pour une semaine complète (service 1, 09h-17h, 30 min)
-- (À adapter selon les besoins)
INSERT INTO slots (service_id, date, start_time, end_time)
SELECT
    1 AS service_id,
    gs::DATE AS date,
    gt::TIME AS start_time,
    (gt + INTERVAL '30 minutes')::TIME AS end_time
FROM
    generate_series(CURRENT_DATE + 1, CURRENT_DATE + 7, '1 day'::INTERVAL) AS gs,
    generate_series('09:00'::TIME, '16:30'::TIME, '30 minutes'::INTERVAL) AS gt
WHERE EXTRACT(DOW FROM gs) NOT IN (0, 6)   -- pas de week-end
ON CONFLICT (service_id, date, start_time) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- SECTION 4 — GESTION DES UTILISATEURS
-- ════════════════════════════════════════════════════════════

-- Lister tous les clients actifs avec leur nombre de RDV
SELECT
    u.id,
    u.first_name || ' ' || u.last_name AS nom,
    u.email,
    u.phone,
    u.created_at::DATE                 AS inscrit_le,
    COUNT(a.id)                        AS nb_rdv_total,
    COUNT(a.id) FILTER (WHERE a.status = 'completed')  AS nb_terminés,
    COUNT(a.id) FILTER (WHERE a.status = 'cancelled')  AS nb_annulés,
    MAX(a.date)::DATE                  AS dernier_rdv
FROM users u
LEFT JOIN appointments a ON a.client_id = u.id
WHERE u.role = 'client' AND u.is_active = TRUE
GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at
ORDER BY nb_rdv_total DESC;


-- Désactiver un utilisateur (soft delete)
UPDATE users SET is_active = FALSE WHERE id = :id;

-- Réactiver un utilisateur
UPDATE users SET is_active = TRUE WHERE id = :id;

-- Changer le rôle d'un utilisateur
UPDATE users SET role = 'admin' WHERE id = :id;


-- ════════════════════════════════════════════════════════════
-- SECTION 5 — NOTIFICATIONS
-- ════════════════════════════════════════════════════════════

-- Utilisateurs avec le plus de notifications non lues
SELECT * FROM v_unread_notifications LIMIT 20;

-- Envoyer une notification à tous les clients actifs
INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'system', 'Maintenance prévue 🔧',
    'Le service sera indisponible samedi de 02h à 04h.'
FROM users
WHERE role = 'client' AND is_active = TRUE;

-- Supprimer toutes les notifications lues de plus de 30 jours
DELETE FROM notifications
WHERE is_read = TRUE
  AND created_at < NOW() - INTERVAL '30 days';


-- ════════════════════════════════════════════════════════════
-- SECTION 6 — REPORTING
-- ════════════════════════════════════════════════════════════

-- Statistiques globales par service (utilise la vue)
SELECT * FROM v_service_stats;

-- Évolution des RDV sur les 30 derniers jours
SELECT * FROM v_daily_stats
WHERE day >= CURRENT_DATE - 30;

-- Clients les plus actifs (top 10)
SELECT
    u.first_name || ' ' || u.last_name AS client,
    u.email,
    COUNT(a.id) AS nb_rdv,
    COUNT(a.id) FILTER (WHERE a.status = 'completed') AS terminés
FROM users u
JOIN appointments a ON a.client_id = u.id
WHERE u.role = 'client'
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY nb_rdv DESC
LIMIT 10;

-- Taux d'annulation par mois (6 derniers mois)
SELECT
    TO_CHAR(DATE_TRUNC('month', date), 'MM/YYYY') AS mois,
    COUNT(*)                                        AS total,
    COUNT(*) FILTER (WHERE status = 'cancelled')    AS annulés,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')
        / NULLIF(COUNT(*), 0), 1)                   AS taux_annulation_pct
FROM appointments
WHERE date >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', date)
ORDER BY DATE_TRUNC('month', date);


-- ════════════════════════════════════════════════════════════
-- SECTION 7 — MAINTENANCE
-- ════════════════════════════════════════════════════════════

-- Nettoyer les tokens expirés
DELETE FROM refresh_tokens      WHERE expires_at < NOW();
DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;

-- Vérifier la cohérence slots ↔ appointments
-- (slots marqués pris mais sans RDV actif)
SELECT sl.id, sl.date, sl.start_time, sl.service_id
FROM slots sl
WHERE sl.is_taken = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.slot_id = sl.id
        AND a.status NOT IN ('cancelled', 'no_show')
  );

-- Corriger les incohérences
UPDATE slots SET is_taken = FALSE
WHERE is_taken = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.slot_id = slots.id
        AND a.status NOT IN ('cancelled', 'no_show')
  );

-- Taille des tables
SELECT
    relname                          AS table_name,
    pg_size_pretty(pg_total_relation_size(oid)) AS total_size,
    n_live_tup                       AS lignes_actives
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(oid) DESC;
