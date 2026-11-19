// GWLB frontend: reads the roster, formations and pre-calculated player OVRs.
// No downloads, file writes, or C++ HTTP API are required.
const TEAM_URL = './../../private-data/bmg_team.json';
const FORMATIONS_URL = './formations.json';
const RATINGS_URL = './../../private-data/players_ovrs.json';

const OUTFIELD_POSITIONS = ['CB', 'CM', 'WG', 'ST'];
const RATING_INDEX = { CB: 0, CM: 1, WG: 2, ST: 3, BASE: 4 };
const MAX_SELECTED = 12;
const MIN_SELECTED = 6;
const REQUIRED_OUTFIELD = 6;
const $ = (selector) => document.querySelector(selector);

let players = [];
let goalkeepers = [];
let playerRatings = {};
let formations = {};
let selected = [];
let squads = {
    Squad1: { formation: '', goalkeeperId: '', positions: blankPositions() },
    Squad2: { formation: '', goalkeeperId: '', positions: blankPositions() }
};

function blankPositions() {
    return { CB: [], CM: [], WG: [], ST: [] };
}

async function loadJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Cannot load ${url} (HTTP ${response.status})`);
    return response.json();
}

function showError(selector, message) {
    const element = $(selector);
    element.textContent = message;
    element.classList.remove('hidden');
}

function hideError(selector) {
    $(selector).classList.add('hidden');
}

function ratingFor(playerId, position) {
    const values = playerRatings[String(playerId)];
    if (!Array.isArray(values)) return null;
    const index = RATING_INDEX[position];
    const value = values[index];
    return Number.isFinite(Number(value)) ? Number(value) : null;
}

function goalkeeperRating(goalkeeperId) {
    const value = playerRatings[String(goalkeeperId)];
    // Goalkeeper entries are scalar OVR values, unlike outfield player arrays.
    return value !== null && value !== undefined && !Array.isArray(value) && Number.isFinite(Number(value))
        ? Number(value)
        : null;
}

function formatRating(value) {
    return value === null ? '—' : String(Math.round(value));
}

async function init() {
    try {
        const [team, formationData, ratings] = await Promise.all([
            loadJson(TEAM_URL),
            loadJson(FORMATIONS_URL),
            loadJson(RATINGS_URL)
        ]);

        if (!Array.isArray(team.players) || !Array.isArray(team.GK)) {
            throw new Error('bmg_team.json must contain both "players" and "GK" arrays.');
        }
        if (!formationData || !Object.keys(formationData).length) {
            throw new Error('formations.json is empty or invalid.');
        }

        players = team.players;
        goalkeepers = team.GK;
        formations = formationData;
        playerRatings = ratings;

        validateRoster(players, 'outfield');
        validateRoster(goalkeepers, 'goalkeeper');

        if (players.some((player) => Array.isArray(playerRatings[String(player.id)]))) {
            // Expected shape: [CB, CM, WG, ST, base OVR]. Missing individual entries
            // are allowed and will be displayed as unavailable.
        }

        for (const squadName of ['Squad1', 'Squad2']) {
            squads[squadName].formation = Object.keys(formations)[0];
        }

        renderRoster();
    } catch (error) {
        showError('#selection-error', `${error.message}. Check the file paths and run the page through a local web server (not file://).`);
        $('#count').textContent = 'Could not load team data';
    }
}

function validateRoster(roster, label) {
    const ids = roster.map((player) => player.id);
    if (roster.some((player) => !Number.isInteger(player.id) || typeof player.name !== 'string')) {
        throw new Error(`Every ${label} must have an integer ID and a name.`);
    }
    if (new Set(ids).size !== ids.length) {
        throw new Error(`Duplicate IDs found in the ${label} roster.`);
    }
}

function jerseyNumber(player) {
    return player.jersey_number ?? player.jerseyNumber ?? player.id;
}

