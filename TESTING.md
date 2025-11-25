# Testing Guide

Comprehensive testing guide for the Ping Pong Game application.

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Accessibility Testing](#accessibility-testing)
3. [Browser Compatibility](#browser-compatibility)
4. [Responsive Design Testing](#responsive-design-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

## Manual Testing

### Authentication Flow

#### Login Page (`login.html`)

**Test Case 1: Valid Login**
- [ ] Enter valid username
- [ ] Enter valid password
- [ ] Click "Remember me"
- [ ] Submit form
- [ ] Verify redirect to dashboard
- [ ] Verify user data stored in localStorage

**Test Case 2: Empty Fields**
- [ ] Submit form with empty username
- [ ] Verify error message displays
- [ ] Submit form with empty password
- [ ] Verify error message displays

**Test Case 3: Navigation**
- [ ] Click "Sign up here" link
- [ ] Verify redirect to register page
- [ ] Click "Forgot password?" link (optional)

#### Registration Page (`register.html`)

**Test Case 1: Valid Registration**
- [ ] Enter full name (2+ words)
- [ ] Enter valid email
- [ ] Enter valid username (3-20 chars)
- [ ] Enter password (8+ chars)
- [ ] Confirm password matches
- [ ] Check "Terms & Conditions"
- [ ] Submit form
- [ ] Verify redirect to dashboard

**Test Case 2: Validation Errors**
- [ ] Submit with invalid email format
- [ ] Submit with short username (< 3 chars)
- [ ] Submit with short password (< 8 chars)
- [ ] Submit with non-matching passwords
- [ ] Submit without accepting terms
- [ ] Verify appropriate error messages

**Test Case 3: Real-time Validation**
- [ ] Type invalid email, blur field
- [ ] Verify error shows immediately
- [ ] Correct the email
- [ ] Verify error clears

### Dashboard (`dashboard.html`)

**Test Case 1: Page Load**
- [ ] Verify user name displays correctly
- [ ] Verify stats cards show data
- [ ] Verify leaderboard displays
- [ ] Verify recent activity shows

**Test Case 2: Navigation**
- [ ] Click "Play Now" button
- [ ] Verify redirect to game page
- [ ] Click "Play Game" in nav
- [ ] Click "Profile" in nav
- [ ] Click "Dashboard" in nav
- [ ] Click "Logout"
- [ ] Verify redirect to login

**Test Case 3: Authentication**
- [ ] Clear localStorage
- [ ] Reload page
- [ ] Verify redirect to login

### Game Page (`game.html`)

**Test Case 1: Game Start**
- [ ] Click "Start Game"
- [ ] Verify game begins
- [ ] Verify start button disabled
- [ ] Verify pause button enabled

**Test Case 2: Game Controls**
- [ ] Press W key (Player 1 up)
- [ ] Press S key (Player 1 down)
- [ ] Press I key (Player 2 up)
- [ ] Press K key (Player 2 down)
- [ ] Verify paddles move correctly
- [ ] Verify paddles stay in bounds

**Test Case 3: Game Logic**
- [ ] Let ball pass Player 1
- [ ] Verify Player 2 score increases
- [ ] Let ball pass Player 2
- [ ] Verify Player 1 score increases
- [ ] Play until 5 points
- [ ] Verify "Game Over" shows
- [ ] Verify winner announced

**Test Case 4: Game Controls**
- [ ] Click "Pause" during game
- [ ] Verify game stops
- [ ] Click "Resume"
- [ ] Verify game continues
- [ ] Click "Play Again" after game over
- [ ] Verify scores reset

### Profile Page (`profile.html`)

**Test Case 1: Display Profile**
- [ ] Verify profile data loads
- [ ] Verify avatar initials show
- [ ] Verify stats display
- [ ] Verify match history shows

**Test Case 2: Edit Profile**
- [ ] Click "Edit" button
- [ ] Verify inputs become enabled
- [ ] Verify username stays disabled
- [ ] Modify full name
- [ ] Modify email
- [ ] Click "Save Changes"
- [ ] Verify data saved to localStorage
- [ ] Verify inputs disabled again

**Test Case 3: Match History**
- [ ] Verify wins show green indicator
- [ ] Verify losses show red indicator
- [ ] Verify timestamps display correctly

## Accessibility Testing

### Keyboard Navigation

**Test All Pages:**
- [ ] Tab through all interactive elements
- [ ] Verify focus indicator visible
- [ ] Test form submission with Enter key
- [ ] Test button activation with Space/Enter
- [ ] Navigate links with Enter key
- [ ] Test game controls with keyboard only

### Screen Reader Testing

**Tools:** NVDA (Windows), JAWS, VoiceOver (Mac)

**Test:**
- [ ] Page structure announced correctly
- [ ] Form labels read properly
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Links descriptive
- [ ] ARIA labels working
- [ ] Alt text for decorative emojis

### Color Contrast

**Tools:** WAVE, Axe DevTools, Chrome Lighthouse

**Test:**
- [ ] Text meets WCAG AA (4.5:1 ratio)
- [ ] Interactive elements meet standards
- [ ] Focus indicators visible
- [ ] Error messages distinguishable

### ARIA Implementation

**Verify:**
- [ ] `role` attributes used correctly
- [ ] `aria-label` descriptive
- [ ] `aria-required` on required fields
- [ ] `aria-invalid` on error fields
- [ ] `aria-live` on dynamic content
- [ ] `aria-current` on active nav items

## Browser Compatibility

### Desktop Browsers

**Chrome (Latest)**
- [ ] All pages load correctly
- [ ] Forms work
- [ ] Game renders properly
- [ ] Animations smooth

**Firefox (Latest)**
- [ ] All pages load correctly
- [ ] Forms work
- [ ] Game renders properly
- [ ] Animations smooth

**Safari (Latest)**
- [ ] All pages load correctly
- [ ] Forms work
- [ ] Game renders properly
- [ ] Animations smooth
- [ ] localStorage works

**Edge (Latest)**
- [ ] All pages load correctly
- [ ] Forms work
- [ ] Game renders properly
- [ ] Animations smooth

### Mobile Browsers

**iOS Safari**
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] Game playable on touch
- [ ] Layout responsive

**Chrome Mobile**
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] Layout responsive

**Firefox Mobile**
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] Layout responsive

