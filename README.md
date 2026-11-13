# GWLB — Guys Who Love Balls

Public, static 7-a-side team website. No accounts, backend server, or database in the MVP.

## Stack
- React + TypeScript + Vite frontend
- GitHub Pages hosting
- Public JSON files for roster, fixtures, lineups and results
- Standalone C++17 tactical engine (CMake + nlohmann/json)
- Python analytics starter

## Public and private data

The website and repository are public. Anything committed to the repository, including JSON files and Git history, must be treated as public.

Public files in `frontend/public/data/` contain player names, positions, jersey numbers, fixtures, selected squads, published lineups and results.

Manager-only player attributes and position weights belong in local files under `private-data/`. Those files are ignored by Git. The C++ engine reads them locally. Never copy private attributes into the public JSON files.

The manager publishes only the approved squad and lineup by editing `matches.json`.

## Run the frontend

Requirements: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

Build locally:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This starter assumes the repository is named `GWLB`, giving a URL like `https://YOUR_USERNAME.github.io/GWLB/`.

1. Create a public GitHub repository named `GWLB`.
2. Push this project to its `main` branch.
3. Open repository **Settings → Pages** and choose **GitHub Actions** as the source.
4. Push a commit or manually run the `Deploy GWLB to GitHub Pages` workflow.
5. Wait for deployment to finish.

If the repository has a different name, change the base path in `frontend/vite.config.ts`.

## Manager workflow

Edit these files directly in GitHub's web editor, then commit to `main`:

| File | Purpose |
|---|---|
| `frontend/public/data/team.json` | Team name and description |
| `frontend/public/data/players.json` | Public player roster |
| `frontend/public/data/matches.json` | Fixtures, manually selected squad, published lineup, results |
| `frontend/public/data/positions.json` | Public position labels |
| `frontend/public/data/formations.json` | Formation templates |

GitHub Actions redeploys the website after a commit. Teammates may need to refresh after deployment completes.

### Match rules
- A match squad can contain up to 13 player IDs.
- A confirmed starting lineup contains exactly 7 players: 1 goalkeeper and 6 outfield players.
- A player cannot appear twice in the starting lineup.
- Jersey numbers must be unique within a match.
- Formation notation such as `2-3-1` describes the six outfield players; the goalkeeper is additional.

## Build the C++ engine

On CachyOS / Arch Linux:

```bash
sudo pacman -S --needed base-devel cmake nlohmann-json
```

On Ubuntu / Debian:

```bash
sudo apt install build-essential cmake nlohmann-json3-dev
```

Create local private files:

```bash
mkdir -p private-data
cp private-data.example/players_private.example.json private-data/players_private.json
cp private-data.example/position_requirements.example.json private-data/position_requirements.json
```

Build and run from the repository root:

```bash
cmake -S engine -B engine/build
cmake --build engine/build
./engine/build/gwlb_engine private-data/players_private.json private-data/position_requirements.json
ctest --test-dir engine/build --output-on-failure
```

The initial engine calculates weighted position suitability on a 0–10 scale. Missing attributes count as zero. This is a first scoring baseline, not a complete lineup optimizer.

## Current MVP limitations

- Visitors can view but cannot edit the site.
- The manager edits public JSON through GitHub.
- Private stats stay on the manager's machine and are not synced between devices.
- No live editing or automatic attendance responses.
- GitHub Pages cannot run the C++ executable.

If you later need editing from phones, shared private stats, multiple managers, or live updates, add a backend or hosted data service.
