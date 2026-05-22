#!/bin/bash
# Auto-sync script: Pulls latest changes and restarts dev server

cd /workspaces/toeic-mvp

while true; do
  # Get current HEAD commit
  PREV_HEAD=$(git rev-parse HEAD)

  # Pull latest changes silently
  git pull origin main --quiet 2>/dev/null

  # Get new HEAD commit
  CURR_HEAD=$(git rev-parse HEAD)

  # If commits changed, restart the dev server
  if [ "$PREV_HEAD" != "$CURR_HEAD" ]; then
    echo "[$(date '+%H:%M:%S')] New commits detected! Restarting dev server..."
    pm2 restart toeic-mvp --silent 2>/dev/null || true
    sleep 2
  fi

  # Check every 5 seconds
  sleep 5
done
