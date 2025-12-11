import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/tournament.css';

const TournamentPage = () => {
    const [activeTab, setActiveTab] = useState('active');
    
    const activeTournaments = [
        { id: 1, name: 'Winter Championship 2025', players: 14, maxPlayers: 16, prize: '1000 Points', status: 'Open', startsIn: '2 hours' },
        { id: 2, name: 'Speed Pong Challenge', players: 8, maxPlayers: 8, prize: '500 Points', status: 'Full', startsIn: '30 minutes' },
        { id: 3, name: 'Beginner Tournament', players: 5, maxPlayers: 8, prize: '250 Points', status: 'Open', startsIn: '4 hours' },
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

    return (
        <>
            <Navbar />
            <main className="tournament-main">
                <div className="container">
                    <div className="tournament-header">
                        <h1>🏆 Tournaments</h1>
                        <p className="text-muted">Compete in organized competitions and win prizes</p>
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
                                            <div className="tournament-info-row">
                                                <span className="info-label">Starts In:</span>
                                                <span className="info-value">{tournament.startsIn}</span>
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
                </div>
            </main>
            <Footer />
        </>
    );
};

export default TournamentPage;
