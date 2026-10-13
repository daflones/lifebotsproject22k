#!/bin/sh
set -eu
SUPABASE_URL="${SUPABASE_URL:-https://edzgczsnxlkhkpovtspg.supabase.co}"
SUPABASE_PUBLISHABLE_KEY="${SUPABASE_PUBLISHABLE_KEY:-sb_publishable_-O1ijsntTdQBn5T9gDhVRA_Y3fysMIl}"
case "$SUPABASE_URL" in https://*) ;; *) echo 'SUPABASE_URL deve usar HTTPS.' >&2; exit 1 ;; esac
case "$SUPABASE_URL" in *[!a-zA-Z0-9:/._-]*) echo 'SUPABASE_URL inválida.' >&2; exit 1 ;; esac
case "$SUPABASE_PUBLISHABLE_KEY" in sb_publishable_*) ;; *) echo 'Use somente uma chave publicável no frontend.' >&2; exit 1 ;; esac
case "$SUPABASE_PUBLISHABLE_KEY" in *[!a-zA-Z0-9_-]*) echo 'Chave publicável inválida.' >&2; exit 1 ;; esac
template="${1:-/opt/lifebots-config.js}"
output="${2:-/usr/share/nginx/html/config.js}"
sed -e "s|supabaseUrl: '[^']*'|supabaseUrl: '$SUPABASE_URL'|" -e "s|supabasePublishableKey: '[^']*'|supabasePublishableKey: '$SUPABASE_PUBLISHABLE_KEY'|" "$template" > "$output"
