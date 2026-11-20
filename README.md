[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/buahrasa01-hub/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/buahrasa01-hub/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Field Guide

An offline-first PlayStation 5 trophy checklist and field guide for the published 55-trophy list. The app keeps earned progress in this browser, supports JSON export/import, filters by type, grade, search and status, protects story titles behind a spoiler switch, and groups objectives into a platinum roadmap. Each guide note cites the trophy-list sources and avoids unverified routes or missable claims.

## Run locally

Serve the app directory as static files, then open the local page in a browser:

    python3 -m http.server 8080 --directory app

Open http://localhost:8080. The app loads only its local HTML, CSS, JavaScript and trophy data. Source links open only if you choose to follow them.

To build the make.fun hand-in with Node 22:

    mkdir -p out
    MAKEFUN_OUTPUT_DIR=out node main.ts

The builder copies app/ and screenshots/ and writes dossier.json using the vendored make.fun frontend library.

## What is included

- 55 names, official descriptions and grades, with a practical note and cited trophy-list sources for every trophy.
- Local progress, spoiler control, filters, and JSON backup/restore.
- Story, collectibles, activities and cleanup roadmap stages, plus a missable review that distinguishes confirmed conditions from unknown ones.
- Four original captures of this app.

<sub>Entered on [make.fun](https://make.fun/?ref=pnwd2w29&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
