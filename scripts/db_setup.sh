#!/usr/bin/env bash
# ============================================================
# RDVPro — Script de setup de la base de données
# Usage : ./scripts/db_setup.sh [reset]
#   reset  : supprime et recrée la DB complètement (ATTENTION : destructif)
# ============================================================

set -e

# ── Config (peut être surchargée par les variables d'environnement) ───
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-rdvpro_db}"
DB_USER="${DB_USER:-rdvpro}"
DB_PASS="${DB_PASS:-rdvpro}"

export PGPASSWORD="$DB_PASS"
PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER"

MIGRATIONS_DIR="$(dirname "$0")/../database/migrations"
SEEDS_DIR="$(dirname "$0")/../database/seeds"

# ── Couleurs ──────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║      RDVPro — Database Setup             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 0. Reset si demandé ───────────────────────────────────────────────
if [ "$1" = "reset" ]; then
    warn "RESET demandé — suppression de la base '$DB_NAME'…"
    read -p "Confirmer ? (oui/NON) : " confirm
    if [ "$confirm" != "oui" ]; then
        echo "Annulé."; exit 0
    fi
    $PSQL -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
    ok "Base supprimée"
fi

# ── 1. Créer la base si elle n'existe pas ────────────────────────────
echo "→ Vérification de la base '$DB_NAME'…"
if ! $PSQL -d postgres -lqt 2>/dev/null | cut -d'|' -f1 | grep -qw "$DB_NAME"; then
    $PSQL -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || \
        err "Impossible de créer la base. Vérifiez les credentials."
    ok "Base '$DB_NAME' créée"
else
    ok "Base '$DB_NAME' déjà existante"
fi

# ── 2. Table de tracking des migrations ──────────────────────────────
$PSQL -d "$DB_NAME" <<'EOF'
CREATE TABLE IF NOT EXISTS _migrations (
    id         SERIAL PRIMARY KEY,
    filename   VARCHAR(200) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW()
);
EOF
ok "Table _migrations prête"

# ── 3. Appliquer les migrations ───────────────────────────────────────
echo ""
echo "→ Application des migrations…"
for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
    fname=$(basename "$migration")
    # Vérifier si déjà appliquée
    already=$($PSQL -d "$DB_NAME" -tAc \
        "SELECT COUNT(*) FROM _migrations WHERE filename='$fname';" 2>/dev/null || echo 0)
    if [ "$already" = "1" ]; then
        echo "  ↳ $fname — déjà appliquée, ignorée"
        continue
    fi
    echo -n "  ↳ $fname… "
    if $PSQL -d "$DB_NAME" -f "$migration" > /dev/null 2>&1; then
        $PSQL -d "$DB_NAME" -c \
            "INSERT INTO _migrations (filename) VALUES ('$fname') ON CONFLICT DO NOTHING;" \
            > /dev/null
        ok "OK"
    else
        # Réessayer avec sortie d'erreur visible
        $PSQL -d "$DB_NAME" -f "$migration"
        err "Échec sur $fname"
    fi
done

# ── 4. Appliquer les seeds (dev uniquement) ───────────────────────────
if [ "${FLASK_ENV:-development}" != "production" ]; then
    echo ""
    echo "→ Application des seeds (dev)…"
    for seed in $(ls "$SEEDS_DIR"/*.sql | sort); do
        fname=$(basename "$seed")
        already=$($PSQL -d "$DB_NAME" -tAc \
            "SELECT COUNT(*) FROM _migrations WHERE filename='$fname';" 2>/dev/null || echo 0)
        if [ "$already" = "1" ]; then
            echo "  ↳ $fname — déjà appliquée, ignorée"
            continue
        fi
        echo -n "  ↳ $fname… "
        if $PSQL -d "$DB_NAME" -f "$seed" > /dev/null 2>&1; then
            $PSQL -d "$DB_NAME" -c \
                "INSERT INTO _migrations (filename) VALUES ('$fname') ON CONFLICT DO NOTHING;" \
                > /dev/null
            ok "OK"
        else
            warn "Seed $fname ignorée (erreurs non-bloquantes)"
        fi
    done
else
    warn "Mode production — seeds ignorées"
fi

# ── 5. Vérification finale ────────────────────────────────────────────
echo ""
echo "→ Résumé des tables :"
$PSQL -d "$DB_NAME" -c "\dt" 2>/dev/null | grep -v "^$" | grep -v "List of" | \
    grep -v "Schema\|---" | awk '{print "  ↳ " $3}'

echo ""
echo "→ Migrations appliquées :"
$PSQL -d "$DB_NAME" -tAc \
    "SELECT '  ↳ ' || filename || ' (' || TO_CHAR(applied_at,'DD/MM HH24:MI') || ')' FROM _migrations ORDER BY id;" \
    2>/dev/null

echo ""
ok "Setup terminé avec succès !"
echo ""
echo "Connexion : psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""
