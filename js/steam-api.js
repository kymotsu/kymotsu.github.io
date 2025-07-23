class SteamAPI {
    constructor() {
        this.apiKey = localStorage.getItem('steam_api_key') || '';
        this.baseUrl = 'https://api.steampowered.com';
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/';
        
        // Check for API key from environment variables
        if (!this.apiKey) {
            const envApiKey = this.getEnvironmentVariable('STEAM_API_KEY');
            if (envApiKey) {
                this.apiKey = envApiKey;
                localStorage.setItem('steam_api_key', envApiKey);
            }
        }
    }

    getEnvironmentVariable(name) {
        // In a real deployment, this would be set during build time
        // For now, we'll check if it's defined globally
        return window[name] || '';
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('steam_api_key', key);
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    async makeRequest(endpoint, params = {}) {
        if (!this.apiKey) {
            throw new Error('Steam API key is required. Please configure it in the settings.');
        }

        const urlParams = new URLSearchParams({
            key: this.apiKey,
            format: 'json',
            ...params
        });

        const url = `${this.corsProxy}${this.baseUrl}${endpoint}?${urlParams}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Invalid Steam API key or access denied');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error.message.includes('CORS')) {
                throw new Error('CORS proxy unavailable. Please try again later or use a different proxy.');
            }
            throw error;
        }
    }

    async getPlayerSummaries(steamIds) {
        if (!Array.isArray(steamIds)) {
            steamIds = [steamIds];
        }

        const data = await this.makeRequest('/ISteamUser/GetPlayerSummaries/v0002/', {
            steamids: steamIds.join(',')
        });

        return data.response.players;
    }

    async getOwnedGames(steamId) {
        try {
            const data = await this.makeRequest('/IPlayerService/GetOwnedGames/v0001/', {
                steamid: steamId,
                include_appinfo: true,
                include_played_free_games: true
            });

            if (!data.response.games) {
                throw new Error('User profile is private or has no games');
            }

            return data.response.games;
        } catch (error) {
            if (error.message.includes('private')) {
                throw new Error(`Steam profile is private for user ${steamId}`);
            }
            throw error;
        }
    }

    async getGameDetails(appId) {
        try {
            // Steam store API doesn't require authentication
            const response = await fetch(`${this.corsProxy}https://store.steampowered.com/api/appdetails?appids=${appId}`);
            const data = await response.json();
            
            if (data[appId] && data[appId].success) {
                return data[appId].data;
            }
            return null;
        } catch (error) {
            console.error(`Failed to get details for game ${appId}:`, error);
            return null;
        }
    }

    getGameImageUrl(appId, type = 'header') {
        // Steam CDN URLs for game images
        const imageTypes = {
            header: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`,
            capsule: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_231x87.jpg`,
            hero: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_hero.jpg`
        };
        
        return imageTypes[type] || imageTypes.header;
    }

    async findCommonGames(steamIds, count = 5) {
        if (steamIds.length === 0) {
            throw new Error('No Steam IDs provided');
        }

        if (steamIds.length === 1) {
            throw new Error('At least 2 users are required to find common games');
        }

        try {
            // Fetch game libraries for all users
            const gameLibraries = await Promise.all(
                steamIds.map(async (steamId) => {
                    try {
                        const games = await this.getOwnedGames(steamId);
                        return { steamId, games };
                    } catch (error) {
                        throw new Error(`Failed to fetch games for user ${steamId}: ${error.message}`);
                    }
                })
            );

            // Find common games
            if (gameLibraries.length === 0) {
                return [];
            }

            // Start with the first user's games
            let commonGames = gameLibraries[0].games.map(game => ({
                appid: game.appid,
                name: game.name,
                playtime_forever: game.playtime_forever || 0,
                img_icon_url: game.img_icon_url || '',
                img_logo_url: game.img_logo_url || ''
            }));

            // Filter to only include games that all users own
            for (let i = 1; i < gameLibraries.length; i++) {
                const userGames = gameLibraries[i].games;
                const userGameIds = new Set(userGames.map(game => game.appid));
                
                commonGames = commonGames.filter(game => userGameIds.has(game.appid));
            }

            if (commonGames.length === 0) {
                return [];
            }

            // Sort by total playtime across all users and shuffle
            commonGames = commonGames.sort(() => Math.random() - 0.5);

            // Return the requested number of games
            return commonGames.slice(0, count);

        } catch (error) {
            throw new Error(`Failed to find common games: ${error.message}`);
        }
    }

    validateSteamId(steamId) {
        // Steam ID should be a 17-digit number
        const steamIdRegex = /^\d{17}$/;
        return steamIdRegex.test(steamId);
    }
}

// Export for use in other files
window.SteamAPI = SteamAPI;
