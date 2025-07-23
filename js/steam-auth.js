class SteamAuth {
    constructor() {
        this.steamOpenIdEndpoint = 'https://steamcommunity.com/openid/login';
        this.returnUrl = window.location.origin + window.location.pathname;
        this.realm = window.location.origin;
        this.isAuthenticated = false;
        this.userInfo = null;
        
        // Check if user is returning from Steam OpenID
        this.checkAuthReturn();
    }

    checkAuthReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('openid.mode');
        
        if (mode === 'id_res') {
            this.handleAuthReturn(urlParams);
        }
    }

    async handleAuthReturn(urlParams) {
        try {
            const steamId = this.extractSteamId(urlParams.get('openid.claimed_id'));
            
            if (steamId) {
                // Store authentication state
                localStorage.setItem('steam_authenticated', 'true');
                localStorage.setItem('steam_user_id', steamId);
                
                // Try to get user info from Steam API
                await this.loadUserInfo(steamId);
                
                this.isAuthenticated = true;
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Notify the app that authentication is complete
                if (window.app) {
                    window.app.onSteamAuthComplete(this.userInfo);
                }
            }
        } catch (error) {
            console.error('Steam authentication failed:', error);
            this.clearAuthState();
        }
    }

    extractSteamId(claimedId) {
        if (!claimedId) return null;
        const match = claimedId.match(/\/id\/(\d+)$/);
        return match ? match[1] : null;
    }

    async loadUserInfo(steamId) {
        try {
            // Note: This would normally require a backend service to validate the OpenID response
            // For a client-side implementation, we'll store basic info and try to get profile data
            
            this.userInfo = {
                steamId: steamId,
                personaname: 'Steam User', // Default name
                avatar: `https://via.placeholder.com/64x64/66c0f4/ffffff?text=S`,
                profileurl: `https://steamcommunity.com/profiles/${steamId}`,
                authenticated: true
            };
            
            // Try to get actual profile data if we have an API key available
            if (window.app && window.app.steamAPI && window.app.steamAPI.hasApiKey()) {
                try {
                    const players = await window.app.steamAPI.getPlayerSummaries([steamId]);
                    if (players && players.length > 0) {
                        const player = players[0];
                        this.userInfo.personaname = player.personaname;
                        this.userInfo.avatar = player.avatar;
                        this.userInfo.profileurl = player.profileurl;
                    }
                } catch (error) {
                    console.warn('Could not fetch detailed profile info:', error);
                }
            }
            
            localStorage.setItem('steam_user_info', JSON.stringify(this.userInfo));
            
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }

    loginWithSteam() {
        // Create Steam OpenID login URL
        const params = new URLSearchParams({
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': this.returnUrl,
            'openid.realm': this.realm,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        });

        const steamLoginUrl = `${this.steamOpenIdEndpoint}?${params.toString()}`;
        
        // Redirect to Steam login
        window.location.href = steamLoginUrl;
    }

    isLoggedIn() {
        if (this.isAuthenticated) return true;
        
        // Check stored authentication state
        const isStored = localStorage.getItem('steam_authenticated') === 'true';
        const userInfo = localStorage.getItem('steam_user_info');
        
        if (isStored && userInfo) {
            try {
                this.userInfo = JSON.parse(userInfo);
                this.isAuthenticated = true;
                return true;
            } catch (error) {
                this.clearAuthState();
            }
        }
        
        return false;
    }

    getUserInfo() {
        return this.userInfo;
    }

    getSteamId() {
        return this.userInfo ? this.userInfo.steamId : null;
    }

    logout() {
        this.clearAuthState();
        window.location.reload();
    }

    clearAuthState() {
        this.isAuthenticated = false;
        this.userInfo = null;
        localStorage.removeItem('steam_authenticated');
        localStorage.removeItem('steam_user_id');
        localStorage.removeItem('steam_user_info');
    }

    // Simulate Steam authentication for demo purposes
    simulateSteamAuth(demoUser = null) {
        const mockUser = demoUser || {
            steamId: '76561198000000000',
            personaname: 'Demo Steam User',
            avatar: 'https://via.placeholder.com/64x64/66c0f4/ffffff?text=Demo',
            profileurl: 'https://steamcommunity.com/profiles/76561198000000000',
            authenticated: true,
            isDemo: true
        };

        this.userInfo = mockUser;
        this.isAuthenticated = true;
        
        localStorage.setItem('steam_authenticated', 'demo');
        localStorage.setItem('steam_user_info', JSON.stringify(mockUser));
        
        return mockUser;
    }

    // Get friends list from Steam (requires backend implementation)
    async getFriendsList() {
        if (!this.isAuthenticated) {
            throw new Error('User not authenticated');
        }

        // Note: Getting friends list requires Steam Web API and typically needs backend implementation
        // For now, we'll return empty array or throw informative error
        throw new Error('Friends list access requires Steam Web API backend implementation. Please use the manual friend addition feature or API key method.');
    }
}

// Export for use in other files
window.SteamAuth = SteamAuth;