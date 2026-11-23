#!/usr/bin/env sh
# Regenerates public/resume.pdf from resume/resume.html using headless Edge.
# Run from Git Bash: sh resume/build.sh
set -e
cd "$(dirname "$0")/.."
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
SRC="file:///$(cygpath -m "$PWD/resume/resume.html")"
OUT="$(cygpath -w "$PWD/public/resume.pdf")"
"$EDGE" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$OUT" "$SRC"
echo "Wrote public/resume.pdf"
