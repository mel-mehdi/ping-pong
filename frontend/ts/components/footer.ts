export function renderFooter() {
    return `
        <footer class="app-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>FT Transcendence</h4>
                        <p>A modern web-based Pong game with tournaments, multiplayer, and competitive play.</p>
                        <p class="footer-academic">Part of 42 School Curriculum</p>
                    </div>
                    <div class="footer-section">
                        <h5>Quick Links</h5>
                        <ul class="footer-links">
                            <li><a href="#home">Home</a></li>
                            <li><a href="#game">Play Game</a></li>
                            <li><a href="#chat">Chat</a></li>
                            <li><a href="#profile">Profile</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h5>Legal</h5>
                        <ul class="footer-links">
                            <li><a href="html/privacy.html">Privacy Policy</a></li>
                            <li><a href="html/terms.html">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h5>Connect</h5>
                        <div class="footer-social">
                            <a href="#" aria-label="GitHub" title="GitHub">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="#" aria-label="Discord" title="Discord">
                                <i class="fab fa-discord"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} FT Transcendence. All rights reserved.</p>
                    <p class="footer-disclaimer">This is an educational project created for the 42 School curriculum.</p>
                </div>
            </div>
        </footer>
    `;
}
