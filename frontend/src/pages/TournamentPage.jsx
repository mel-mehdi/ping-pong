import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/tournament.css';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const TournamentPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    maxPlayers: 8,
    prize: '',
  });
  const [inviteUsername, setInviteUsername] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [brackets, setBrackets] = useState({ round: '', matches: [] });
  const [myTournaments, setMyTournaments] = useState([]);
  // UI message state (shows brief informational messages on the page)
  const [apiMessage, setApiMessage] = useState(null);
  const { userData, isBackendAuthenticated } = useAuth();

  // Local cache helpers for tournaments (frontend-only)
  const LOCAL_TOURNAMENTS_KEY = 'local_tournaments';
  const loadLocalTournaments = () => {
    try {
      const raw = localStorage.getItem(LOCAL_TOURNAMENTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch (e) {
      console.warn('loadLocalTournaments error', e);
      return [];
    }
  };
  const saveLocalTournament = (tournament) => {
    try {
      const existing = loadLocalTournaments();
      // dedupe by temporary id if present or by name+creator
      const filtered = existing.filter((t) => !(t._localId === tournament._localId || (t.name === tournament.name && t.creator && tournament.creator && t.creator.id === tournament.creator.id)));
      localStorage.setItem(LOCAL_TOURNAMENTS_KEY, JSON.stringify([tournament, ...filtered]));
    } catch (e) {
      console.warn('saveLocalTournament error', e);
    }
  };

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        // Always attempt to fetch tournaments from backend when possible; fall back to local cache
        let all = [];
        try {
          const fetched = await apiClient.getTournaments();
          if (fetched && Array.isArray(fetched)) {
            all = fetched;
          }
        } catch (err) {
          console.warn('Failed to fetch tournaments from backend, using local cache', err);
          const local = loadLocalTournaments();
          all = local;
        }

        setActiveTournaments(all || []);

        // Determine my tournaments: prefer creator.id or participant owner-like fields
        const my = (all || []).filter((t) => {
          const creatorId = t.creator?.id || t.ownerId || t.owner_id || null;
          return creatorId && userData && creatorId === userData.userId;
        });
        setMyTournaments(my);

        if (all && all.length > 0) {
          const first = all[0];
          setBrackets({ name: first.name, round: 'Quarterfinals', matches: first.matches || [] });
        }
      } catch (err) {
        console.error('Error loading tournaments:', err);
        // Fallback: load local tournaments even in unexpected errors
        const local = loadLocalTournaments();
        setActiveTournaments(local || []);
        setMyTournaments((local || []).filter((t) => (t.creator && userData && t.creator.id === userData.userId) || (t.ownerId && userData && t.ownerId === userData.userId)));
      }
    };

    loadTournaments();
  }, [userData, isBackendAuthenticated]);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    (async () => {
      try {
        // Use backend-expected field names: max_players, prize_pool
        const payload = {
          name: tournamentForm.name,
          max_players: tournamentForm.maxPlayers,
          prize_pool: tournamentForm.prize,
          invited_players: invitedPlayers,
        };

        const created = await apiClient.createTournament(payload);
        if (created) {
          // Save to local cache so it shows up even if a subsequent refresh can't hit backend
          const owner = { id: userData?.userId, username: userData?.username };
          const localCopy = {
            ...created,
            creator: created.creator || owner,
            _localId: `local_${Date.now()}`,
          };
          saveLocalTournament(localCopy);

          // Refresh tournaments list (prefer backend data when available)
          try {
            const all = await apiClient.getTournaments();
            setActiveTournaments(all || []);
            setMyTournaments((all || []).filter((t) => t.creator?.id === userData?.userId || t.ownerId === userData?.userId));
          } catch (e) {
            // If fetching fails, include the local copy in-active tournaments
            setActiveTournaments((prev) => [localCopy, ...(prev || [])]);
            setMyTournaments((prev) => [localCopy, ...(prev || [])]);
          }
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

    if (searchTerm.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      if (!isBackendAuthenticated) {
        // No backend auth — can't search users
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.error('Search users error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteFromSearch = (username) => {
    if (!invitedPlayers.includes(username) && invitedPlayers.length < tournamentForm.maxPlayers) {
      const user = searchResults.find((u) => u.username === username);
      setInvitedPlayers([...invitedPlayers, username]);
      setPendingInvites([...pendingInvites, username]);
      setInviteUsername('');
      setSearchResults([]);
      // Try to send an API invitation if user and current user exist
      (async () => {
        try {
          if (!userData) return;
          if (!isBackendAuthenticated) {
            console.warn('Cannot send invitations when not backend authenticated');
            return;
          }
          if (user && user.id && userData) {
            await apiClient.sendInvitation(
              userData.userId,
              userData.username,
              user.id,
              user.username
            );
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
    setInvitedPlayers(invitedPlayers.filter((player) => player !== username));
  };

  const handleJoinTournament = async (tournament) => {
    if (!isBackendAuthenticated) {
      setApiMessage('Please sign in to join tournaments');
      setTimeout(() => setApiMessage(null), 3000);
      return;
    }

    try {
      const result = await apiClient.joinTournament(tournament.id);
      setApiMessage(result?.detail || 'Joined tournament');

      // Refresh tournaments list so UI reflects updated participant counts/status
      const all = await apiClient.getTournaments();
      setActiveTournaments(all || []);
      setMyTournaments((all || []).filter((t) => (t.creator && t.creator.id === userData?.userId) || t.ownerId === userData?.userId));
    } catch (err) {
      setApiMessage(err?.message || 'Unable to join tournament');
    } finally {
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="tournament-main">
        <div className="container">
          <div className="tournament-header">
            <h1>{t('tournaments.title')}</h1>
            <p className="text-muted">{t('tournaments.subtitle')}</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              {t('tournaments.create')}
            </button>
            {/* Message banner for user feedback (join errors, success) */}
            {apiMessage && (
              <div className="alert alert-info mt-2" role="status">
                {apiMessage}
              </div>
            )}
          </div>

          <div className="tournament-tabs">
            <button
              className={`tournament-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              {t('tournaments.tabs.active')}
            </button>
            <button
              className={`tournament-tab ${activeTab === 'brackets' ? 'active' : ''}`}
              onClick={() => setActiveTab('brackets')}
            >
              {t('tournaments.tabs.brackets')}
            </button>
            <button
              className={`tournament-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              {t('tournaments.tabs.history')}
            </button>
          </div>

          {activeTab === 'active' && (
            <div className="tournament-content">
              <div className="tournaments-grid">
                {activeTournaments.map((tournament) => (
                  <div key={tournament.id} className="tournament-card">
                    <div className="tournament-card-header">
                      <h3>{tournament.name}</h3>
                      <span
                        className={`tournament-status ${(tournament.status || 'open').toLowerCase()}`}
                      >
                        {tournament.status || 'Open'}
                      </span>
                    </div>
                    <div className="tournament-card-body">
                      <div className="tournament-info-row">
                        <span className="info-label">{t('tournaments.players_label')}</span>
                        <span className="info-value">
                          {((tournament.participants && tournament.participants.length) || tournament.participant_count || 0)}/{tournament.max_players}
                        </span>
                      </div>
                      <div className="tournament-info-row">
                        <span className="info-label">{t('tournaments.prize_pool')}</span>
                        <span className="info-value">{tournament.prize || tournament.prize_pool}</span>
                      </div>
                      <div className="tournament-progress">
                        <div
                          className="tournament-progress-bar"
                          style={{
                            width: `${((((tournament.participants && tournament.participants.length) || tournament.participant_count || 0) / (tournament.max_players || tournament.maxPlayers)) * 100) || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="tournament-card-footer">
                      {(() => {
                        const participantCount = (tournament.participants && tournament.participants.length) || tournament.participant_count || 0;
                        const isFull = participantCount >= (tournament.max_players || tournament.maxPlayers);
                        const isJoinable = (tournament.status === 'pending') && !isFull;
                        return (
                          <button
                            className="btn btn-primary w-100"
                            disabled={!isJoinable}
                            onClick={() => handleJoinTournament(tournament)}
                          >
                            {isFull ? t('tournaments.full') : (tournament.status !== 'pending' ? (tournament.status || 'Closed') : t('tournaments.join'))}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'brackets' && (
            <div className="tournament-content">
              <div className="bracket-header">
                <h2>{brackets.name || t('tournaments.tabs.brackets')}</h2>
                <p className="bracket-round">{brackets.round}</p>
              </div>
              <div className="bracket-container">
                {(brackets.matches || []).map((match) => (
                  <div key={match.id} className="bracket-match">
                    <div
                      className={`bracket-player ${match.winner === 'player1' ? 'winner' : match.winner === 'player2' ? 'loser' : ''}`}
                    >
                      <span className="player-name">{match.player1}</span>
                      <span className="player-score">
                        {match.score1 !== null ? match.score1 : '-'}
                      </span>
                    </div>
                    <div className="bracket-vs">{t('tournaments.vs')}</div>
                    <div
                      className={`bracket-player ${match.winner === 'player2' ? 'winner' : match.winner === 'player1' ? 'loser' : ''}`}
                    >
                      <span className="player-name">{match.player2}</span>
                      <span className="player-score">
                        {match.score2 !== null ? match.score2 : '-'}
                      </span>
                    </div>
                    {match.winner === null && (
                      <div className="match-status">{t('tournaments.upcoming')}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tournament-content">
              <div className="tournament-history">
                {myTournaments.map((tournament) => (
                  <div key={tournament.id} className="history-card">
                    <div className="history-card-icon">
                      {tournament.placement?.includes('1st')
                        ? '🥇'
                        : tournament.placement?.includes('2nd')
                          ? '🥈'
                          : tournament.placement?.includes('3rd')
                            ? '🥉'
                            : '🏅'}
                    </div>
                    <div className="history-card-info">
                      <h3>{tournament.name}</h3>
                      <div className="history-details">
                        <span>
                          {tournament.placement ||
                            (tournament.participants && tournament.participants.length > 0
                              ? t('tournaments.participant')
                              : t('tournaments.no_placement'))}
                        </span>
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
                  <h2>{t('tournaments.create_title')}</h2>
                  <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateTournament}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="tournament-name">{t('tournaments.name_label')}</label>
                      <input
                        type="text"
                        id="tournament-name"
                        className="form-control"
                        placeholder={t('tournaments.name_placeholder')}
                        value={tournamentForm.name}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="max-players">{t('tournaments.max_players_label')}</label>
                      <select
                        id="max-players"
                        className="form-control"
                        value={tournamentForm.maxPlayers}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            maxPlayers: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="4">
                          {t('tournaments.players_option').replace('{n}', '4')}
                        </option>
                        <option value="8">
                          {t('tournaments.players_option').replace('{n}', '8')}
                        </option>
                        <option value="16">
                          {t('tournaments.players_option').replace('{n}', '16')}
                        </option>
                        <option value="32">
                          {t('tournaments.players_option').replace('{n}', '32')}
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prize">{t('tournaments.prize_label')}</label>
                      <input
                        type="text"
                        id="prize"
                        className="form-control"
                        placeholder={t('tournaments.prize_placeholder')}
                        value={tournamentForm.prize}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, prize: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        {t('tournaments.invite_friends').replace('{n}', tournamentForm.maxPlayers)}
                      </label>
                      <div className="invite-search-container">
                        <div className="invite-input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={t('tournaments.search_placeholder')}
                            value={inviteUsername}
                            onChange={(e) => handleSearchFriends(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === 'Enter' && (e.preventDefault(), handleInvitePlayer(e))
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleInvitePlayer}
                            disabled={
                              invitedPlayers.length >= tournamentForm.maxPlayers ||
                              !inviteUsername.trim()
                            }
                          >
                            {t('tournaments.add')}
                          </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                          <div className="search-results-dropdown">
                            {searchResults.map((user, index) => (
                              <div key={index} className="search-result-item">
                                <div className="search-result-info">
                                  <span className="user-avatar">
                                    {user.avatar &&
                                    user.avatar.startsWith &&
                                    user.avatar.startsWith('data:') ? (
                                      <img
                                        src={user.avatar}
                                        alt={user.username}
                                        style={{ width: 36, height: 36, borderRadius: '50%' }}
                                      />
                                    ) : (
                                      <span className="avatar-fallback">{user.avatar || '🙂'}</span>
                                    )}
                                  </span>
                                  <div className="user-details">
                                    <span className="user-name">{user.username}</span>
                                    <span
                                      className={`user-status ${user.online_status ? 'online' : 'offline'}`}
                                    >
                                      <span className="status-dot"></span>
                                      {user.online_status
                                        ? t('status.online')
                                        : t('status.offline')}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`btn-invite-small ${pendingInvites.includes(user.username) ? 'pending' : ''}`}
                                  onClick={() => handleInviteFromSearch(user.username)}
                                  disabled={
                                    invitedPlayers.length >= tournamentForm.maxPlayers ||
                                    pendingInvites.includes(user.username)
                                  }
                                >
                                  {pendingInvites.includes(user.username)
                                    ? t('invite.pending')
                                    : t('invite.invite')}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {isSearching && (
                          <div className="search-loading">{t('search.searching')}</div>
                        )}

                        {inviteUsername.trim().length >= 1 &&
                          searchResults.length === 0 &&
                          !isSearching && (
                            <div className="search-no-results">{t('search.no_users')}</div>
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
                                    title={t('tournaments.remove_player_title')}
                                  >
                                    ×
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="slot-number">{index + 1}</span>
                                  <span className="slot-empty">{t('tournaments.empty_slot')}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="slots-info">
                          {t('tournaments.invited_info')
                            .replace('{invited}', invitedPlayers.length)
                            .replace('{max}', tournamentForm.maxPlayers)}
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
                      {t('tournaments.cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {t('tournaments.create_submit')}
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
