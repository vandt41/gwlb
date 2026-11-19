// GWLB roster page. Uses the same source data as the matchday squads page.
const TEAM_URL = './data/bmg_team.json';
const RATINGS_URL = './data/players_ovrs.json';
const BADGES_URL = './data/badges.json';
const RATING_INDEX = { CB: 0, CM: 1, WG: 2, ST: 3 };
const $ = (selector) => document.querySelector(selector);

let allPlayers = [];
let activeFilter = 'all';

async function loadJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Cannot load ${url} (HTTP ${response.status})`);
    return response.json();
}

function jerseyNumber(player) {
    return player.jersey_number ?? player.jerseyNumber ?? player.id;
}

function displayValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function ratingData(player) {
    return player.ratings;
}

function addText(parent, tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

function normalizeTags(value) {
    if (Array.isArray(value)) return value.map((item) => typeof item === 'string' ? item : displayValue(item));
    if (value && typeof value === 'object') {
        return Object.entries(value).map(([key, item]) => item === '' || item == null ? key : `${key}: ${displayValue(item)}`);
    }
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
}

function createSection(title, content) {
    const section = document.createElement('section');
    addText(section, 'div', 'section-title', title);
    section.append(content);
    return section;
}

function createAttributes(attributes) {
    const grid = document.createElement('div');
    grid.className = 'attributes';
    const entries = Object.entries(attributes || {});
    if (!entries.length) {
        addText(grid, 'div', 'empty', 'No attributes available.');
        return grid;
    }
    for (const [name, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
        const row = document.createElement('div');
        row.className = 'attribute';
        addText(row, 'span', '', name.replaceAll('_', ' '));
        addText(row, 'strong', '', displayValue(value));
        grid.append(row);
    }
    return grid;
}

function createTags(values) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tags';
    const items = normalizeTags(values);
    if (!items.length) {
        addText(wrapper, 'span', 'empty', 'None listed.');
        return wrapper;
    }
    for (const item of items) addText(wrapper, 'span', 'tag', item);
    return wrapper;
}

// Badges are displayed one per row. Supports string arrays, arrays of
// { name, description } objects, and { badgeName: description } objects.
function normalizeBadges(values, descriptions = {}) {
    let entries = [];

    if (Array.isArray(values)) {
        entries = values.map((item) => {
            if (typeof item === 'string') {
                return { name: item, description: '' };
            }

            return {
                name: item.name ?? item.title ?? item.badge ?? '',
                description: item.description ?? item.desc ?? ''
            };
        });
    } else if (values && typeof values === 'object') {
        entries = Object.entries(values).map(([name, value]) => ({
            name,
            description:
                typeof value === 'string'
                    ? value
                    : value?.description ?? value?.desc ?? ''
        }));
    } else if (typeof values === 'string' && values.trim()) {
        entries = [{ name: values, description: '' }];
    }

    return entries
        .filter((badge) => badge.name)
        .map((badge) => ({
            name: badge.name,
            description: badge.description || descriptions[badge.name] || ''
        }));
}

function createBadges(values, descriptions = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'badge-list';

    const badges = normalizeBadges(values, descriptions);

    if (!badges.length) {
        addText(wrapper, 'span', 'empty', 'None listed.');
        return wrapper;
    }

    for (const badge of badges) {
        const row = document.createElement('div');
        row.className = 'badge-row';

        addText(row, 'span', 'tag badge-name', badge.name);

        if (badge.description) {
            addText(row, 'small', 'badge-description', badge.description);
        }

        wrapper.append(row);
    }

    return wrapper;
}

function ratingSummary(player) {
    const values = ratingData(player);
    const chips = document.createElement('div');
    chips.className = 'ratings';
    if (Array.isArray(values)) {
        for (const [label, index] of [['CB', 0], ['CM', 1], ['WG', 2], ['ST', 3]]) {
            if (values[index] === undefined) continue;
            const chip = document.createElement('span');
            chip.className = 'rating-chip';
            chip.textContent = `${label} `;
            const strong = document.createElement('strong');
            strong.textContent = displayValue(values[index]);
            chip.append(strong);
            chips.append(chip);
        }
    } else if (values !== undefined && values !== null) {
        const chip = document.createElement('span');
        chip.className = 'rating-chip';
        chip.textContent = 'GK OVR ';
        const strong = document.createElement('strong');
        strong.textContent = displayValue(values);
        chip.append(strong);
        chips.append(chip);
    }
    if (!chips.children.length) addText(chips, 'span', 'empty', 'Ratings unavailable.');
    return chips;
}

let badgeDescriptions = {};
function createPlayerCard(player) {
    const card = document.createElement('article');
    card.className = 'player-card';

    const top = document.createElement('div');
    top.className = 'card-top';
    addText(top, 'div', 'shirt-number', `#${jerseyNumber(player)}`);
    const main = document.createElement('div');
    main.className = 'player-main';
    addText(main, 'div', 'player-name', player.name);
    const position = player.position_abbr || player.pos_abbr || (player.type === 'goalkeeper' ? 'GK' : 'Outfield');
    addText(main, 'div', 'player-meta', `${position} · ID ${player.id}`);
    top.append(main);

    const values = ratingData(player);
    const base = Array.isArray(values) ? values[4] : values;
    const score = document.createElement('div');
    score.className = 'ovr';
    score.textContent = base === undefined || base === null ? '—' : displayValue(base);
    addText(score, 'small', '', player.type === 'goalkeeper' ? 'OVR' : 'OVR');
    top.append(score);
    card.append(top, ratingSummary(player));

    const details = document.createElement('details');
    details.className = 'profile';
    addText(details, 'summary', '', 'View player profile');
    const body = document.createElement('div');
    body.className = 'profile-body';
    body.append(createSection('Attributes', createAttributes(player.attributes)));
    body.append(createSection(
        'Badges',
        createBadges(player.Badges ?? player.badges, badgeDescriptions)
    )); body.append(createSection('Skills', createTags(player.Skills ?? player.skills)));
    details.append(body);
    card.append(details);
    return card;
}

