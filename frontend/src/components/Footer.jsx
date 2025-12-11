import { Link } from 'react-router-dom';


const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>PingPong</h4>
                        <p>A modern web-based Pong game with tournaments, multiplayer, and competitive play.</p>
                        <p className="footer-academic">Part of 42 School Curriculum</p>
                    </div>
                    <div className="footer-section">
                        <h5>Quick Links</h5>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/game">Play Game</Link></li>
                            <li><Link to="/chat">Chat</Link></li>
                            <li><Link to="/profile">Profile</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Legal</h5>
                        <ul className="footer-links">
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Connect</h5>
                        <div className="footer-social">
                            <a href="#" aria-label="GitHub" title="GitHub">
                                <i className="fab fa-github"></i>
                            </a>
                            <a href="#" aria-label="Discord" title="Discord">
                                <i className="fab fa-discord"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} PingPong. All rights reserved.</p>
                    <p className="footer-disclaimer">This is an educational project created for the 42 School curriculum.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
