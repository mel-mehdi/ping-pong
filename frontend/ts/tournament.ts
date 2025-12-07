export class TournamentManager {
    constructor(playerNames) {
        if (!playerNames || playerNames.length < 4) {
            throw new Error('Tournament requires at least 4 players');
        }

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

        this.shufflePlayers();

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

        const roundMatches = this.getRoundMatches();
        const allMatchesComplete = roundMatches.every(match => match.winner !== null);

        if (allMatchesComplete) {

            if (this.currentRound < this.totalRounds) {
                this.advanceToNextRound();
            }
        } else {

            this.currentMatchIndex++;
        }
    }

    advanceToNextRound() {

        const roundMatches = this.getRoundMatches();
        const winners = roundMatches.map(match => match.winner);

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

        if (currentMatch && !currentMatch.winner) {
            return true;
        }

        const roundMatches = this.getRoundMatches();
        if (this.currentMatchIndex < roundMatches.length - 1) {
            return true;
        }

        if (this.currentRound < this.totalRounds) {
            return true;
        }

        return false;
    }

    getChampion() {

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

        const bracket = {};
        for (let round = 1; round <= this.totalRounds; round++) {
            bracket[`Round ${round}`] = this.allMatches.filter(m => m.round === round);
        }
        return bracket;
    }
}
