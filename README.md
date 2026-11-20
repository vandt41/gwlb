# GWLB — Guys Who Love Balls

Public, static 7-a-side team website. No accounts, backend server, or database in the MVP.

### Match rules
- A match squad can contain up to 12 player IDs.
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

Build and run from the repository root:

```bash
cmake -S engine -B engine/build
cmake --build engine/build

./engine/build/gwlb_engine 
```
## Manager workflow

Refer to `docs/manager-workflow.md`

## Current MVP limitations

- Visitors can view but cannot edit the site.
- The manager edits public JSON through GitHub.
- Private stats stay on the manager's machine and are not synced between devices.
- No live editing or automatic attendance responses.
- GitHub Pages cannot run the C++ executable.

If you later need editing from phones, shared private stats, multiple managers, or live updates, add a backend or hosted data service.
