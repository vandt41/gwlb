import type { AppData, Formation, Match, Player, Position, TeamData } from "./types";

async function loadJson<T>(filename: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);
  if (!response.ok) throw new Error(`Could not load ${filename}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function loadAppData(): Promise<AppData> {
  const [team, players, matches, positions, formations] = await Promise.all([
    loadJson<{ team: TeamData }>("team.json"),
    loadJson<{ players: Player[] }>("players.json"),
    loadJson<{ matches: Match[] }>("matches.json"),
    loadJson<{ positions: Position[] }>("positions.json"),
    loadJson<{ formations: Formation[] }>("formations.json"),
  ]);
  return {
    team: team.team,
    players: players.players,
    matches: matches.matches,
    positions: positions.positions,
    formations: formations.formations,
  };
}
