import { useEffect, useMemo, useState } from "react";
import { loadAppData } from "./dataLoader";
import type { AppData, Match, Player } from "./types";

type Page = "home" | "players" | "matches" | "about";

function dateLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
        weekday: "short", day: "numeric", month: "short",
        year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(date);
}

function PlayerCard({ player }: { player: Player }) {
    return <article className="player-card">
        <div className="shirt-number">{player.jerseyNumber ?? "—"}</div>
        <div>
            <h3>{player.name}</h3>
            <p className="position">{player.primaryPosition || "Position not set"}</p>
            {player.secondaryPositions.length > 0 &&
                <small>Also: {player.secondaryPositions.join(" · ")}</small>}
        </div>
    </article>;
}

function MatchCard({ match, players }: { match: Match; players: Player[] }) {
    const playerById = new Map(players.map(player => [player.id, player]));
    const names = match.squadPlayerIds
        .map(id => playerById.get(id)?.name)
        .filter((name): name is string => Boolean(name));
    const lineup = (match.startingLineup ?? []).map(slot => ({
        name: playerById.get(slot.playerId)?.name ?? `Player #${slot.playerId}`,
        position: slot.positionId,
    }));

    return <article className="match-card">
        <div className="match-meta">
            <span className={`status ${match.status}`}>{match.status}</span>
            <span>{dateLabel(match.kickoffAt)}</span>
        </div>
        <h3>GWLB <span>vs</span> {match.opponent}</h3>
        <p className="muted">📍 {match.venue || "Venue to be announced"}</p>
        {match.status === "completed" && match.score &&
            <div className="score">{match.score.gwlb} – {match.score.opponent}</div>}
        <div className="squad">
            <strong>Selected squad ({match.squadPlayerIds.length}/13)</strong>
            <p>{names.length ? names.join(", ") : "Squad not announced yet."}</p>
        </div>
        {lineup.length > 0 && <div className="lineup">
            <strong>Starting lineup ({lineup.length}/7)</strong>
            <ul>{lineup.map((slot, index) =>
                <li key={`${slot.position}-${index}`}><span>{slot.position}</span>{slot.name}</li>)}</ul>
        </div>}
        {match.formationId && <span className="chip">Formation: {match.formationId}</span>}
        {match.publicNotes && <p className="muted">{match.publicNotes}</p>}
    </article>;
}

function Empty({ title, message }: { title: string; message: string }) {
    return <div className="empty">
        <span>⚽</span><h3>{title}</h3><p>{message}</p>
    </div>;
}

export default function App() {
    const [page, setPage] = useState<Page>("home");
    const [data, setData] = useState<AppData | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAppData().then(setData).catch((reason: unknown) =>
            setError(reason instanceof Error ? reason.message : "Unknown data loading error"));
    }, []);

    const upcoming = useMemo(() => (data?.matches ?? [])
        .filter(match => match.status === "upcoming" && new Date(match.kickoffAt).getTime() >= Date.now())
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
        [data]);

    if (error) return <main className="shell"><div className="empty">
        <h2>Could not load GWLB data</h2><p>{error}</p>
        <small>Check the JSON files in frontend/public/data/.</small>
    </div></main>;
    if (!data) return <main className="shell"><p className="loading">Loading GWLB…</p></main>;

    const nav: { id: Page; label: string }[] = [
        { id: "home", label: "Home" }, { id: "players", label: "Players" },
        { id: "matches", label: "Matches" }, { id: "about", label: "About" },
    ];

    return <div className="shell">
        <header className="header">
            <a className="brand" href="#home" onClick={() => setPage("home")}>
                <span className="brand-mark">G</span>
                <span><strong>{data.team.name}</strong><small>{data.team.tagline}</small></span>
            </a>
            <nav aria-label="Main navigation">
                {nav.map(item => <button key={item.id}
                    className={page === item.id ? "nav active" : "nav"}
                    onClick={() => setPage(item.id)}>{item.label}</button>)}
            </nav>
        </header>

        {page === "home" && <>
            <section className="hero">
                <div>
                    <span className="eyebrow">THE TEAM HUB · 7-A-SIDE FOOTBALL</span>
                    <h1>Guys Who<br /><em>Love Balls.</em></h1>
                    <p>{data.team.description}</p>
                    <button className="primary" onClick={() => setPage("matches")}>View upcoming matches →</button>
                </div>
                <div className="hero-ball" aria-hidden="true">⚽</div>
            </section>
            <section className="stats">
                <div><small>Registered players</small><strong>{data.players.length}</strong></div>
                <div><small>Upcoming matches</small><strong>{upcoming.length}</strong></div>
                <div><small>Completed matches</small><strong>{data.matches.filter(m => m.status === "completed").length}</strong></div>
            </section>
            <section className="section">
                <div className="section-title"><div><span className="eyebrow">WHAT'S NEXT</span><h2>Upcoming matches</h2></div>
                    <button className="link-button" onClick={() => setPage("matches")}>All matches →</button></div>
                {upcoming.length ? <div className="grid">{upcoming.slice(0, 2).map(match =>
                    <MatchCard key={match.id} match={match} players={data.players} />)}</div> :
                    <Empty title="No matches scheduled" message="The manager hasn't added the next fixture yet." />}
            </section>
            <section className="section">
                <div className="section-title"><div><span className="eyebrow">THE SQUAD</span><h2>Meet the team</h2></div>
                    <button className="link-button" onClick={() => setPage("players")}>All players →</button></div>
                {data.players.length ? <div className="grid">{data.players.slice(0, 4).map(player =>
                    <PlayerCard key={player.id} player={player} />)}</div> :
                    <Empty title="Roster coming soon" message="Player profiles will appear here when the manager adds them." />}
            </section>
        </>}

        {page === "players" && <section className="page">
            <span className="eyebrow">THE ROSTER</span><h1>Meet the squad</h1>
            <p className="muted">The players representing GWLB on the pitch.</p>
            {data.players.length ? <div className="grid">{data.players.map(player =>
                <PlayerCard key={player.id} player={player} />)}</div> :
                <Empty title="No players yet" message="The manager will add the squad to the roster." />}
        </section>}

        {page === "matches" && <section className="page">
            <span className="eyebrow">FIXTURES & RESULTS</span><h1>Matches</h1>
            <p className="muted">Upcoming fixtures, published squads and past results.</p>
            {data.matches.length ? <div className="grid">{[...data.matches]
                .sort((a: Match, b: Match) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
                .map(match => <MatchCard key={match.id} match={match} players={data.players} />)}</div> :
                <Empty title="No matches added" message="Fixtures will appear here when the manager publishes them." />}
        </section>}

        {page === "about" && <section className="page">
            <span className="eyebrow">ABOUT THE TEAM</span><h1>{data.team.name}</h1>
            <p className="muted">{data.team.description}</p>
            <div className="about-card"><h2>One team. One pitch.</h2>
                <p>This is the public home for GWLB fixtures, squad announcements and match results.</p>
                <p>Individual player attributes and internal tactical analysis are kept private.</p></div>
        </section>}

        <footer><span>© {new Date().getFullYear()} {data.team.name}</span><span>Built for the love of the game ⚽</span></footer>
    </div>;
}
