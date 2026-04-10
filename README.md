# 📆 RDVPro — Gestion de Rendez-vous

> Plateforme professionnelle de prise et gestion de rendez-vous pour ISG Bizerte.
> Développée avec une méthodologie SCRUM dans le cadre du cursus Licence BI — Promotion 2027.

---

## 🏗️ Architecture du Projet

```
rdvpro/
├── backend/              Python / Flask REST API
│   ├── src/
│   │   ├── config/       Configuration (settings.py)
│   │   ├── models/       Modèles SQLAlchemy (User, Appointment, Notification…)
│   │   ├── controllers/  Logique métier avancée (extensible)
│   │   ├── routes/       Blueprints Flask (auth, appointments, notifications…)
│   │   ├── middleware/   Auth middleware (require_role)
│   │   ├── services/     Services métier (AuthService, NotificationService)
│   │   ├── utils/        Helpers généraux
│   │   └── validators/   Schémas de validation Marshmallow
│   ├── tests/            Tests unitaires et d'intégration (Pytest)
│   ├── logs/             Logs applicatifs
│   ├── uploads/          Fichiers uploadés (avatars)
│   ├── requirements.txt  Dépendances Python
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/             React 18 SPA
│   ├── public/           index.html, favicon
│   └── src/
│       ├── assets/
│       │   └── styles/   tokens.css · global.css · components.css
│       ├── components/
│       │   ├── common/   (réutilisables)
│       │   ├── layout/   AuthLayout · DashboardLayout · Sidebar · Header
│       │   └── ui/       (composants UI atomiques)
│       ├── pages/
│       │   ├── auth/     LoginPage · RegisterPage · ForgotPasswordPage · ResetPasswordPage
│       │   ├── client/   ClientDashboard · BookingPage · ClientAppointments
│       │   │             ClientProfile · ClientNotifications
│       │   └── admin/    AdminDashboard · AdminAppointments · AdminClients
│       │                 AdminUsers · AdminNotifications · AdminSlots
│       │                 AdminReports · AdminSettings
│       ├── context/      AuthContext · NotificationContext · ToastContext
│       ├── hooks/        useForm · useLocalStorage · useDebounce
│       ├── routes/       AppRoutes · PrivateRoute · AdminRoute
│       ├── services/     apiClient · authService · appointmentService
│       │                 notificationService · userService
│       └── utils/        validators · formatters · constants
│
├── database/
│   ├── migrations/       001_initial_schema.sql
│   └── seeds/            001_demo_data.sql
│
├── shared/
│   ├── constants/        index.js — constantes partagées front/back
│   └── types/            index.ts — définitions TypeScript
│
├── docs/                 Documentation API, architecture, diagrammes
├── scripts/              Scripts de déploiement et maintenance
├── .github/workflows/    CI/CD GitHub Actions
├── docker-compose.yml
└── .gitignore
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- (Optionnel) Docker & Docker Compose

---

### Option 1 — Docker (recommandé)

```bash
# Cloner et démarrer
git clone https://github.com/midooos/rdvpro.git
cd rdvpro
docker-compose up --build
```

- Frontend : http://localhost:3000
- Backend API : http://localhost:5000/api
- Health check : http://localhost:5000/api/health

---

### Option 2 — Développement local

#### Backend (Flask)

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# → Éditer .env avec vos valeurs (DATABASE_URL, SECRET_KEY, etc.)

# Créer la base de données PostgreSQL
createdb rdvpro_db

# Appliquer les migrations
flask db upgrade

# (Optionnel) Charger les données de démonstration
psql rdvpro_db < ../database/seeds/001_demo_data.sql

# Lancer le serveur
python src/app.py
```

#### Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# → Vérifier REACT_APP_API_URL=http://localhost:5000/api

# Lancer le serveur de développement
npm start
```

---

## 🔐 Comptes de démonstration

| Rôle   | E-mail              | Mot de passe |
|--------|---------------------|--------------|
| Admin  | admin@rdvpro.tn     | Admin123     |
| Client | client@rdvpro.tn    | Client123    |

---

## 📡 API Endpoints

### Auth
| Méthode | Endpoint                        | Description                    |
|---------|---------------------------------|--------------------------------|
| POST    | `/api/auth/register`            | Créer un compte                |
| POST    | `/api/auth/login`               | Connexion                      |
| POST    | `/api/auth/logout`              | Déconnexion                    |
| POST    | `/api/auth/refresh`             | Rafraîchir le token            |
| GET     | `/api/auth/me`                  | Profil courant                 |
| PUT     | `/api/auth/profile`             | Modifier le profil             |
| PUT     | `/api/auth/change-password`     | Changer le mot de passe        |
| POST    | `/api/auth/forgot-password`     | Demande de réinitialisation    |
| POST    | `/api/auth/reset-password`      | Réinitialisation mot de passe  |

### Appointments
| Méthode | Endpoint                              | Description                  |
|---------|---------------------------------------|------------------------------|
| GET     | `/api/appointments`                   | Liste (admin)                |
| GET     | `/api/appointments/mine`              | Mes RDV (client)             |
| GET     | `/api/appointments/available-slots`   | Créneaux disponibles         |
| POST    | `/api/appointments`                   | Créer un RDV                 |
| PATCH   | `/api/appointments/:id/confirm`       | Confirmer (admin)            |
| PATCH   | `/api/appointments/:id/cancel`        | Annuler                      |

### Notifications
| Méthode | Endpoint                              | Description                      |
|---------|---------------------------------------|----------------------------------|
| GET     | `/api/notifications`                  | Liste des notifications           |
| GET     | `/api/notifications/unread-count`     | Nombre de non lues               |
| PATCH   | `/api/notifications/:id/read`         | Marquer comme lue                |
| PATCH   | `/api/notifications/mark-all-read`    | Tout marquer comme lu            |
| DELETE  | `/api/notifications/:id`              | Supprimer                        |
| POST    | `/api/notifications/send`             | Envoyer (admin)                  |
| POST    | `/api/notifications/send-reminders`   | Envoyer rappels 48h (admin)      |

---

## 🎨 Design System

| Token         | Valeur      | Usage               |
|---------------|-------------|---------------------|
| `--navy`      | `#0B1437`   | Fond principal      |
| `--blue`      | `#1E6FD9`   | Couleur primaire    |
| `--teal`      | `#0DBAAB`   | Accent              |
| `--green`     | `#27C47A`   | Succès              |
| `--red`       | `#E5474B`   | Erreur / Danger     |
| `--amber`     | `#F5A623`   | Avertissement       |
| `--font-display` | Playfair Display | Titres      |
| `--font-body`    | DM Sans          | Corps de texte |
| `--font-mono`    | JetBrains Mono   | Labels, code   |

---

## 🔧 Stack Technique

| Couche      | Technologie                                          |
|-------------|------------------------------------------------------|
| Frontend    | React 18, React Router v6, Axios, CSS Variables      |
| Backend     | Python 3.11, Flask 3, Flask-JWT-Extended, Bcrypt     |
| Base de données | PostgreSQL 15, SQLAlchemy, Flask-Migrate         |
| Auth        | JWT (access + refresh tokens), bcrypt                |
| Email       | Flask-Mail (SMTP)                                    |
| CI/CD       | GitHub Actions                                       |
| DevOps      | Docker, Docker Compose                               |

---

## 👨‍💻 Équipe

Projet développé dans le cadre du cursus **Licence Business Intelligence**  
**ISG Bizerte** — Institut Supérieur de Gestion de Bizerte, Tunisie  
Promotion 2027 · Sous la direction de l'équipe pédagogique
