#!/usr/bin/env bash
# Automates Supabase project setup for Giants of the World.
# Usage:
#   export SUPABASE_ACCESS_TOKEN=sbp_...
#   ./scripts/setup-supabase.sh
#
# Get token: https://supabase.com/dashboard/account/tokens

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN"
  echo "1. Open https://supabase.com/dashboard/account/tokens"
  echo "2. Generate token → export SUPABASE_ACCESS_TOKEN=sbp_..."
  echo "3. Re-run: ./scripts/setup-supabase.sh"
  exit 1
fi

if ! command -v supabase >/dev/null; then
  echo "Install Supabase CLI: brew install supabase/tap/supabase"
  exit 1
fi

if ! command -v jq >/dev/null; then
  echo "Install jq: brew install jq"
  exit 1
fi

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://giants-of-the-world.vercel.app}"
PROJECT_NAME="${SUPABASE_PROJECT_NAME:-giants-of-the-world}"
ORG_ID="${SUPABASE_ORG_ID:-}"
REGION="${SUPABASE_REGION:-eu-central-1}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"

echo "==> Listing orgs..."
ORGS_JSON=$(supabase orgs list -o json)
if [[ -z "$ORG_ID" ]]; then
  ORG_ID=$(echo "$ORGS_JSON" | jq -r '.[0].id // .[0].slug // empty')
fi
if [[ -z "$ORG_ID" || "$ORG_ID" == "null" ]]; then
  # fallback parse table output
  ORG_ID=$(supabase orgs list 2>/dev/null | awk 'NR==3 {print $1}')
fi
if [[ -z "$ORG_ID" ]]; then
  echo "Could not resolve org id. Set SUPABASE_ORG_ID=..."
  supabase orgs list
  exit 1
fi
echo "    Org: $ORG_ID"

echo "==> Creating project '$PROJECT_NAME' in $REGION..."
# If project already exists with this name, reuse it
EXISTING=$(supabase projects list -o json 2>/dev/null | jq -r --arg n "$PROJECT_NAME" '.[] | select(.name==$n) | .id' | head -1 || true)

if [[ -n "${EXISTING:-}" && "$EXISTING" != "null" ]]; then
  PROJECT_REF="$EXISTING"
  echo "    Reusing existing project: $PROJECT_REF"
else
  CREATE_OUT=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASSWORD" \
    --region "$REGION" \
    -o json 2>&1) || {
      echo "$CREATE_OUT"
      # try without -o json
      CREATE_OUT=$(supabase projects create "$PROJECT_NAME" \
        --org-id "$ORG_ID" \
        --db-password "$DB_PASSWORD" \
        --region "$REGION" 2>&1)
      echo "$CREATE_OUT"
    }
  PROJECT_REF=$(echo "$CREATE_OUT" | jq -r '.id // empty' 2>/dev/null || true)
  if [[ -z "$PROJECT_REF" ]]; then
    PROJECT_REF=$(supabase projects list -o json | jq -r --arg n "$PROJECT_NAME" '.[] | select(.name==$n) | .id' | head -1)
  fi
  if [[ -z "$PROJECT_REF" ]]; then
    echo "Failed to create/find project."
    exit 1
  fi
  echo "    Project ref: $PROJECT_REF"
  echo "    DB password (save it): $DB_PASSWORD"
fi

echo "==> Waiting for project to become ACTIVE..."
for i in $(seq 1 60); do
  STATUS=$(supabase projects list -o json | jq -r --arg id "$PROJECT_REF" '.[] | select(.id==$id) | .status' | head -1)
  echo "    status=$STATUS ($i)"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" || "$STATUS" == "ACTIVE" ]]; then
    break
  fi
  sleep 5
done

echo "==> Fetching API keys..."
# Management API
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys"
KEYS_JSON=$(curl -sS "$API_URL" -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN")
ANON_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name=="anon" or .name=="anon key") | .api_key' | head -1)
SERVICE_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name=="service_role" or .name=="service_role key") | .api_key' | head -1)

# Fallback: supabase projects api-keys
if [[ -z "$ANON_KEY" || "$ANON_KEY" == "null" ]]; then
  KEYS_JSON=$(supabase projects api-keys --project-ref "$PROJECT_REF" -o json 2>/dev/null || true)
  ANON_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name|test("anon")) | .api_key' | head -1)
  SERVICE_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name|test("service")) | .api_key' | head -1)
fi

PROJECT_URL="https://${PROJECT_REF}.supabase.co"

if [[ -z "$ANON_KEY" || -z "$SERVICE_KEY" || "$ANON_KEY" == "null" ]]; then
  echo "Could not fetch API keys automatically. Check dashboard."
  echo "Project URL will be: $PROJECT_URL"
  exit 1
fi

echo "==> Running schema.sql..."
# Prefer db execute with linked password; use Management SQL if available
if command -v psql >/dev/null && [[ -n "${DATABASE_URL:-}" ]]; then
  psql "$DATABASE_URL" -f supabase/schema.sql
else
  # Use supabase db push / execute via temporary connection
  # Management API query endpoint
  SQL=$(cat supabase/schema.sql)
  # Split is hard; send whole script
  HTTP_CODE=$(curl -sS -o /tmp/supabase-sql-out.json -w "%{http_code}" \
    -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg q "$SQL" '{query:$q}')")
  if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "201" ]]; then
    echo "    SQL API returned $HTTP_CODE — trying supabase db remote commit approach..."
    cat /tmp/supabase-sql-out.json 2>/dev/null || true
    echo "    Open SQL Editor and paste supabase/schema.sql if this fails."
  else
    echo "    Schema applied."
  fi
fi

echo "==> Auth URL configuration (dashboard API)..."
# Auth config update
curl -sS -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg site "$SITE_URL" \
    --arg local "http://localhost:3000" \
    --arg cb1 "${SITE_URL}/auth/callback" \
    --arg cb2 "http://localhost:3000/auth/callback" \
    '{
      site_url: $site,
      uri_allow_list: ([$cb1, $cb2, $local] | join(","))
    }')" >/tmp/supabase-auth-config.json || true
echo "    Auth config requested (site=$SITE_URL)."

ENV_FILE="$ROOT/.env.local"
touch "$ENV_FILE"

upsert_env() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    # portable sed
    local tmp
    tmp=$(mktemp)
    grep -v "^${key}=" "$ENV_FILE" >"$tmp" || true
    mv "$tmp" "$ENV_FILE"
  fi
  printf '%s=%s\n' "$key" "$val" >>"$ENV_FILE"
}

upsert_env "NEXT_PUBLIC_SITE_URL" "$SITE_URL"
upsert_env "NEXT_PUBLIC_SUPABASE_URL" "$PROJECT_URL"
upsert_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY"
upsert_env "SUPABASE_SERVICE_ROLE_KEY" "$SERVICE_KEY"
upsert_env "SUPABASE_PROJECT_REF" "$PROJECT_REF"

echo ""
echo "========================================"
echo "Supabase ready"
echo "  URL:     $PROJECT_URL"
echo "  Ref:     $PROJECT_REF"
echo "  Wrote:   .env.local (Supabase keys)"
echo "========================================"
echo "Next: add Stripe keys to .env.local and Vercel (see SETUP.md)."
echo "Do NOT commit .env.local."
