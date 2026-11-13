# Manager workflow

## Publish public data
1. Open the GitHub repository.
2. Navigate to `frontend/public/data/`.
3. Edit `players.json` to add or update the public roster.
4. Edit `matches.json` to create fixtures, select a squad, publish a lineup or record a result.
5. Commit to `main` and wait for the Pages deployment workflow.

## Maintain private ratings
1. Edit `private-data/players_private.json` locally.
2. Keep player IDs aligned with the public roster.
3. Edit `private-data/position_requirements.json` to tune position weights.
4. Run the C++ engine from the repository root.
5. Publish only the manager-approved squad and lineup in public `matches.json`.

Private files are not synced to GitHub. Keep a secure backup if the manager changes computers.
