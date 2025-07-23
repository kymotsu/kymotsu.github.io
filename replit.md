# Steam Friends Game Finder

## Overview

This is a client-side web application that helps Steam users find games they can play together with their friends. The application allows users to manage a list of Steam friends and discover common games across their libraries using the Steam Web API.

## User Preferences

Preferred communication style: Simple, everyday language.
User requested alternative to API key requirement as it's cumbersome for most users.
User approval: "This looks really good, I like the login options." (January 23, 2025)

## System Architecture

### Frontend Architecture
- **Pure HTML/CSS/JavaScript**: No frameworks used, vanilla JavaScript with ES6 classes
- **Modular Design**: Code is organized into separate classes for different responsibilities
- **Local Storage**: Data persistence handled entirely on the client-side
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts

### Client-Side Only Architecture
The application is designed as a purely client-side solution with no backend server. All data processing and API calls are handled in the browser.

## Key Components

### 1. SteamAuth Class (`js/steam-auth.js`) - NEW
- **Purpose**: Handles Steam OpenID authentication and user login
- **Features**: Steam login integration, user session management, demo mode simulation
- **Benefits**: Eliminates need for manual API key setup for most users

### 2. FriendsManager Class (`js/friends-manager.js`)
- **Purpose**: Manages friend data storage and validation
- **Features**: Add/remove friends, validate Steam IDs, handle friend selection
- **Storage**: Uses localStorage for persistence

### 3. SteamAPI Class (`js/steam-api.js`)
- **Purpose**: Handles all Steam Web API interactions
- **Features**: API key management, CORS proxy integration, request handling
- **Challenge**: Uses CORS proxy to bypass browser CORS restrictions

### 4. DemoDataService Class (`js/demo-data.js`) - NEW
- **Purpose**: Provides sample data for demo mode functionality
- **Features**: Demo friends, sample games, simulated API responses
- **Benefits**: Allows users to explore the interface without API setup

### 5. Main Application Class (`js/app.js`)
- **Purpose**: Orchestrates the entire application
- **Features**: Multi-modal authentication, UI event handling, state management
- **Architecture**: Event-driven with support for Steam login, API key, and demo modes

### 6. UI Components
- **Multiple Authentication Options**: Steam login, API key setup, and demo mode
- **Steam-themed Design**: Dark theme matching Steam's visual identity
- **Interactive Elements**: Enhanced modals, dynamic friend lists, game grids
- **Progressive Enhancement**: Multiple fallback options for different user preferences

## Data Flow

1. **Friend Management**: User adds friends → Validation → Local storage → UI update
2. **Game Discovery**: Select friends → Fetch libraries via Steam API → Find common games → Display results
3. **API Key Setup**: User provides Steam API key → Stored locally → Used for all API calls

## External Dependencies

### Steam Web API
- **Purpose**: Fetch user game libraries and profile information
- **Authentication**: Requires Steam Web API key
- **Endpoints Used**: 
  - Player service for profile data
  - Game library service for owned games
- **Rate Limiting**: Handled through user-initiated requests only

### CORS Proxy
- **Service**: cors-anywhere.herokuapp.com
- **Purpose**: Bypass browser CORS restrictions for Steam API calls
- **Alternative**: Could be replaced with a custom proxy or backend service

### Third-Party Assets
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography enhancement
- **http-server**: Development server for local testing

## Deployment Strategy

### Current Setup
- **Static Hosting**: Designed for deployment to any static web host
- **No Build Process**: Direct file serving without compilation
- **Environment Variables**: API key can be injected at build time

### Recommended Deployment Options
1. **GitHub Pages**: Simple static hosting
2. **Netlify/Vercel**: Static hosting with environment variable support
3. **Any CDN**: Direct file serving capabilities

### Configuration Requirements
- Steam Web API key (either user-provided or environment variable)
- CORS proxy service (current dependency on cors-anywhere)

### Scalability Considerations
- All processing happens client-side, so server load is minimal
- API rate limiting handled by Steam's servers
- Could benefit from a custom backend for better CORS handling and API key security

## Architecture Decisions

### Client-Side Only Approach
- **Rationale**: Simplifies deployment and reduces infrastructure requirements
- **Trade-offs**: API key exposure, CORS complications, limited caching
- **Alternative**: Backend API service for better security and performance

### Local Storage for Data Persistence
- **Rationale**: No backend database required, instant loading
- **Trade-offs**: Data limited to single device/browser, no synchronization
- **Alternative**: Cloud database for cross-device sync

### CORS Proxy Dependency
- **Problem**: Browser CORS restrictions prevent direct Steam API calls
- **Solution**: Third-party proxy service
- **Risk**: Dependency on external service availability
- **Alternative**: Custom backend with proxy capabilities