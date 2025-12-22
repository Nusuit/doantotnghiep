#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:4000}"

node "$(dirname "$0")/smoke.mjs"
