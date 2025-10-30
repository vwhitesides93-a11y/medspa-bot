#!/usr/bin/env bash
set -e

# >>> EDITED: your GitHub repo is now configured correctly <<<
GITHUB_REPO="git@github.com:vwhitesides93-a11y/medspa-bot.git"

if [ "$GITHUB_REPO" = "git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git" ]; then
  echo "❌ Edit GITHUB_REPO before running";
  exit 1;
fi

if [ -f "medspa-bot-infra-with-chart-plus_merged.zip" ]; then
  unzip -o medspa-bot-infra-with-chart-plus_merged.zip
  cd medspa-bot-infra-with-chart-plus_merged
fi

git init
git branch -m main
git add .
git commit -m "Initial infra + app + CI"
git remote add origin "$GITHUB_REPO"
git push -u origin main

echo "✅ Repo pushed to GitHub: $GITHUB_REPO"
