import json
import sys
from pathlib import Path

def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else (
        Path(__file__).parents[2] / "frontend/public/data/matches.json"
    )
    with source.open(encoding="utf-8") as file:
        matches = json.load(file).get("matches", [])
    completed = [m for m in matches if m.get("status") == "completed" and m.get("score")]
    wins = draws = losses = goals_for = goals_against = 0
    for match in completed:
        ours, theirs = int(match["score"]["gwlb"]), int(match["score"]["opponent"])
        goals_for += ours
        goals_against += theirs
        if ours > theirs: wins += 1
        elif ours == theirs: draws += 1
        else: losses += 1
    print(f"Matches: {len(matches)} | Completed: {len(completed)}")
    print(f"Record: {wins}W - {draws}D - {losses}L")
    print(f"Goals: {goals_for} for, {goals_against} against")

if __name__ == "__main__":
    main()
