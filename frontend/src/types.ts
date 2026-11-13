export interface TeamData {
  name: string;
  tagline: string;
  description: string;
}

export interface Player {
  id: number;
  name: string;
  jerseyNumber?: number | null;
  primaryPosition: string;
  secondaryPositions: string[];
  bio?: string;
}

export interface LineupSlot {
  playerId: number;
  positionId: string;
}

export type MatchStatus = "upcoming" | "completed" | "cancelled";

export interface Match {
  id: string;
  opponent: string;
  kickoffAt: string;
  venue: string;
  status: MatchStatus;
  squadPlayerIds: number[];
  formationId?: string | null;
  startingLineup: LineupSlot[];
  score?: { gwlb: number; opponent: number } | null;
  publicNotes?: string;
}

export interface Position { id: string; name: string; description?: string; }
export interface Formation {
  id: string;
  name: string;
  description: string;
  outfieldPositions: string[];
}

export interface AppData {
  team: TeamData;
  players: Player[];
  matches: Match[];
  positions: Position[];
  formations: Formation[];
}
