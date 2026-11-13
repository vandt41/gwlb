# Public JSON schema

## `players.json`
```json
{
  "players": [
    {
      "id": 1,
      "name": "Player Name",
      "jerseyNumber": 10,
      "primaryPosition": "Winger",
      "secondaryPositions": ["Striker"],
      "bio": "Optional public bio"
    }
  ]
}
```

Do not put individual attributes in this file.

## `matches.json`
```json
{
  "matches": [
    {
      "id": "match-001",
      "opponent": "Opponent FC",
      "kickoffAt": "2026-12-06T17:00:00+07:00",
      "venue": "Football Field A",
      "status": "upcoming",
      "squadPlayerIds": [1, 2, 3, 4, 5, 6, 7],
      "formationId": "2-3-1",
      "startingLineup": [
        {"playerId": 1, "positionId": "GK"}
      ],
      "score": null,
      "publicNotes": ""
    }
  ]
}
```

`kickoffAt` is ISO 8601 with timezone offset. Status is `upcoming`, `completed` or `cancelled`. Completed scores contain integer `gwlb` and `opponent` fields.

The private example files define player attributes and weighted position requirements. Keep their local copies untracked.