function render() {
    const query = $('#search').value.trim().toLowerCase();
    const filtered = allPlayers.filter((player) => {
        const matchesType = activeFilter === 'all' || player.type === activeFilter;
        const matchesQuery = [player.name, player.id, jerseyNumber(player), player.position_abbr, player.pos_abbr]
            .some((value) => String(value ?? '').toLowerCase().includes(query));
        return matchesType && matchesQuery;
    });

    $('#player-count').textContent = `${filtered.length} of ${allPlayers.length} players`;
    const grid = $('#player-grid');
    grid.replaceChildren();
    if (!filtered.length) {
        addText(grid, 'div', 'message', 'No players match your search.');
        return;
    }
    for (const player of filtered) grid.append(createPlayerCard(player));
}

async function init() {
    try {
        const [team, ratings, badges] = await Promise.all([
            loadJson(TEAM_URL),
            loadJson(RATINGS_URL),
            loadJson(BADGES_URL)
        ]);
        badgeDescriptions = badges;

        if (!Array.isArray(team.players) || !Array.isArray(team.GK)) {
            throw new Error('bmg_team.json must contain both "players" and "GK" arrays.');
        }
        const outfield = team.players.map((player) => ({ ...player, type: 'outfield', ratings: ratings[String(player.id)] }));
        const keepers = team.GK.map((player) => ({ ...player, type: 'goalkeeper', ratings: ratings[String(player.id)] }));
        allPlayers = [...outfield, ...keepers].sort((a, b) => a.id - b.id);
        const ids = allPlayers.map((player) => player.id);
        if (ids.some((id) => !Number.isInteger(id)) || new Set(ids).size !== ids.length) {
            throw new Error('Player IDs must be unique integers across both players and GK arrays.');
        }
        $('#search').disabled = false;
        render();
    } catch (error) {
        console.error(error);
        $('#player-count').textContent = 'Roster could not be loaded';
        const grid = $('#player-grid');
        grid.replaceChildren();
        addText(grid, 'div', 'message error', `${error.message}. Check the JSON paths and run through a local web server.`);
    }
}

$('#search').addEventListener('input', render);
document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
        render();
    });
});

init();
