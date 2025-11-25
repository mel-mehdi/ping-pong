# Ping Pong Game 🏓

A responsive, accessible web-based Ping Pong game built with vanilla HTML, CSS, and JavaScript.

## Features

- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ♿ **Accessibility** - WCAG compliant with ARIA labels, keyboard navigation, and screen reader support
- 🎮 **Two-Player Game** - Local multiplayer ping pong game
- 📊 **Dashboard** - Track stats, view leaderboard, and monitor recent activity
- 👤 **User Profile** - Manage account information and view match history
- 🔐 **Authentication** - Login and registration with client-side validation
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations

## Project Structure

```
frontend/
├── pages/              # HTML pages
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── game.html
│   └── profile.html
├── scripts/            # JavaScript modules
│   ├── auth.js         # Authentication logic
│   ├── dashboard.js    # Dashboard functionality
│   ├── game.js         # Game logic
│   ├── profile.js      # Profile management
│   └── utils/          # Utility modules
│       ├── constants.js
│       ├── storage.js
│       ├── validation.js
│       └── dom.js
├── styles/             # CSS stylesheets
│   └── main.css
├── .gitignore
├── README.md
└── package.json
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (optional, for development tools)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Open `pages/login.html` in your web browser

**OR** use a local development server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000/pages/login.html`

## Usage

### Authentication

1. **Register**: Create a new account on the registration page
2. **Login**: Access your account with username/email and password
3. **Logout**: Click the logout button in the navigation bar

### Playing the Game

1. Navigate to the "Play Game" page
2. Click "Start Game" to begin
3. **Player 1 Controls**: W (up) / S (down)
4. **Player 2 Controls**: I (up) / K (down)
5. First player to 5 points wins!

### Profile Management

- View your player statistics
- Edit profile information
- Check match history

## Code Organization

### Separation of Concerns

- **HTML**: Semantic structure with proper ARIA attributes
- **CSS**: Modular styling with CSS custom properties
- **JavaScript**: ES6 modules for maintainability

### Utility Modules

- `constants.js`: Application-wide constants
- `storage.js`: localStorage wrapper with error handling
- `validation.js`: Form validation utilities
- `dom.js`: DOM manipulation helpers

## Accessibility Features

- ✅ Semantic HTML5 elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Color contrast compliance
- ✅ Responsive text sizing

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations

- Module-based JavaScript for code splitting
- CSS animations with GPU acceleration
- Debounced/throttled event handlers
- Lazy loading where applicable
- Optimized canvas rendering

## Development Guidelines

### Code Style

- Use ES6+ features (arrow functions, template literals, destructuring)
- Follow consistent naming conventions (camelCase for variables/functions)
- Add JSDoc comments for functions
- Keep functions small and focused

### Validation Rules

- **Username**: 3-20 characters, letters/numbers/underscores only
- **Password**: Minimum 8 characters
- **Email**: Valid email format

### Adding New Features

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write clean, documented code
3. Test across browsers
4. Ensure accessibility compliance
5. Submit pull request

## Deployment

### GitHub Pages

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch `/pages` folder
4. Access via `https://username.github.io/repository`

### Netlify

1. Connect repository to Netlify
2. Set publish directory to `/`
3. Deploy automatically on push

### Vercel

```bash
npm install -g vercel
vercel --prod
```

## Testing

### Manual Testing Checklist

- [ ] All forms validate correctly
- [ ] Navigation works across all pages
- [ ] Game functions properly
- [ ] Responsive on mobile devices
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please open an issue in the repository.

## Acknowledgments

- Built following modern web development best practices
- Designed with accessibility and usability in mind
- Inspired by classic Pong game mechanics

---

**Made with ❤️ using vanilla HTML, CSS, and JavaScript**
