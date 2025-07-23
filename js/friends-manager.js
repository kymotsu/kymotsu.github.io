class FriendsManager {
    constructor() {
        this.friends = this.loadFriends();
        this.selectedFriends = new Set();
        this.steamAPI = new SteamAPI();
    }

    loadFriends() {
        const stored = localStorage.getItem('steam_friends');
        return stored ? JSON.parse(stored) : [];
    }

    saveFriends() {
        localStorage.setItem('steam_friends', JSON.stringify(this.friends));
    }

    addFriend(name, steamId) {
        if (!this.steamAPI.validateSteamId(steamId)) {
            throw new Error('Invalid Steam ID format. Steam ID should be a 17-digit number.');
        }

        // Check if friend already exists
        const existingFriend = this.friends.find(f => f.steamId === steamId);
        if (existingFriend) {
            throw new Error('A friend with this Steam ID already exists.');
        }

        const friend = {
            id: Date.now().toString(),
            name: name.trim(),
            steamId: steamId.trim(),
            addedAt: new Date().toISOString()
        };

        this.friends.push(friend);
        this.saveFriends();
        return friend;
    }

    removeFriend(friendId) {
        const index = this.friends.findIndex(f => f.id === friendId);
        if (index !== -1) {
            const friend = this.friends[index];
            this.friends.splice(index, 1);
            this.selectedFriends.delete(friendId);
            this.saveFriends();
            return friend;
        }
        return null;
    }

    getFriend(friendId) {
        return this.friends.find(f => f.id === friendId);
    }

    getAllFriends() {
        return [...this.friends];
    }

    toggleFriendSelection(friendId) {
        if (this.selectedFriends.has(friendId)) {
            this.selectedFriends.delete(friendId);
        } else {
            this.selectedFriends.add(friendId);
        }
        return this.selectedFriends.has(friendId);
    }

    getSelectedFriends() {
        return this.friends.filter(f => this.selectedFriends.has(f.id));
    }

    clearSelection() {
        this.selectedFriends.clear();
    }

    getSelectedSteamIds() {
        return this.getSelectedFriends().map(f => f.steamId);
    }

    async validateFriend(steamId) {
        try {
            const players = await this.steamAPI.getPlayerSummaries([steamId]);
            if (players.length === 0) {
                throw new Error('Steam user not found or profile is private');
            }
            
            const player = players[0];
            return {
                isValid: true,
                profile: {
                    personaname: player.personaname,
                    avatar: player.avatar,
                    profileurl: player.profileurl,
                    communityvisibilitystate: player.communityvisibilitystate
                }
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    exportFriends() {
        return JSON.stringify(this.friends, null, 2);
    }

    importFriends(jsonData) {
        try {
            const importedFriends = JSON.parse(jsonData);
            
            if (!Array.isArray(importedFriends)) {
                throw new Error('Invalid format: expected an array of friends');
            }

            // Validate each friend object
            for (const friend of importedFriends) {
                if (!friend.name || !friend.steamId) {
                    throw new Error('Invalid friend format: missing name or steamId');
                }
                
                if (!this.steamAPI.validateSteamId(friend.steamId)) {
                    throw new Error(`Invalid Steam ID format for friend: ${friend.name}`);
                }
            }

            // Add unique ID and timestamp if missing
            const processedFriends = importedFriends.map(friend => ({
                id: friend.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: friend.name,
                steamId: friend.steamId,
                addedAt: friend.addedAt || new Date().toISOString()
            }));

            this.friends = processedFriends;
            this.saveFriends();
            this.clearSelection();
            
            return processedFriends.length;
        } catch (error) {
            throw new Error(`Import failed: ${error.message}`);
        }
    }
}

// Export for use in other files
window.FriendsManager = FriendsManager;