function renderRoster() {
    const root = $('#roster');
    root.replaceChildren();

    players.forEach((player) => {
        const selectedIndex = selected.findIndex((item) => item.id === player.id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `player${selectedIndex >= 0 ? ' selected' : ''}`;
        button.setAttribute('aria-pressed', String(selectedIndex >= 0));

        const number = document.createElement('span');
        number.className = 'num';
        number.textContent = selectedIndex >= 0 ? String(selectedIndex + 1) : `#${jerseyNumber(player)}`;

        const details = document.createElement('span');
        const name = document.createElement('span');
        name.className = 'pname';
        name.textContent = player.name;
        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = `   OVR ${formatRating(ratingFor(player.id, 'BASE'))}`;
        details.append(name, meta);
        button.append(number, details);
        button.addEventListener('click', () => togglePlayer(player.id));
        root.append(button);
    });

    $('#count').textContent = `${selected.length}/${MAX_SELECTED} outfield players selected`;
    $('#next').classList.toggle('hidden', selected.length < MIN_SELECTED);
}

function togglePlayer(id) {
    hideError('#selection-error');
    const index = selected.findIndex((player) => player.id === id);
    if (index >= 0) {
        selected.splice(index, 1);
        // Remove a deselected player from both squads.
        for (const squad of Object.values(squads)) {
            for (const position of OUTFIELD_POSITIONS) {
                squad.positions[position] = squad.positions[position].filter((playerId) => playerId !== id);
            }
        }
    } else if (selected.length < MAX_SELECTED) {
        selected.push(players.find((player) => player.id === id));
    } else {
        showError('#selection-error', `You can select up to ${MAX_SELECTED} outfield players.`);
    }
    renderRoster();
    renderPitches();
}

$('#clear').addEventListener('click', () => {
    selected = [];
    for (const squad of Object.values(squads)) squad.positions = blankPositions();
    renderRoster();
    renderPitches();
});
$('#next').addEventListener('click', openBuilder);
$('#back').addEventListener('click', backToSelection);
$('#back2').addEventListener('click', backToSelection);
$('#edit').addEventListener('click', backToBuilder);
$('#edit2').addEventListener('click', backToBuilder);
$('#calculate').addEventListener('click', showResults);

function backToSelection() {
    $('#builder').classList.add('hidden');
    $('#selection').classList.remove('hidden');
}

function backToBuilder() {
    $('#results').classList.add('hidden');
    $('#builder').classList.remove('hidden');
}

function openBuilder() {
    $('#selection').classList.add('hidden');
    $('#results').classList.add('hidden');
    $('#builder').classList.remove('hidden');
    $('#builder-count').textContent = `${selected.length} selected outfield players`;

    for (const squadName of ['Squad1', 'Squad2']) {
        if (!formations[squads[squadName].formation]) {
            squads[squadName].formation = Object.keys(formations)[0];
        }
        renderFormationSelect(squadName);
        renderGoalkeeperSelect(squadName);
    }

    renderBench();
    renderPitches();
}

function renderFormationSelect(squadName) {
    const suffix = squadName === 'Squad1' ? '1' : '2';
    const select = $(`#formation${suffix}`);
    select.replaceChildren();
    for (const formationName of Object.keys(formations)) {
        const option = document.createElement('option');
        option.value = formationName;
        option.textContent = formationName;
        select.append(option);
    }
    select.value = squads[squadName].formation;
    select.onchange = () => {
        squads[squadName].formation = select.value;
        // Remove assignments that exceed a newly selected formation's capacity.
        const capacities = formations[select.value];
        for (const position of OUTFIELD_POSITIONS) {
            const capacity = Number(capacities[position] || 0);
            squads[squadName].positions[position] = squads[squadName].positions[position].slice(0, capacity);
        }
        renderPitch(squadName);
    };
}

function renderGoalkeeperSelect(squadName) {
    const suffix = squadName === 'Squad1' ? '1' : '2';
    const select = $(`#goalkeeper${suffix}`);
    select.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose goalkeeper';
    select.append(placeholder);

    for (const goalkeeper of goalkeepers) {
        const option = document.createElement('option');
        option.value = String(goalkeeper.id);
        const ovr = goalkeeperRating(goalkeeper.id);
        option.textContent = `${goalkeeper.name} · OVR ${formatRating(ovr)}`;
        select.append(option);
    }

    select.value = squads[squadName].goalkeeperId;
    select.onchange = () => {
        squads[squadName].goalkeeperId = select.value;
        renderGoalkeeperRating(squadName);
    };
    renderGoalkeeperRating(squadName);
}

function renderGoalkeeperRating(squadName) {
    const suffix = squadName === 'Squad1' ? '1' : '2';
    const id = squads[squadName].goalkeeperId;
    const goalkeeper = goalkeepers.find((item) => String(item.id) === String(id));
    const output = $(`#goalkeeper-ovr${suffix}`);
    output.textContent = goalkeeper
        ? `GK OVR ${formatRating(goalkeeperRating(goalkeeper.id))} · excluded from team OVR`
        : 'No goalkeeper selected';
}

function renderBench() {
    const root = $('#bench');
    root.replaceChildren();
    selected.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'bench-player';
        item.draggable = true;

        const number = document.createElement('span');
        number.className = 'num';
        number.textContent = String(index + 1);
        const details = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = player.name;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = `#${jerseyNumber(player)} · ID ${player.id} · Base OVR ${formatRating(ratingFor(player.id, 'BASE'))}`;
        details.append(name, meta);
        item.append(number, details);
        item.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', String(player.id));
            event.dataTransfer.effectAllowed = 'copy';
        });
        root.append(item);
    });
}

