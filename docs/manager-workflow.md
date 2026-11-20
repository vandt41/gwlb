# Manager workflow

## Publish public data
1. Open the GitHub repository.
2. Navigate to `frontend/vanilla/data/`.
3. Edit `bmg_team.json` to add or update the public roster.
4. Run  once to calculate players' OVRs for every position.
```bash
./engine/build/gwlb_engine 
```
The output is in `frontend/vanilla/data/players_ovrs.json`

5. Commit to `main` and wait for the Pages deployment workflow.
