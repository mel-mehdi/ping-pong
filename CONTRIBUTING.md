# Contributing to Ping Pong Game

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Submitting Changes](#submitting-changes)
6. [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing others' private information
- Other conduct deemed inappropriate

## Getting Started

### Prerequisites

- Git installed
- Modern web browser
- Code editor (VS Code recommended)
- Node.js and npm (optional, for development tools)

### Setup Development Environment

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/your-username/ping-pong-game.git
cd ping-pong-game
```

3. Install dependencies (optional):
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

5. Open `http://localhost:8000/pages/login.html`

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in small, logical commits
2. Test thoroughly
3. Update documentation if needed
4. Ensure code passes linting
5. Verify accessibility compliance

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password strength indicator

fix(game): resolve paddle boundary collision bug

docs(readme): update installation instructions

style(css): improve button hover states
```

## Coding Standards

### HTML

**Structure:**
- Use semantic HTML5 elements
- Proper heading hierarchy (h1 → h2 → h3)
- Meaningful IDs and class names

**Accessibility:**
- Include ARIA labels where appropriate
- Add `alt` text for images
- Ensure keyboard navigation
- Use `role` attributes correctly

**Example:**
```html
<nav role="navigation" aria-label="Main navigation">
    <ul class="nav-menu">
        <li><a href="dashboard.html" aria-current="page">Dashboard</a></li>
    </ul>
</nav>
```

### CSS

**Organization:**
- Group related styles
- Use CSS custom properties for colors
- Mobile-first responsive design
- Consistent spacing units

**Naming:**
- Use BEM-like naming for clarity
- Descriptive class names
- Avoid overly specific selectors

**Example:**
```css
/* Good */
.card {
    padding: 20px;
    border-radius: 10px;
}

.card-header {
    margin-bottom: 15px;
}

/* Avoid */
div.card > div:first-child {
    margin-bottom: 15px;
}
```

### JavaScript

**Style:**
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Destructure when appropriate

**Code Organization:**
- One module per file
- Export/import properly
- Group related functions
- Add JSDoc comments

**Example:**
```javascript
/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return { isValid: false, message: 'Email is required' };
    }
    
    const isValid = EMAIL_PATTERN.test(email);
    return {
        isValid,
        message: isValid ? '' : 'Invalid email format'
    };
}
```

**Error Handling:**
- Always handle errors
- Provide meaningful error messages
- Use try-catch for risky operations

**Performance:**
- Debounce/throttle event handlers
- Minimize DOM manipulation
- Use event delegation where appropriate
- Cache DOM queries

### File Organization

```
frontend/
├── pages/              # HTML pages
│   ├── login.html
│   └── ...
├── scripts/            # JavaScript modules
│   ├── auth.js
│   ├── game.js
│   └── utils/         # Utility modules
│       ├── constants.js
│       ├── storage.js
│       ├── validation.js
│       └── dom.js
├── styles/            # CSS files
│   └── main.css
└── assets/            # Images, fonts (if added)
```

## Submitting Changes

### Pull Request Process

1. **Update your branch:**
```bash
git checkout main
git pull origin main
git checkout feature/your-feature
git rebase main
```

2. **Run quality checks:**
```bash
npm run lint
npm run format:check
```

3. **Push to your fork:**
```bash
git push origin feature/your-feature
```

4. **Create Pull Request:**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Mobile responsive
- [ ] Accessibility verified

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass
```

### Code Review

**Reviewers will check:**
- Code quality and style
- Functionality works as expected
- Tests are adequate
- Documentation is clear
- Accessibility compliance
- Performance considerations

**Responding to Feedback:**
- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time

## Reporting Issues

### Before Reporting

1. Search existing issues
2. Check if bug already fixed
3. Verify you're using latest version
4. Try to reproduce consistently

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [e.g., Chrome 90]
- OS: [e.g., Windows 10]
- Device: [e.g., Desktop]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

### Feature Requests

```markdown
## Feature Description
Clear description of proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How might this be implemented?

## Alternatives
Other ways to achieve the same goal

## Additional Context
Mockups, examples, etc.
```

## Development Best Practices

### Testing

**Before submitting:**
- Test all affected functionality
- Test on multiple browsers
- Test responsive design
- Verify accessibility
- Check for console errors

**Use these tools:**
- Chrome DevTools
- Lighthouse
- WAVE (accessibility)
- BrowserStack (cross-browser)

### Documentation

**Update when:**
- Adding new features
- Changing functionality
- Modifying API/interfaces
- Fixing significant bugs

**Document:**
- What changed
- Why it changed
- How to use new features
- Migration steps (if breaking)

### Performance

**Consider:**
- Minimize network requests
- Optimize images
- Lazy load when possible
- Use CSS animations over JS
- Debounce/throttle events
- Cache DOM queries

### Accessibility

**Always ensure:**
- Keyboard navigation works
- Screen reader compatible
- Color contrast sufficient
- Focus indicators visible
- Error messages clear
- ARIA labels present

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review similar implementations
- Ask in pull request comments

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Appreciated for their work! 🎉

---

Thank you for contributing to make this project better! 🏓
