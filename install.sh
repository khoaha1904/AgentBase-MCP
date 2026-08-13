#!/usr/bin/env bash
set -euo pipefail

agentbase_install_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec node "$agentbase_install_root/scripts/install.mjs" "$@"
