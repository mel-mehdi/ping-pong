# TypeScript Setup

## Overview
All JavaScript files have been converted to TypeScript (.ts) and are compiled to JavaScript using Babel for browser compatibility.

## Structure
- **Source Files**: `js/**/*.ts` - All TypeScript source files
- **Compiled Output**: `dist/**/*.js` - Transpiled JavaScript files
- **Build Configuration**: `.babelrc` - Babel configuration for TypeScript compilation

## Build Process
1. TypeScript files (`.ts`) in `js/` directory are transpiled by Babel
2. Output JavaScript files (`.js`) are placed in `dist/` directory
3. Import paths are automatically transformed from `.ts` to `.js` extensions
4. ES2020 syntax is maintained for modern browser support

## Commands
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Build and start development server (port 8000)
- `npm run start` - Build and start production server (port 8000)
- `make frontend` - Build TypeScript and start frontend server
- `make all` - Build everything and start both backend and frontend

## TypeScript Files (21 total)
### Main Files
- `js/auth.ts` - Authentication logic
- `js/index.ts` - Main application entry point
- `js/login.ts` - Login page logic
- `js/register.ts` - Registration page logic
- `js/pong-engine.ts` - Pong game engine
- `js/theme.ts` - Theme switching
- `js/tournament.ts` - Tournament management

### Components
- `js/components/navbar.ts` - Navigation bar component

### Utilities
- `js/utils/api.ts` - API communication
- `js/utils/constants.ts` - Application constants
- `js/utils/database.ts` - Database operations
- `js/utils/dom.ts` - DOM manipulation helpers
- `js/utils/navbar.ts` - Navbar utilities
- `js/utils/search.ts` - Search functionality
- `js/utils/storage.ts` - Local storage wrapper
- `js/utils/validation.ts` - Form validation

### Views
- `js/views/chat.ts` - Chat view
- `js/views/game.ts` - Game view
- `js/views/home.ts` - Home view
- `js/views/profile.ts` - Profile view
- `js/views/tournament.ts` - Tournament view

## HTML Updates
All HTML files have been updated to import from the `dist/` directory:
- `html/index.html` → imports `dist/index.js`
- `html/login.html` → imports `dist/login.js` and `dist/theme.js`
- `html/register.html` → imports `dist/register.js` and `dist/theme.js`

## TypeScript Configuration
The project uses a lenient TypeScript configuration:
- Target: ES2020
- Module: ES2020
- Strict mode: Disabled for easier migration
- Source maps: Enabled for debugging
- DOM types: Included

## Notes
- Original `.js` files have been converted to `.ts`
- Type checking is lenient to allow gradual typing
- All imports use relative paths with `.js` extension in compiled output
- Babel is used instead of tsc for faster, more flexible compilation
