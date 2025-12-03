/**
 * Main SPA Application Controller
 */

import { PongGame } from './pong-engine.js';
import { TournamentManager } from './tournament.js';
import { initTheme } from './theme.js';
import { HomeView } from './views/home.js';
import { GameView } from './views/game.js';
import { TournamentView } from './views/tournament.js';
import { ChatView } from './views/chat.js';
import { ProfileView } from './views/profile.js';
import { STORAGE_KEYS } from './utils/constants.js';
import { getItem } from './utils/storage.js';
import { initNavbarSearch as initNavbarSearchUtil, initNotifications as initNotificationsUtil } from './utils/navbar.js';
import { initMainSearch } from './utils/search.js';

class App {
    constructor() {
        this.currentView = null;
        this.pongGame = null;
        this.tournament = null;
        this.appContainer = document.getElementById('app');
        this.navbarSearchInitialized = false;
        this.notificationClickHandler = null;
        this.documentClickHandler = null;
        
        // Initialize view instances
        this.homeView = new HomeView(this);
        this.gameView = new GameView(this);
        this.tournamentView = new TournamentView(this);
        this.chatView = new ChatView(this);
        this.profileView = new ProfileView(this);
        
        // Initialize theme
        initTheme();
        
        this.init();
    }

    init() {
        // Check authentication on initial load
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const hash = window.location.hash.slice(1) || 'home';
        
        // Protected routes that require authentication
        const protectedRoutes = ['game', 'tournament', 'tournament-play', 'tournament-results', 'chat', 'profile'];
        
        if (protectedRoutes.includes(hash) && !userData) {
            // Redirect to login if trying to access protected route without authentication
            window.location.href = 'login.html';
            return;
        }
        
        // Check hash on load and navigate to that view
        this.loadView(hash, false);
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.loadView(e.state.view, false);
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', (e) => {
            const newHash = window.location.hash.slice(1) || 'home';
            if (newHash !== this.currentView) {
                this.loadView(newHash, false);
            }
        });

        // Set initial history state
        history.replaceState({ view: hash }, '', `#${hash}`);
    }

    loadView(viewName, addToHistory = true) {
        // Check if user is authenticated for protected routes
        const protectedRoutes = ['game', 'tournament', 'tournament-play', 'tournament-results', 'chat', 'profile'];
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        
        if (protectedRoutes.includes(viewName) && !userData) {
            // Redirect to login page
            window.location.href = 'login.html';
            return;
        }

        this.currentView = viewName;
        
        if (addToHistory) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        // Clean up previous game instance
        if (this.pongGame) {
            this.pongGame.destroy();
            this.pongGame = null;
        }

        // Remove existing theme toggle before rendering new view
        const existingToggle = document.querySelector('.theme-toggle');
        if (existingToggle) {
            existingToggle.remove();
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
        
        // Reinitialize theme toggle for new view
        initTheme();
        
        // Initialize navbar features if present
        initNavbarSearchUtil(this);
        initNotificationsUtil(this);
    }

    // Wrapper methods for view modules to call
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

// Initialize app when DOM is ready
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
