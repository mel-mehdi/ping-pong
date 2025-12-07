import api from './api.ts';

export function initMainSearch(app) {
    const searchBtn = document.getElementById('mainSearchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearchBtn = document.getElementById('closeSearchOverlay');
    const searchInput = document.getElementById('mainSearchInput');
    const searchResults = document.getElementById('mainSearchResults');

    if (!searchOverlay || !searchInput || !searchResults) return;

    async function loadPlayersFromDatabase() {
        try {
            const users = await api.getAllUsers();
            return users.map(user => {
                const total = user.wins + user.losses;
                const winRate = total > 0 ? Math.round((user.wins / total) * 100) + '%' : '0%';
                return {
                    type: 'player',
                    name: user.username,
                    rank: `#${user.rank || '?'}`,
                    status: 'Online',
                    winRate
                };
            });
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    const gameData = [
        { type: 'game', name: 'Quick Match', description: 'Fast-paced 1v1 game', icon: 'gamepad' },
        { type: 'game', name: 'Tournament Mode', description: 'Compete in brackets', icon: 'trophy' },
    ];
    
    const featureData = [
        { type: 'feature', name: 'Leaderboard', description: 'View top players', icon: 'ranking-star' },
        { type: 'feature', name: 'Chat', description: 'Connect with players', icon: 'comments' },
        { type: 'feature', name: 'Profile', description: 'Manage your profile', icon: 'user' },
    ];

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchOverlay.classList.remove('hidden');
            setTimeout(() => {
                searchOverlay.classList.add('active');
                searchInput.focus();
            }, 10);
        });
    }

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            setTimeout(() => {
                searchOverlay.classList.add('hidden');
                searchInput.value = '';
                searchResults.innerHTML = `
                    <div class="search-placeholder">
                        <i class="fas fa-search search-placeholder-icon"></i>
                        <p>Start typing to search</p>
                    </div>
                `;
            }, 300);
        });
    }

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = e.target.value.toLowerCase().trim();

                if (!query) {
                    searchResults.innerHTML = `
                        <div class="search-placeholder">
                            <i class="fas fa-search search-placeholder-icon"></i>
                            <p>Start typing to search</p>
                        </div>
                    `;
                    return;
                }

                const players = await loadPlayersFromDatabase();

                const allResults = [];

                const playerMatches = players.filter(item => 
                    item.name.toLowerCase().includes(query)
                );

                const gameMatches = gameData.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query)
                );

                const featureMatches = featureData.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query)
                );

                if (playerMatches.length === 0 && gameMatches.length === 0 && featureMatches.length === 0) {
                    searchResults.innerHTML = `
                        <div class="search-no-results">
                            <i class="fas fa-search"></i>
                            <p>No results found for "${query}"</p>
                        </div>
                    `;
                    return;
                }

                let html = '';

                if (playerMatches.length > 0) {
                    html += '<div class="search-category"><h3>Players</h3></div>';
                    html += '<div class="search-results-grid">';
                    playerMatches.slice(0, 6).forEach(player => {
                        html += `
                            <div class="search-result-card">
                                <div class="search-result-icon player-icon">${player.name.charAt(0).toUpperCase()}</div>
                                <div class="search-result-info">
                                    <div class="search-result-title">${highlightMatch(player.name, query)}</div>
                                    <div class="search-result-meta">${player.rank} • ${player.winRate} Win Rate</div>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                }

                if (gameMatches.length > 0) {
                    html += '<div class="search-category"><h3>Game Modes</h3></div>';
                    html += '<div class="search-results-grid">';
                    gameMatches.forEach(game => {
                        html += `
                            <div class="search-result-card clickable">
                                <div class="search-result-icon"><i class="fas fa-${game.icon}"></i></div>
                                <div class="search-result-info">
                                    <div class="search-result-title">${highlightMatch(game.name, query)}</div>
                                    <div class="search-result-meta">${game.description}</div>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                }

                if (featureMatches.length > 0) {
                    html += '<div class="search-category"><h3>Features</h3></div>';
                    html += '<div class="search-results-grid">';
                    featureMatches.forEach(feature => {
                        html += `
                            <div class="search-result-card clickable">
                                <div class="search-result-icon"><i class="fas fa-${feature.icon}"></i></div>
                                <div class="search-result-info">
                                    <div class="search-result-title">${highlightMatch(feature.name, query)}</div>
                                    <div class="search-result-meta">${feature.description}</div>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                }

                searchResults.innerHTML = html;
            }, 300);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
            closeSearchBtn?.click();
        }
    });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}
