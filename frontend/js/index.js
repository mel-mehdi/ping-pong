/**
 * Main SPA Application Controller
 */

console.log('index.js loaded');

import { PongGame } from './pong-engine.js';
import { TournamentManager } from './tournament.js';
import { initTheme } from './theme.js';
import { HomeView } from './views/home.js';
import { GameView } from './views/game.js';
import { TournamentView } from './views/tournament.js';
import { ChatView } from './views/chat.js';
import { ProfileView } from './views/profile.js';

console.log('All imports successful');

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
        
        // Set default user as logged in for demo
        if (!localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', 'Player');
        }
        
        // Initialize theme
        initTheme();
        
        this.init();
    }

    init() {
        // Check hash on load and navigate to that view
        const hash = window.location.hash.slice(1) || 'home';
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
        this.initNavbarButtons();
        this.initNavbarSearch();
    }

    initNavbarButtons() {
        const navNotifBtn = document.getElementById('navNotificationsBtn');
        const navNotifBadge = document.getElementById('navNotificationBadge');

        // Update notification badge from localStorage
        if (navNotifBadge) {
            const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
            if (receivedRequests.length > 0) {
                navNotifBadge.textContent = receivedRequests.length;
                navNotifBadge.classList.remove('hidden');
            } else {
                navNotifBadge.classList.add('hidden');
            }
        }

        // Notification button - toggle notification panel directly
        if (navNotifBtn && !this.notificationClickHandler) {
            this.notificationClickHandler = (e) => {
                e.stopPropagation();
                const notifPanel = document.getElementById('notificationPanel');
                notifPanel?.classList.toggle('hidden');
                this.displayNotifications();
            };
            navNotifBtn.addEventListener('click', this.notificationClickHandler);
        }

        // Close notification panel when clicking outside
        if (!this.documentClickHandler) {
            this.documentClickHandler = (e) => {
                const notifPanel = document.getElementById('notificationPanel');
                const navNotifBtn = document.getElementById('navNotificationsBtn');
                if (notifPanel && !notifPanel.contains(e.target) && !navNotifBtn?.contains(e.target)) {
                    notifPanel.classList.add('hidden');
                }
            };
            document.addEventListener('click', this.documentClickHandler);
        }
    }

    initNavbarSearch() {
        // Stub for navbar search functionality - implement in view modules as needed
    }

    initNetflixSearch() {
        // Stub for Netflix-style search functionality - implement in view modules as needed
    }

    displayNotifications() {
        // Stub for displaying notifications - implement as needed
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing App...');
    try {
        new App();
        console.log('App initialized successfully');
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
