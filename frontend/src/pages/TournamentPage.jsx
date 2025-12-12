import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/tournament.css';

const TournamentPage = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tournamentForm, setTournamentForm] = useState({
        name: '',
        maxPlayers: 8,
        prize: ''
    });
    const [inviteUsername, setInviteUsername] = useState('');
    const [invitedPlayers, setInvitedPlayers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingInvites, setPendingInvites] = useState([]);
    
    const activeTournaments = [
        { id: 1, name: 'Winter Championship 2025', players: 14, maxPlayers: 16, prize: '1000 Points', status: 'Open' },
        { id: 2, name: 'Speed Pong Challenge', players: 8, maxPlayers: 8, prize: '500 Points', status: 'Full' },
        { id: 3, name: 'Beginner Tournament', players: 5, maxPlayers: 8, prize: '250 Points', status: 'Open' },
    ];

    const brackets = {
        round: 'Quarterfinals',
        matches: [
            { id: 1, player1: 'ProPlayer123', player2: 'PongMaster', score1: 11, score2: 7, winner: 'player1' },
            { id: 2, player1: 'GameChampion', player2: 'SpeedDemon', score1: 9, score2: 11, winner: 'player2' },
            { id: 3, player1: 'TableKing', player2: 'AcePaddle', score1: null, score2: null, winner: null },
            { id: 4, player1: 'BallWizard', player2: 'PongNinja', score1: null, score2: null, winner: null },
        ]
    };

    const myTournaments = [
        { id: 1, name: 'Summer Cup 2024', placement: '2nd Place', date: '2024-07-15', prize: '500 Points' },
        { id: 2, name: 'Autumn League', placement: '1st Place', date: '2024-09-20', prize: '1000 Points' },
    ];

    const handleCreateTournament = (e) => {
        e.preventDefault();
        // TODO: API call to create tournament
        console.log('Creating tournament:', { ...tournamentForm, invitedPlayers });
        // Reset form
        setTournamentForm({ name: '', maxPlayers: 8, prize: '' });
        setInvitedPlayers([]);
        setSearchResults([]);
        setInviteUsername('');
        setPendingInvites([]);
        setShowCreateModal(false);
    };

    const handleSearchFriends = (searchTerm) => {
        setInviteUsername(searchTerm);
        
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        
        // TODO: Replace with actual API call to search users
        // Simulating search results
        setTimeout(() => {
            const mockUsers = [
                { username: 'ProPlayer123', status: 'online', avatar: '👤' },
                { username: 'PongMaster', status: 'offline', avatar: '🎮' },
                { username: 'GameChampion', status: 'online', avatar: '🏆' },
                { username: 'SpeedDemon', status: 'online', avatar: '⚡' },
                { username: 'TableKing', status: 'offline', avatar: '👑' },
                { username: 'AcePaddle', status: 'online', avatar: '🎯' },
            ];
            
            const filtered = mockUsers.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !invitedPlayers.includes(user.username)
            );
            
            setSearchResults(filtered);
            setIsSearching(false);
        }, 300);
    };

    const handleInviteFromSearch = (username) => {
        if (!invitedPlayers.includes(username) && invitedPlayers.length < tournamentForm.maxPlayers) {
            setInvitedPlayers([...invitedPlayers, username]);
            setPendingInvites([...pendingInvites, username]);
            setInviteUsername('');
            setSearchResults([]);
        }
    };

    const handleInvitePlayer = (e) => {
        e.preventDefault();
        if (inviteUsername.trim() && !invitedPlayers.includes(inviteUsername.trim())) {
            setInvitedPlayers([...invitedPlayers, inviteUsername.trim()]);
            setInviteUsername('');
            setSearchResults([]);
        }
    };

    const removeInvitedPlayer = (username) => {
        setInvitedPlayers(invitedPlayers.filter(player => player !== username));
    };

    return (
        <>
            <Navbar />
            <main className="tournament-main">
                <div className="container">
                    <div className="tournament-header">
                        <h1>🏆 Tournaments</h1>
                        <p className="text-muted">Compete in organized competitions and win prizes</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            + Create Tournament
                        </button>
                    </div>

                    <div className="tournament-tabs">
                        <button 
                            className={`tournament-tab ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active Tournaments
                        </button>
                        <button 
                            className={`tournament-tab ${activeTab === 'brackets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('brackets')}
                        >
                            Live Brackets
                        </button>
                        <button 
                            className={`tournament-tab ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            My History
                        </button>
                    </div>

                    {activeTab === 'active' && (
                        <div className="tournament-content">
                            <div className="tournaments-grid">
                                {activeTournaments.map(tournament => (
                                    <div key={tournament.id} className="tournament-card">
                                        <div className="tournament-card-header">
                                            <h3>{tournament.name}</h3>
                                            <span className={`tournament-status ${tournament.status.toLowerCase()}`}>
                                                {tournament.status}
                                            </span>
                                        </div>
                                        <div className="tournament-card-body">
                                            <div className="tournament-info-row">
                                                <span className="info-label">Players:</span>
                                                <span className="info-value">{tournament.players}/{tournament.maxPlayers}</span>
                                            </div>
                                            <div className="tournament-info-row">
                                                <span className="info-label">Prize Pool:</span>
                                                <span className="info-value">{tournament.prize}</span>
                                            </div>
                                            <div className="tournament-progress">
                                                <div 
                                                    className="tournament-progress-bar" 
                                                    style={{ width: `${(tournament.players / tournament.maxPlayers) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="tournament-card-footer">
                                            <button 
                                                className="btn btn-primary w-100"
                                                disabled={tournament.status === 'Full'}
                                            >
                                                {tournament.status === 'Full' ? 'Tournament Full' : 'Join Tournament'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'brackets' && (
                        <div className="tournament-content">
                            <div className="bracket-header">
                                <h2>Winter Championship 2025</h2>
                                <p className="bracket-round">{brackets.round}</p>
                            </div>
                            <div className="bracket-container">
                                {brackets.matches.map(match => (
                                    <div key={match.id} className="bracket-match">
                                        <div className={`bracket-player ${match.winner === 'player1' ? 'winner' : match.winner === 'player2' ? 'loser' : ''}`}>
                                            <span className="player-name">{match.player1}</span>
                                            <span className="player-score">{match.score1 !== null ? match.score1 : '-'}</span>
                                        </div>
                                        <div className="bracket-vs">VS</div>
                                        <div className={`bracket-player ${match.winner === 'player2' ? 'winner' : match.winner === 'player1' ? 'loser' : ''}`}>
                                            <span className="player-name">{match.player2}</span>
                                            <span className="player-score">{match.score2 !== null ? match.score2 : '-'}</span>
                                        </div>
                                        {match.winner === null && (
                                            <div className="match-status">Upcoming</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="tournament-content">
                            <div className="tournament-history">
                                {myTournaments.map(tournament => (
                                    <div key={tournament.id} className="history-card">
                                        <div className="history-card-icon">
                                            {tournament.placement.includes('1st') ? '🥇' : 
                                             tournament.placement.includes('2nd') ? '🥈' : 
                                             tournament.placement.includes('3rd') ? '🥉' : '🏅'}
                                        </div>
                                        <div className="history-card-info">
                                            <h3>{tournament.name}</h3>
                                            <div className="history-details">
                                                <span>{tournament.placement}</span>
                                                <span>•</span>
                                                <span>{tournament.date}</span>
                                            </div>
                                        </div>
                                        <div className="history-card-prize">
                                            <div className="prize-label">Prize</div>
                                            <div className="prize-value">{tournament.prize}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Create Tournament Modal */}
                    {showCreateModal && (
                        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Create New Tournament</h2>
                                    <button 
                                        className="modal-close"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <form onSubmit={handleCreateTournament}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label htmlFor="tournament-name">Tournament Name</label>
                                            <input
                                                type="text"
                                                id="tournament-name"
                                                className="form-control"
                                                placeholder="e.g., Winter Championship 2025"
                                                value={tournamentForm.name}
                                                onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="max-players">Maximum Players</label>
                                            <select
                                                id="max-players"
                                                className="form-control"
                                                value={tournamentForm.maxPlayers}
                                                onChange={(e) => setTournamentForm({...tournamentForm, maxPlayers: parseInt(e.target.value)})}
                                            >
                                                <option value="4">4 Players</option>
                                                <option value="8">8 Players</option>
                                                <option value="16">16 Players</option>
                                                <option value="32">32 Players</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="prize">Prize Pool</label>
                                            <input
                                                type="text"
                                                id="prize"
                                                className="form-control"
                                                placeholder="e.g., 1000 Points"
                                                value={tournamentForm.prize}
                                                onChange={(e) => setTournamentForm({...tournamentForm, prize: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Invite Friends (up to {tournamentForm.maxPlayers} players)</label>
                                            <div className="invite-search-container">
                                                <div className="invite-input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search friends by username..."
                                                        value={inviteUsername}
                                                        onChange={(e) => handleSearchFriends(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInvitePlayer(e))}
                                                    />
                                                    <button 
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={handleInvitePlayer}
                                                        disabled={invitedPlayers.length >= tournamentForm.maxPlayers || !inviteUsername.trim()}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                
                                                {/* Search Results Dropdown */}
                                                {searchResults.length > 0 && (
                                                    <div className="search-results-dropdown">
                                                        {searchResults.map((user, index) => (
                                                            <div key={index} className="search-result-item">
                                                                <div className="search-result-info">
                                                                    <span className="user-avatar">{user.avatar}</span>
                                                                    <div className="user-details">
                                                                        <span className="user-name">{user.username}</span>
                                                                        <span className={`user-status ${user.status}`}>
                                                                            <span className="status-dot"></span>
                                                                            {user.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className={`btn-invite-small ${pendingInvites.includes(user.username) ? 'pending' : ''}`}
                                                                    onClick={() => handleInviteFromSearch(user.username)}
                                                                    disabled={invitedPlayers.length >= tournamentForm.maxPlayers || pendingInvites.includes(user.username)}
                                                                >
                                                                    {pendingInvites.includes(user.username) ? 'Pending' : 'Invite'}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {isSearching && (
                                                    <div className="search-loading">Searching...</div>
                                                )}
                                                
                                                {inviteUsername.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                                                    <div className="search-no-results">No users found</div>
                                                )}
                                            </div>
                                            
                                            <div className="player-slots-container">
                                                <div className="player-slots-grid">
                                                    {Array.from({ length: tournamentForm.maxPlayers }, (_, index) => (
                                                        <div key={index} className="player-slot">
                                                            {invitedPlayers[index] ? (
                                                                <>
                                                                    <span className="slot-number">{index + 1}</span>
                                                                    <span className="slot-name">{invitedPlayers[index]}</span>
                                                                    <button 
                                                                        type="button"
                                                                        className="slot-remove"
                                                                        onClick={() => removeInvitedPlayer(invitedPlayers[index])}
                                                                        title="Remove player"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="slot-number">{index + 1}</span>
                                                                    <span className="slot-empty">Empty slot</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="slots-info">
                                                    {invitedPlayers.length} / {tournamentForm.maxPlayers} players invited
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowCreateModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Create Tournament
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default TournamentPage;
