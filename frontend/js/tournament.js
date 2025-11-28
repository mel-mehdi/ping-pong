/**
 * Tournament Manager
 * Handles bracket generation, match scheduling, and winner tracking
 */

export class TournamentManager {
    constructor(playerNames) {
        if (!playerNames || playerNames.length < 4) {
            throw new Error('Tournament requires at least 4 players');
        }

        // Validate player count (must be power of 2: 4, 8, 16)
        const validCounts = [4, 8, 16];
        if (!validCounts.includes(playerNames.length)) {
            throw new Error('Tournament requires 4, 8, or 16 players');
        }

        this.players = [...playerNames];
        this.allMatches = [];
        this.currentRound = 1;
        this.currentMatchIndex = 0;
        this.totalRounds = Math.log2(this.players.length);

        this.initializeBracket();
    }

    initializeBracket() {
        // Shuffle players for random bracket
        this.shufflePlayers();

        // Create first round matches
        const firstRoundMatches = [];
        for (let i = 0; i < this.players.length; i += 2) {
            firstRoundMatches.push({
                round: 1,
                player1: this.players[i],
                player2: this.players[i + 1],
                winner: null
            });
        }

        this.allMatches = firstRoundMatches;
    }

    shufflePlayers() {
        // Fisher-Yates shuffle
        for (let i = this.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
        }
    }

    getCurrentMatch() {
        const roundMatches = this.getRoundMatches();
        return roundMatches[this.currentMatchIndex] || null;
    }

    getNextMatch() {
        const roundMatches = this.getRoundMatches();
        const nextIndex = this.currentMatchIndex + 1;
        
        if (nextIndex < roundMatches.length) {
            return roundMatches[nextIndex];
        }

        // Check if there's a next round
        if (this.currentRound < this.totalRounds) {
            const nextRoundMatches = this.allMatches.filter(m => m.round === this.currentRound + 1);
            return nextRoundMatches[0] || null;
        }

        return null;
    }

    getRoundMatches() {
        return this.allMatches.filter(match => match.round === this.currentRound);
    }

    recordMatchWinner(winnerName) {
        const currentMatch = this.getCurrentMatch();
        if (!currentMatch) return;

        currentMatch.winner = winnerName;

        // Check if round is complete
        const roundMatches = this.getRoundMatches();
        const allMatchesComplete = roundMatches.every(match => match.winner !== null);

        if (allMatchesComplete) {
            // Move to next match or next round
            if (this.currentRound < this.totalRounds) {
                this.advanceToNextRound();
            }
        } else {
            // Move to next match in current round
            this.currentMatchIndex++;
        }
    }

    advanceToNextRound() {
        // Get winners from current round
        const roundMatches = this.getRoundMatches();
        const winners = roundMatches.map(match => match.winner);

        // Create next round matches
        const nextRoundMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            nextRoundMatches.push({
                round: this.currentRound + 1,
                player1: winners[i],
                player2: winners[i + 1],
                winner: null
            });
        }

        this.allMatches.push(...nextRoundMatches);
        this.currentRound++;
        this.currentMatchIndex = 0;
    }

    hasMoreMatches() {
        const currentMatch = this.getCurrentMatch();
        
        // If current match isn't finished yet, we still have this match
        if (currentMatch && !currentMatch.winner) {
            return true;
        }
        
        // Check if there are more matches in current round
        const roundMatches = this.getRoundMatches();
        if (this.currentMatchIndex < roundMatches.length - 1) {
            return true;
        }

        // Check if there are more rounds after this one
        if (this.currentRound < this.totalRounds) {
            return true;
        }

        return false;
    }

    getChampion() {
        // The winner of the last match in the final round
        const finalRoundMatches = this.allMatches.filter(m => m.round === this.totalRounds);
        if (finalRoundMatches.length > 0 && finalRoundMatches[0].winner) {
            return finalRoundMatches[0].winner;
        }
        return null;
    }

    getAllMatches() {
        return this.allMatches;
    }

    getTournamentBracket() {
        // Organize matches by round for display
        const bracket = {};
        for (let round = 1; round <= this.totalRounds; round++) {
            bracket[`Round ${round}`] = this.allMatches.filter(m => m.round === round);
        }
        return bracket;
    }
}
