import { PongGame } from './pong-engine.ts';
import { TournamentManager } from './tournament.ts';
import { initTheme } from './theme.ts';
import { HomeView } from './views/home.ts';
import { GameView } from './views/game.ts';
import { TournamentView } from './views/tournament.ts';
import { ChatView } from './views/chat.ts';
import { ProfileView } from './views/profile.ts';
import { STORAGE_KEYS } from './utils/constants.ts';
import { getItem } from './utils/storage.ts';
import { initNavbarSearch as initNavbarSearchUtil, initNotifications as initNotificationsUtil } from './utils/navbar.ts';
import { initMainSearch } from './utils/search.ts';

class App {
    constructor() {
        this.currentView = null;
        this.pongGame = null;
        this.tournament = null;
        this.appContainer = document.getElementById('app');
        this.navbarSearchInitialized = false;
        this.notificationClickHandler = null;
        this.documentClickHandler = null;

        this.homeView = new HomeView(this);
        this.gameView = new GameView(this);
        this.tournamentView = new TournamentView(this);
        this.chatView = new ChatView(this);
        this.profileView = new ProfileView(this);

        initTheme();
        
        this.init();
    }

    init() {

        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const hash = window.location.hash.slice(1) || 'home';

        const protectedRoutes = ['game', 'tournament', 'tournament-play', 'tournament-results', 'chat', 'profile'];
        
        if (protectedRoutes.includes(hash) && !userData) {

            window.location.href = 'login.html';
            return;
        }

        this.loadView(hash, false);

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.loadView(e.state.view, false);
            }
        });

        window.addEventListener('hashchange', (e) => {
            const newHash = window.location.hash.slice(1) || 'home';
            if (newHash !== this.currentView) {
                this.loadView(newHash, false);
            }
        });

        history.replaceState({ view: hash }, '', `#${hash}`);
    }

    loadView(viewName, addToHistory = true) {

        const protectedRoutes = ['game', 'tournament', 'tournament-play', 'tournament-results', 'chat', 'profile'];
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        
        if (protectedRoutes.includes(viewName) && !userData) {

            window.location.href = 'login.html';
            return;
        }

        this.currentView = viewName;
        
        if (addToHistory) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        if (this.pongGame) {
            this.pongGame.destroy();
            this.pongGame = null;
        }

        switch(viewName) {
            case 'home':
                this.homeView.render();
                break;
            case 'game':
                this.gameView.render();
                break;
            case 'tournament':
                this.tournamentView.renderSetup();
                break;
            case 'tournament-play':
                this.tournamentView.renderPlay();
                break;
            case 'tournament-results':
                this.tournamentView.renderResults();
                break;
            case 'chat':
                this.chatView.render();
                break;
            case 'profile':
                this.profileView.render();
                break;
            default:
                this.homeView.render();
        }

        initTheme();

        initNavbarSearchUtil(this);
        initNotificationsUtil(this);
    }

    initNavbarSearch() {
        initNavbarSearchUtil(this);
    }

    initNetflixSearch() {
        initMainSearch(this);
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new App();
    } catch (error) {
        console.error('Error initializing App:', error);
        document.getElementById('app').innerHTML = `
            <div style="padding: 20px; color: red;">
                <h1>Error Loading Application</h1>
                <p>Check browser console for details.</p>
                <pre>${error.message}</pre>
            </div>
        `;
    }
});