function renderPitches() {
    renderPitch('Squad1');
    renderPitch('Squad2');
}

function renderPitch(squadName) {
    const suffix = squadName === 'Squad1' ? '1' : '2';
    const root = $(`#pitch${suffix}`);
    const squad = squads[squadName];
    const capacities = formations[squad.formation] || {};
    root.replaceChildren();

    // GK is deliberately not a drag/drop position. It is selected from the GK roster above.
    OUTFIELD_POSITIONS.forEach((position) => {
        const capacity = Number(capacities[position] || 0);
        if (!capacity) return;

        const zone = document.createElement('div');
        zone.className = 'zone';
        const heading = document.createElement('div');
        heading.className = 'zone-title';
        const label = document.createElement('span');
        label.textContent = position;
        const count = document.createElement('span');
        count.className = 'zone-count';
        count.textContent = `${squad.positions[position].length}/${capacity}`;
        heading.append(label, count);
        zone.append(heading);

        squad.positions[position].forEach((id) => {
            const player = selected.find((item) => item.id === id);
            if (!player) return;
            const row = document.createElement('div');
            row.className = 'assigned';
            const name = document.createElement('span');
            name.textContent = player.name;
            const rating = document.createElement('span');
            rating.className = 'rating';
            rating.textContent = `OVR ${formatRating(ratingFor(id, position))}`;
            const remove = document.createElement('button');
            remove.className = 'remove';
            remove.type = 'button';
            remove.textContent = '×';
            remove.title = 'Remove player';
            remove.addEventListener('click', () => {
                squad.positions[position] = squad.positions[position].filter((playerId) => playerId !== id);
                renderPitch(squadName);
            });
            row.append(name, rating, remove);
            zone.append(row);
        });

        if (!squad.positions[position].length) {
            const hint = document.createElement('div');
            hint.className = 'hint';
            hint.textContent = 'Drop player here';
            zone.append(hint);
        }

        zone.addEventListener('dragover', (event) => {
            event.preventDefault();
            zone.classList.add('over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('over'));
        zone.addEventListener('drop', (event) => {
            event.preventDefault();
            zone.classList.remove('over');
            assignPlayer(squadName, position, Number(event.dataTransfer.getData('text/plain')), capacity);
        });
        root.append(zone);
    });

    const assignedCount = OUTFIELD_POSITIONS.reduce((total, position) => total + squad.positions[position].length, 0);
    $(`#status${suffix}`).textContent = `${assignedCount}/${REQUIRED_OUTFIELD} outfield players assigned`;
}

function assignPlayer(squadName, position, playerId, capacity) {
    hideError('#builder-error');
    const squad = squads[squadName];
    if (!selected.some((player) => player.id === playerId)) return;

    if (OUTFIELD_POSITIONS.some((item) => squad.positions[item].includes(playerId))) {
        showError('#builder-error', 'This player is already assigned in this squad. Remove them first to change position.');
        return;
    }
    if (squad.positions[position].length >= capacity) {
        showError('#builder-error', `${position} is full for formation ${squad.formation}.`);
        return;
    }

    squad.positions[position].push(playerId);
    renderPitch(squadName);
}

function squadOutfieldIds(squad) {
    return OUTFIELD_POSITIONS.flatMap((position) => squad.positions[position]);
}

function squadAverage(squad) {
    const ids = squadOutfieldIds(squad);
    if (ids.length !== REQUIRED_OUTFIELD) return null;

    const values = ids.map((id) => {
        const position = OUTFIELD_POSITIONS.find((pos) => squad.positions[pos].includes(id));
        return ratingFor(id, position);
    });
    if (values.some((value) => value === null)) return null;
    return values.reduce((sum, value) => sum + value, 0) / REQUIRED_OUTFIELD;
}

function createPitchPlayer(player, position, isGoalkeeper = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `pitch-player${player ? '' : ' pitch-empty'}`;

    const token = document.createElement('div');
    token.className = `pitch-token${isGoalkeeper ? ' goalkeeper' : ''}`;
    token.textContent = player ? String(jerseyNumber(player)) : '·';

    const name = document.createElement('div');
    name.className = 'pitch-player-name';
    name.textContent = player ? player.name : position;

    const meta = document.createElement('div');
    meta.className = 'pitch-player-meta';
    if (player) {
        const ovr = isGoalkeeper
            ? goalkeeperRating(player.id)
            : ratingFor(player.id, position);
        meta.textContent = `${isGoalkeeper ? 'GK' : position} · ${formatRating(ovr)} OVR`;
    } else {
        meta.textContent = 'Unassigned';
    }

    wrapper.append(token, name, meta);
    return wrapper;
}

function renderFormationBoard(squadName) {
    const squad = squads[squadName];
    const card = document.createElement('section');
    card.className = 'panel formation-card';

    const head = document.createElement('div');
    head.className = 'formation-card-head';
    const identity = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = squadName.replace('Squad', 'Squad ');
    const subtitle = document.createElement('div');
    subtitle.className = 'formation-name';
    subtitle.textContent = `${squadOutfieldIds(squad).length} / ${REQUIRED_OUTFIELD} outfield players`;
    identity.append(title, subtitle);

    const score = document.createElement('div');
    score.className = 'formation-team-ovr';
    const average = squadAverage(squad);
    score.textContent = average === null ? '—' : average.toFixed(1);
    const scoreLabel = document.createElement('small');
    scoreLabel.textContent = 'TEAM OVR';
    score.append(scoreLabel);

    const badge = document.createElement('span');
    badge.className = 'formation-badge';
    badge.textContent = squad.formation;
    head.append(identity, score, badge);
    card.append(head);

    const board = document.createElement('div');
    board.className = 'pitch-board';
    board.setAttribute('aria-label', `${squadName} ${squad.formation} formation`);
    const half = document.createElement('div');
    half.className = 'pitch-halfway';
    const circle = document.createElement('div');
    circle.className = 'pitch-circle';
    const topBox = document.createElement('div');
    topBox.className = 'pitch-box top';
    const bottomBox = document.createElement('div');
    bottomBox.className = 'pitch-box bottom';
    board.append(half, circle, topBox, bottomBox);

    // Attack at the top, goalkeeper at the bottom. Each line follows the
    // selected formation's position capacities, not a hard-coded layout.
    const capacities = formations[squad.formation] || {};
    for (const position of ['ST', 'WG', 'CM', 'CB']) {
        const capacity = Number(capacities[position] || 0);
        if (!capacity) continue;
        const line = document.createElement('div');
        line.className = 'pitch-line';
        const assigned = squad.positions[position] || [];
        for (let slot = 0; slot < capacity; slot++) {
            const playerId = assigned[slot];
            const player = playerId === undefined
                ? null
                : selected.find((item) => item.id === playerId);
            line.append(createPitchPlayer(player, position));
        }
        board.append(line);
    }

    const gkLine = document.createElement('div');
    gkLine.className = 'pitch-line gk-line';
    const goalkeeper = goalkeepers.find(
        (item) => String(item.id) === String(squad.goalkeeperId)
    );
    gkLine.append(createPitchPlayer(goalkeeper || null, 'GK', true));
    board.append(gkLine);
    card.append(board);

    const legend = document.createElement('div');
    legend.className = 'pitch-legend';
    const gkOvr = goalkeeper ? formatRating(goalkeeperRating(goalkeeper.id)) : '—';
    legend.textContent = `GK OVR ${gkOvr} · Goalkeeper excluded from team OVR`;
    card.append(legend);

    if (average === null) {
        const note = document.createElement('div');
        note.className = 'status';
        note.textContent = 'Assign exactly six outfield players with available position ratings to calculate team OVR.';
        card.append(note);
    }
    return card;
}

function showResults() {
    hideError('#result-error');
    const root = $('#result-cards');
    root.replaceChildren();

    const squadNames = ['Squad1', 'Squad2'].filter((name) =>
        squadOutfieldIds(squads[name]).length > 0 || squads[name].goalkeeperId !== ''
    );

    if (!squadNames.length) {
        showError('#result-error', 'Assign players to at least one squad first.');
        return;
    }

    root.classList.add('formation-cards');
    for (const squadName of squadNames) {
        root.append(renderFormationBoard(squadName));
    }

    $('#result-subtitle').textContent = 'Full-pitch lineups · Ratings loaded from players_ovrs.json';
    $('#builder').classList.add('hidden');
    $('#results').classList.remove('hidden');
}

init();
