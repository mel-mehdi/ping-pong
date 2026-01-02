import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/tournament.css';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const TournamentPage = () => {
  const navigate = useNavigate();
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
  const [completedTournaments, setCompletedTournaments] = useState([]);
  const [brackets, setBrackets] = useState({ name: '', rounds: [] });
  const [myTournaments, setMyTournaments] = useState([]);
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const [apiMessage, setApiMessage] = useState(null);
  const { userData, isBackendAuthenticated } = useAuth();

  useEffect(() => {
    const loadTournaments = async () => {
      if (!isBackendAuthenticated) return;
      
      try {
        const fetched = await apiClient.getTournaments();
        if (fetched && Array.isArray(fetched)) {
          // Filter active (pending/ongoing) vs completed tournaments
          const active = fetched.filter(t => t.status !== 'completed');
          const completed = fetched.filter(t => t.status === 'completed');
          
          setActiveTournaments(active);
          setCompletedTournaments(completed);

          const my = fetched.filter((t) => {
            const creatorId = t.creator?.id;
            return creatorId && userData && creatorId === userData.userId;
          });
          setMyTournaments(my);

          // Don't auto-load brackets, let user select
        }

        // Load tournament matches
        const matches = await apiClient.getTournamentMatches();
        if (matches && Array.isArray(matches)) {
          setTournamentMatches(matches);
        }
      } catch (err) {
        // Error loading tournaments
        setActiveTournaments([]);
        setMyTournaments([]);
      }
    };

    loadTournaments();
  }, [userData, isBackendAuthenticated]);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    (async () => {
      if (!isBackendAuthenticated) {
        setApiMessage('Please sign in to create tournaments');
        setTimeout(() => setApiMessage(null), 3000);
        return;
      }

      try {
        const payload = {
          name: tournamentForm.name,
          max_players: tournamentForm.maxPlayers,
          prize_pool: tournamentForm.prize,
        };

        const created = await apiClient.createTournament(payload);
        if (created) {
          setApiMessage('Tournament created successfully!');
          
          const all = await apiClient.getTournaments();
          const active = (all || []).filter(t => t.status !== 'completed');
          const completed = (all || []).filter(t => t.status === 'completed');
          setActiveTournaments(active);
          setCompletedTournaments(completed);
          setMyTournaments((all || []).filter((t) => t.creator?.id === userData?.userId));
        }
      } catch (err) {
        setApiMessage(err?.message || 'Error creating tournament');
      } finally {
        setTimeout(() => setApiMessage(null), 3000);
      }
    })();
    
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
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const users = await apiClient.searchUsers(searchTerm);
      const filtered = (users || []).filter(u => u.id !== userData?.userId);
      setSearchResults(filtered);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
    setInvitedPlayers(invitedPlayers.filter((player) => player !== username));
  };

  const handleStartTournament = async (tournament) => {
    if (!isBackendAuthenticated) {
      setApiMessage('Please sign in to start tournaments');
      setTimeout(() => setApiMessage(null), 3000);
      return;
    }

    try {
      const result = await apiClient.startTournament(tournament.id);
      setApiMessage(result?.detail || 'Tournament started!');

      // Refresh tournaments list
      const all = await apiClient.getTournaments();
      if (all && Array.isArray(all)) {
        const active = all.filter(t => t.status !== 'completed');
        const completed = all.filter(t => t.status === 'completed');
        setActiveTournaments([...active]);
        setCompletedTournaments([...completed]);
        const my = all.filter((t) => t.creator?.id === userData?.userId);
        setMyTournaments([...my]);
      }
    } catch (err) {
      const errorMsg = err?.detail || err?.message || 'Unable to start tournament';
      setApiMessage(`Error: ${errorMsg}`);
    } finally {
      setTimeout(() => setApiMessage(null), 5000);
    }
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
      const active = (all || []).filter(t => t.status !== 'completed');
      const completed = (all || []).filter(t => t.status === 'completed');
      setActiveTournaments(active);
      setCompletedTournaments(completed);
      setMyTournaments((all || []).filter((t) => (t.creator && t.creator.id === userData?.userId) || t.ownerId === userData?.userId));

      // Refresh matches in case the tournament started
      const matches = await apiClient.getTournamentMatches();
      if (matches && Array.isArray(matches)) {
        setTournamentMatches(matches);
        
        // Check if we have a match in this tournament and redirect
        const myMatch = matches.find(m => m.tournament === tournament.id);
        if (myMatch) {
          setApiMessage('Tournament started! Redirecting to match...');
          setTimeout(() => {
            navigate(`/game?mode=tournament&match=${myMatch.id}`);
          }, 1500);
        }
      }
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

          {/* Tournament Matches Section */}
          {tournamentMatches.length > 0 && (
            <div className="tournament-matches-section" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px' }}>
              <h2 style={{ marginBottom: '1rem' }}>{t('tournaments.your_matches') || 'Your Tournament Matches'}</h2>
              <div className="matches-grid" style={{ display: 'grid', gap: '1rem' }}>
                {tournamentMatches.map((match) => (
                  <div key={match.id} className="match-card" style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {match.tournament_name}
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                          {match.player1?.username} vs {match.player2?.username}
                        </div>
                      </div>
                      <button 
                        className="btn btn-success"
                        onClick={() => navigate(`/game?mode=tournament&match=${match.id}`)}
                      >
                        {t('tournaments.play_now') || 'Play Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        const participantCount = tournament.participant_count || 0;
                        const isFull = participantCount >= tournament.max_players;
                        const hasJoined = tournament.participants?.some(p => p.user?.id === userData?.userId);
                        const isCreator = tournament.creator?.id === userData?.userId;
                        const isJoinable = (tournament.status === 'pending') && !isFull && !hasJoined;
                        
                        // Show different button based on tournament status
                        if (tournament.status === 'ongoing') {
                          return (
                            <button
                              className="btn btn-info w-100"
                              disabled
                            >
                              {t('tournaments.in_progress') || 'In Progress'}
                            </button>
                          );
                        }
                        
                        if (tournament.status === 'completed') {
                          return (
                            <button
                              className="btn btn-secondary w-100"
                              disabled
                            >
                              {t('tournaments.completed') || 'Completed'}
                            </button>
                          );
                        }
                        
                        // Show start button for creator if tournament has participants and is pending
                        if (isCreator && tournament.status === 'pending' && participantCount >= 2) {
                          return (
                            <button
                              className="btn btn-success w-100"
                              onClick={() => handleStartTournament(tournament)}
                            >
                              {t('tournaments.start') || 'Start Tournament'}
                            </button>
                          );
                        }
                        
                        let buttonText = t('tournaments.join');
                        if (hasJoined) buttonText = t('tournaments.joined') || 'Joined';
                        else if (isFull) buttonText = t('tournaments.full');
                        
                        return (
                          <button
                            className="btn btn-primary w-100"
                            disabled={!isJoinable}
                            onClick={() => handleJoinTournament(tournament)}
                          >
                            {buttonText}
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
                <h2>{t('tournaments.brackets') || 'Tournament Brackets'}</h2>
                <p className="text-muted">{t('tournaments.view_progress') || 'View tournament progress and matches'}</p>
              </div>
              
              {/* Tournament Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <select 
                  className="form-control" 
                  style={{ maxWidth: '400px', margin: '0 auto' }}
                  onChange={async (e) => {
                    const tournamentId = parseInt(e.target.value);
                    if (!tournamentId) {
                      setBrackets({ name: '', rounds: [] });
                      return;
                    }
                    
                    try {
                      // Fetch full tournament data with matches
                      const response = await apiClient.getTournamentById(tournamentId);
                      if (response && response.matches && response.matches.length > 0) {
                        const allMatches = response.matches;
                        
                        // Group matches by determining their round based on creation order
                        // First half are round 1, next quarter are round 2 (semis), last is final
                        const totalPlayers = response.max_players;
                        const rounds = [];
                        
                        if (totalPlayers === 4) {
                          // 4 players: 2 semis, 1 final
                          if (allMatches.length >= 2) rounds.push(allMatches.slice(0, 2)); // Semis
                          if (allMatches.length >= 3) rounds.push([allMatches[2]]); // Final
                        } else if (totalPlayers === 8) {
                          // 8 players: 4 quarters, 2 semis, 1 final
                          if (allMatches.length >= 4) rounds.push(allMatches.slice(0, 4)); // Quarters
                          if (allMatches.length >= 6) rounds.push(allMatches.slice(4, 6)); // Semis
                          if (allMatches.length >= 7) rounds.push([allMatches[6]]); // Final
                        } else {
                          // Generic: split evenly
                          const matchesPerRound = Math.ceil(totalPlayers / 2);
                          let idx = 0;
                          while (idx < allMatches.length) {
                            const roundSize = Math.max(1, Math.floor((allMatches.length - idx) / 2));
                            rounds.push(allMatches.slice(idx, idx + roundSize));
                            idx += roundSize;
                          }
                        }
                        
                        setBrackets({ 
                          name: response.name, 
                          rounds: rounds 
                        });
                      } else {
                        setBrackets({ name: response.name, rounds: [] });
                      }
                    } catch (err) {
                      setBrackets({ name: '', rounds: [] });
                    }
                  }}
                >
                  <option value="">{t('tournaments.select') || 'Select Tournament'}</option>
                  {[...activeTournaments, ...completedTournaments].map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.status === 'completed' ? (t('tournaments.completed') || 'Completed') : tournament.status === 'ongoing' ? (t('tournaments.in_progress') || 'In Progress') : (t('tournaments.pending') || 'Pending')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bracket Visualization */}
              {brackets.rounds && brackets.rounds.length > 0 ? (
                <div className="bracket-tree" style={{ 
                  display: 'flex', 
                  gap: '3rem', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '2rem',
                  overflowX: 'auto'
                }}>
                  {brackets.rounds.map((round, roundIndex) => (
                    <div key={roundIndex} className="bracket-round-column" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${Math.pow(2, roundIndex) * 1.5}rem`,
                      justifyContent: 'center'
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {roundIndex === brackets.rounds.length - 1 
                          ? (t('tournaments.final') || 'Final')
                          : roundIndex === brackets.rounds.length - 2
                            ? (t('tournaments.semi_final') || 'Semi-Final')
                            : `${t('tournaments.round') || 'Round'} ${roundIndex + 1}`}
                      </div>
                      {round.map((match) => (
                        <div key={match.id} className="bracket-match-card" style={{
                          background: 'var(--card-bg)',
                          border: '2px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          minWidth: '200px',
                          boxShadow: match.status === 'ongoing' ? '0 0 10px rgba(102, 126, 234, 0.5)' : 'none'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: match.winner?.id === match.player1?.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            borderRadius: '4px',
                            marginBottom: '0.25rem',
                            fontWeight: match.winner?.id === match.player1?.id ? '600' : '400'
                          }}>
                            <span>{match.player1?.username || 'TBD'}</span>
                            <span style={{ 
                              fontWeight: 'bold',
                              color: match.winner?.id === match.player1?.id ? '#22c55e' : 'inherit'
                            }}>
                              {match.player1_score !== null && match.player1_score !== undefined ? match.player1_score : '-'}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: match.winner?.id === match.player2?.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            borderRadius: '4px',
                            fontWeight: match.winner?.id === match.player2?.id ? '600' : '400'
                          }}>
                            <span>{match.player2?.username || 'TBD'}</span>
                            <span style={{ 
                              fontWeight: 'bold',
                              color: match.winner?.id === match.player2?.id ? '#22c55e' : 'inherit'
                            }}>
                              {match.player2_score !== null && match.player2_score !== undefined ? match.player2_score : '-'}
                            </span>
                          </div>
                          {match.status === 'ongoing' && (
                            <div style={{ 
                              textAlign: 'center', 
                              marginTop: '0.5rem', 
                              fontSize: '0.75rem',
                              color: '#667eea',
                              fontWeight: 'bold'
                            }}>
                              {t('tournaments.live') || 'LIVE'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : brackets.name ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>{t('tournaments.no_matches') || 'No matches have been created yet for this tournament.'}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>{t('tournaments.select_above') || 'Please select a tournament from the dropdown above.'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tournament-content">
              <div className="tournament-history">
                {completedTournaments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <p>{t('tournaments.no_history') || 'No completed tournaments yet'}</p>
                  </div>
                )}
                {completedTournaments.map((tournament) => {
                  // Calculate user's placement in the tournament
                  let userPlacement = null;
                  let placementIcon = '🏅';
                  
                  if (tournament.matches && tournament.matches.length > 0 && userData?.userId) {
                    const finalMatch = tournament.matches.find(m => 
                      m.status === 'completed' && 
                      tournament.matches.filter(match => match.status === 'completed').length === tournament.matches.length - 1 || 
                      (tournament.matches.every(match => match.status === 'completed') && 
                       !tournament.matches.some(later => 
                         (later.player1?.id === m.winner?.id || later.player2?.id === m.winner?.id) && later.id > m.id
                       ))
                    );
                    
                    const userMatches = tournament.matches.filter(m => 
                      m.player1?.id === userData.userId || m.player2?.id === userData.userId
                    );
                    
                    if (finalMatch && (finalMatch.player1?.id === userData.userId || finalMatch.player2?.id === userData.userId)) {
                      // User was in the final
                      if (finalMatch.winner?.id === userData.userId) {
                        userPlacement = '1st';
                        placementIcon = '🥇';
                      } else {
                        userPlacement = '2nd';
                        placementIcon = '🥈';
                      }
                    } else if (userMatches.length > 0) {
                      // Check if user lost in semi-final (2nd to last round)
                      const lastMatch = userMatches[userMatches.length - 1];
                      if (lastMatch.status === 'completed' && lastMatch.winner?.id !== userData.userId) {
                        // User lost - check which round
                        const completedBeforeUser = tournament.matches.filter(m => 
                          m.status === 'completed' && m.created_at < lastMatch.created_at
                        ).length;
                        
                        if (tournament.max_players === 4 && userMatches.length === 1) {
                          userPlacement = '3rd';
                          placementIcon = '🥉';
                        } else if (tournament.max_players === 8 && completedBeforeUser >= 4) {
                          userPlacement = '3rd';
                          placementIcon = '🥉';
                        } else {
                          userPlacement = `${Math.ceil(tournament.max_players / Math.pow(2, userMatches.length))}th`;
                          placementIcon = '🏅';
                        }
                      }
                    }
                  }
                  
                  return (
                  <div key={tournament.id} className="history-card">
                    <div className="history-card-icon">
                      {placementIcon}
                    </div>
                    <div className="history-card-info">
                      <h3>{tournament.name}</h3>
                      <div className="history-details">
                        <span>
                          {userPlacement || t('tournaments.participant') || 'Participant'}
                        </span>
                        <span>•</span>
                        <span>
                          {tournament.end_date 
                            ? new Date(tournament.end_date).toLocaleDateString()
                            : tournament.created_at 
                              ? new Date(tournament.created_at).toLocaleDateString()
                              : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {userPlacement === '1st' && (
                      <div className="history-card-prize">
                        <div className="prize-label">Prize</div>
                        <div className="prize-value">{tournament.prize_pool || tournament.prize || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                  );
                })}
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