## Responsive Design Testing

### Breakpoints

**Desktop (1200px+)**
- [ ] Full layout displays
- [ ] All features accessible
- [ ] Game canvas appropriate size

**Tablet (768px - 1199px)**
- [ ] Layout adjusts appropriately
- [ ] Navigation remains usable
- [ ] Game controls accessible

**Mobile (< 768px)**
- [ ] Single column layout
- [ ] Navigation collapses
- [ ] Forms stack vertically
- [ ] Game controls stack
- [ ] Touch-friendly sizes (44px minimum)

**Small Mobile (< 480px)**
- [ ] Content fits without horizontal scroll
- [ ] Text remains readable
- [ ] Buttons still tappable

### Device Testing

**Test on actual devices:**
- [ ] iPhone (iOS Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet

### Orientation Testing

- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Game adapts to orientation

## Performance Testing

### Lighthouse Audit

**Run in Chrome DevTools:**

**Target Scores:**
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

**Metrics:**
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

### Load Testing

**Test:**
- [ ] Initial page load < 2s
- [ ] JavaScript execution < 1s
- [ ] Canvas initialization immediate
- [ ] No layout shifts on load

### Game Performance

**Test:**
- [ ] Game runs at 60 FPS
- [ ] No frame drops during play
- [ ] Smooth paddle movement
- [ ] Responsive ball physics

## Security Testing

### Input Validation

**Test:**
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized
- [ ] HTML in forms escaped
- [ ] Script tags in input rejected

### localStorage Security

**Test:**
- [ ] Sensitive data not stored
- [ ] Data properly scoped
- [ ] Storage limits respected
- [ ] Data cleared on logout

### HTTPS

**Production:**
- [ ] Site served over HTTPS
- [ ] Mixed content warnings resolved
- [ ] Security headers present

## Automated Testing Tools

### Recommended Tools

1. **Lighthouse** - Performance, accessibility, SEO
2. **WAVE** - Accessibility testing
3. **Axe DevTools** - Accessibility testing
4. **BrowserStack** - Cross-browser testing
5. **Chrome DevTools** - Network, performance

### Running Lighthouse

```bash
# Install globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:8000/pages/login.html --view

# Generate report
lighthouse http://localhost:8000/pages/login.html --output html --output-path ./report.html
```

## Bug Reporting

When reporting bugs, include:

1. **Environment:**
   - Browser and version
   - Operating system
   - Device type

2. **Steps to Reproduce:**
   - Detailed step-by-step
   - Expected behavior
   - Actual behavior

3. **Screenshots/Videos:**
   - Visual evidence
   - Console errors

4. **Severity:**
   - Critical: App unusable
   - High: Major feature broken
   - Medium: Feature degraded
   - Low: Minor issue

## Test Completion Checklist

- [ ] All manual tests passed
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified
- [ ] Responsive design working
- [ ] Performance benchmarks met
- [ ] Security validated
- [ ] Documentation updated
- [ ] Known issues documented

## Continuous Testing

### Pre-Commit
- [ ] Run ESLint
- [ ] Run Prettier
- [ ] Verify no console errors

### Pre-Deploy
- [ ] Run full test suite
- [ ] Check Lighthouse scores
- [ ] Verify on staging environment
- [ ] Get stakeholder approval

---

**Testing is continuous!** Regularly re-test after changes and updates.
