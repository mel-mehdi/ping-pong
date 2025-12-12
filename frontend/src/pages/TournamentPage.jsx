import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/tournament.css';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

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
    const [activeTournaments, setActiveTournaments] = useState([]);
    const [brackets, setBrackets] = useState({ round: '', matches: [] });
    const [myTournaments, setMyTournaments] = useState([]);
    const { userData } = useAuth();

    useEffect(() => {
        const loadTournaments = async () => {
            try {
                const all = await apiClient.getTournaments();
                setActiveTournaments(all || []);
                setMyTournaments((all || []).filter(t => t.ownerId === userData?.userId));
                if (all && all.length > 0) {
                    const first = all[0];
                    setBrackets({ name: first.name, round: 'Quarterfinals', matches: first.matches || [] });
                }
            } catch (err) {
                console.error('Error loading tournaments:', err);
            }
        };

        loadTournaments();
    }, [userData]);
    
    

    const handleCreateTournament = (e) => {
        e.preventDefault();
        (async () => {
            try {
                const payload = {
                    name: tournamentForm.name,
                    maxPlayers: tournamentForm.maxPlayers,
                    prize: tournamentForm.prize,
                    ownerId: userData?.userId || null,
                    ownerName: userData?.username || 'Anonymous',
                    invitedPlayers,
                };
                const created = await apiClient.createTournament(payload);
                if (created) {
                    // Refresh tournaments list
                    const all = await apiClient.getTournaments();
                    setActiveTournaments(all || []);
                    setMyTournaments((all || []).filter(t => t.ownerId === userData?.userId));
                }
            } catch (err) {
                console.error('Error creating tournament:', err);
            }
        })();
        // Reset form
        setTournamentForm({ name: '', maxPlayers: 8, prize: '' });
        setInvitedPlayers([]);
        setSearchResults([]);
        setInviteUsername('');
        setPendingInvites([]);
        setShowCreateModal(false);
    };

    const handleSearchFriends = async (searchTerm) => {
        setInviteUsername(searchTerm);
        
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await apiClient.searchUsers(searchTerm);
            const filtered = (results || []).filter(user => !invitedPlayers.includes(user.username));
            setSearchResults(filtered.map(u => ({ ...u, id: u.id || u.userId })));
        } catch (err) {
            console.error('Search users error:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInviteFromSearch = (username) => {
        if (!invitedPlayers.includes(username) && invitedPlayers.length < tournamentForm.maxPlayers) {
            const user = searchResults.find(u => u.username === username);
            setInvitedPlayers([...invitedPlayers, username]);
            setPendingInvites([...pendingInvites, username]);
            setInviteUsername('');
            setSearchResults([]);
            // Try to send an API invitation if user and current user exist
            (async () => {
                try {
                    if (user && user.id && userData) {
                        await apiClient.sendInvitation(userData.userId, userData.username, user.id, user.username);
                    }
                } catch (error) {
                    console.error('Error sending invitation:', error);
                }
            })();
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
                                            <span className={`tournament-status ${((tournament.status || 'open').toLowerCase())}`}>
                                                {tournament.status || 'Open'}
                                            </span>
                                        </div>
                                        <div className="tournament-card-body">
                                            <div className="tournament-info-row">
                                                <span className="info-label">Players:</span>
                                                <span className="info-value">{(tournament.participants || []).length}/{tournament.maxPlayers}</span>
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
                                <h2>{brackets.name || 'Live Brackets'}</h2>
                                <p className="bracket-round">{brackets.round}</p>
                            </div>
                            <div className="bracket-container">
                                {(brackets.matches || []).map(match => (
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
                                                <span>{tournament.placement || (tournament.participants && tournament.participants.length > 0 ? 'Participant' : 'No placement')}</span>
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
                                                                    <span className="user-avatar">{user.avatar && user.avatar.startsWith && user.avatar.startsWith('data:') ? (
                                                                        <img src={user.avatar} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                                                    ) : (
                                                                        <span className="avatar-fallback">{user.avatar || '🙂'}</span>
                                                                    )}</span>
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
