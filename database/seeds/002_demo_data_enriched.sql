

DO $$
DECLARE
    d DATE;
    svc INTEGER;
    times TIME[] := ARRAY[
        '08:00'::TIME, '08:30'::TIME, '09:00'::TIME, '09:30'::TIME,
        '10:00'::TIME, '10:30'::TIME, '11:00'::TIME, '11:30'::TIME,
        '14:00'::TIME, '14:30'::TIME, '15:00'::TIME, '15:30'::TIME,
        '16:00'::TIME, '16:30'::TIME
    ];
    durations INTEGER[] := ARRAY[30, 45, 60, 30, 20]; -- durées par service
    t TIME;
    dur INTEGER;
BEGIN
    FOR day_offset IN 1..30 LOOP
        d := CURRENT_DATE + day_offset;
        -- Ignorer week-ends
        IF EXTRACT(DOW FROM d) IN (0, 6) THEN CONTINUE; END IF;

        FOR svc IN 1..5 LOOP
            dur := durations[svc];
            FOREACH t IN ARRAY times LOOP
                -- Ne pas insérer si le créneau dépasse 17h00
                IF t + (dur || ' minutes')::INTERVAL <= '17:00'::TIME THEN
                    INSERT INTO slots (service_id, date, start_time, end_time)
                    VALUES (svc, d, t, t + (dur || ' minutes')::INTERVAL)
                    ON CONFLICT (service_id, date, start_time) DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ── RDV de démo (passés + à venir) ───────────────────────────────────

-- Client 1 (Mohamed Ben Ali) — user id 2
INSERT INTO appointments (client_id, service_id, date, status, note, reminder_sent) VALUES
    (2, 1, NOW() - INTERVAL '15 days', 'completed', 'Douleurs dorsales',       TRUE),
    (2, 2, NOW() - INTERVAL '7 days',  'completed', 'Bilan de routine',        TRUE),
    (2, 1, NOW() + INTERVAL '2 days',  'confirmed', 'Renouvellement ordonnance', FALSE),
    (2, 3, NOW() + INTERVAL '9 days',  'pending',   'Bilan annuel complet',    FALSE)
ON CONFLICT DO NOTHING;

-- Client 2 (Marie Dupont) — user id 3
INSERT INTO appointments (client_id, service_id, date, status, note, reminder_sent) VALUES
    (3, 1, NOW() - INTERVAL '20 days', 'completed', 'Consultation générale',   TRUE),
    (3, 4, NOW() - INTERVAL '3 days',  'no_show',   '',                        TRUE),
    (3, 5, NOW() + INTERVAL '1 day',   'confirmed', 'Téléconsultation initiale', FALSE),
    (3, 1, NOW() + INTERVAL '14 days', 'pending',   '',                        FALSE)
ON CONFLICT DO NOTHING;

-- Client 3 (Ali Ben Salah) — user id 4
INSERT INTO appointments (client_id, service_id, date, status, note, reminder_sent, cancellation_reason) VALUES
    (4, 2, NOW() - INTERVAL '10 days', 'completed', 'Suivi tension',           TRUE,  NULL),
    (4, 1, NOW() - INTERVAL '5 days',  'cancelled', '',                        FALSE, 'Empêchement personnel'),
    (4, 3, NOW() + INTERVAL '5 days',  'confirmed', 'Bilan complet annuel',    FALSE, NULL)
ON CONFLICT DO NOTHING;

-- Client 4 (Sara Chedly) — user id 5
INSERT INTO appointments (client_id, service_id, date, status, note, reminder_sent) VALUES
    (5, 4, NOW() - INTERVAL '8 days',  'completed', 'Suivi régime',            TRUE),
    (5, 4, NOW() + INTERVAL '3 days',  'confirmed', '',                        FALSE),
    (5, 5, NOW() + INTERVAL '7 days',  'pending',   'Première téléconsultation', FALSE)
ON CONFLICT DO NOTHING;

-- ── Notifications de démo ─────────────────────────────────────────────

-- Notifications pour client 1
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
    (2, 'welcome',              'Bienvenue sur RDVPro 👋',
        'Bonjour Mohamed ! Votre compte a été créé avec succès.', TRUE),
    (2, 'appointment_confirmed', 'Rendez-vous confirmé ✅',
        'Votre RDV pour Consultation le ' || TO_CHAR(NOW() + INTERVAL '2 days', 'DD/MM/YYYY') || ' a été confirmé.', FALSE),
    (2, 'appointment_reminder',  'Rappel de rendez-vous ⏰',
        'Rappel : vous avez un RDV dans 48h pour Consultation.', FALSE)
ON CONFLICT DO NOTHING;

-- Notifications pour client 2
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
    (3, 'welcome',              'Bienvenue sur RDVPro 👋',
        'Bonjour Marie ! Votre compte a été créé avec succès.', TRUE),
    (3, 'appointment_confirmed', 'Rendez-vous confirmé ✅',
        'Votre RDV pour Téléconsultation demain a été confirmé.', FALSE)
ON CONFLICT DO NOTHING;

-- Notifications admin (user id 1)
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
    (1, 'new_appointment', 'Nouveau rendez-vous 📅',
        'Mohamed Ben Ali a réservé un RDV pour Consultation.', TRUE),
    (1, 'new_appointment', 'Nouveau rendez-vous 📅',
        'Sara Chedly a réservé un RDV pour Suivi nutritionnel.', FALSE),
    (1, 'new_appointment', 'Nouveau rendez-vous 📅',
        'Marie Dupont a réservé un RDV pour Téléconsultation.', FALSE)
ON CONFLICT DO NOTHING;

-- ── Préférences de notification par défaut ────────────────────────────

INSERT INTO notification_preferences (user_id)
    SELECT id FROM users
    ON CONFLICT (user_id) DO NOTHING;
