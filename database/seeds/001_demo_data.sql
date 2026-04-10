

-- Services
INSERT INTO services (name, description, duration, icon, color) VALUES
    ('Consultation',        'Consultation médicale générale',       30, '🩺', '#1E6FD9'),
    ('Suivi médical',       'Suivi et bilan de santé régulier',     45, '📋', '#0DBAAB'),
    ('Bilan annuel',        'Bilan de santé annuel complet',        60, '🏥', '#7C5CBF'),
    ('Suivi nutritionnel',  'Consultation nutritionnelle',          30, '🥗', '#27C47A'),
    ('Téléconsultation',    'Consultation en ligne par vidéo',      20, '💻', '#F5A623')
ON CONFLICT DO NOTHING;

-- Admin user  (password: Admin123)
-- bcrypt hash generated with: bcrypt.generate_password_hash("Admin123")
INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, is_verified) VALUES
    ('Admin', 'RDVPro', 'admin@rdvpro.tn',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5oHEqOrmGy',
     'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Client users (password: Client123)
INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, is_verified) VALUES
    ('Mohamed', 'Ben Ali',    'client@rdvpro.tn',    '+216 90 000 001',
     '$2b$12$KIXlkFtrGJ8OgjAQbBlrGeUbijH7X2J2cA6PJFD1bAmrJz5h3pxGu', 'client', TRUE, TRUE),
    ('Marie',   'Dupont',     'marie@example.com',   '+33 6 12 34 56 78',
     '$2b$12$KIXlkFtrGJ8OgjAQbBlrGeUbijH7X2J2cA6PJFD1bAmrJz5h3pxGu', 'client', TRUE, TRUE),
    ('Ali',     'Ben Salah',  'ali@example.com',     '+216 25 678 901',
     '$2b$12$KIXlkFtrGJ8OgjAQbBlrGeUbijH7X2J2cA6PJFD1bAmrJz5h3pxGu', 'client', TRUE, TRUE),
    ('Sara',    'Chedly',     'sara@example.com',    '+216 55 432 109',
     '$2b$12$KIXlkFtrGJ8OgjAQbBlrGeUbijH7X2J2cA6PJFD1bAmrJz5h3pxGu', 'client', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Slots (next 7 days for service 1 — Consultation)
INSERT INTO slots (service_id, date, start_time, end_time) VALUES
    (1, CURRENT_DATE + 1, '09:00', '09:30'),
    (1, CURRENT_DATE + 1, '09:30', '10:00'),
    (1, CURRENT_DATE + 1, '10:00', '10:30'),
    (1, CURRENT_DATE + 1, '10:30', '11:00'),
    (1, CURRENT_DATE + 1, '14:00', '14:30'),
    (1, CURRENT_DATE + 1, '14:30', '15:00'),
    (1, CURRENT_DATE + 2, '09:00', '09:30'),
    (1, CURRENT_DATE + 2, '10:00', '10:30'),
    (1, CURRENT_DATE + 2, '14:00', '14:30'),
    (2, CURRENT_DATE + 1, '11:00', '11:45'),
    (2, CURRENT_DATE + 2, '15:00', '15:45'),
    (3, CURRENT_DATE + 3, '09:00', '10:00'),
    (4, CURRENT_DATE + 1, '16:00', '16:30'),
    (5, CURRENT_DATE + 1, '08:00', '08:20')
ON CONFLICT DO NOTHING;
