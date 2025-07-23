class SteamGameFinder {
    constructor() {
        this.friendsManager = new FriendsManager();
        this.steamAPI = new SteamAPI();
        this.steamAuth = new SteamAuth();
        this.demoService = new DemoDataService();
        this.currentGames = [];
        this.isDemoMode = localStorage.getItem('demo_mode') === 'true';
        this.authMode = localStorage.getItem('auth_mode') || 'none'; // 'steam', 'apikey', 'demo', 'none'
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthentication();
        this.renderFriends();
        this.updateSelectedFriends();
    }

    initializeElements() {
        // Modal elements
        this.steamLoginModal = document.getElementById('steam-login-modal');
        this.apiKeyModal = document.getElementById('api-key-modal');
        this.demoModal = document.getElementById('demo-modal');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveApiKeyBtn = document.getElementById('save-api-key-btn');
        
        // Login buttons
        this.steamLoginBtn = document.getElementById('steam-login-btn');
        this.useApiKeyBtn = document.getElementById('use-api-key-btn');
        this.demoModeBtn = document.getElementById('demo-mode-btn');
        this.backToLoginBtn = document.getElementById('back-to-login');
        this.startDemoBtn = document.getElementById('start-demo-btn');
        this.setupRealBtn = document.getElementById('setup-real-btn');
        this.toggleApiVisibilityBtn = document.getElementById('toggle-api-visibility');

        // Friends section elements
        this.addFriendBtn = document.getElementById('add-friend-btn');
        this.addFriendForm = document.getElementById('add-friend-form');
        this.friendNameInput = document.getElementById('friend-name');
        this.steamIdInput = document.getElementById('steam-id');
        this.saveFriendBtn = document.getElementById('save-friend-btn');
        this.cancelFriendBtn = document.getElementById('cancel-friend-btn');
        this.friendsList = document.getElementById('friends-list');
        this.noFriends = document.getElementById('no-friends');

        // Session section elements
        this.findGamesBtn = document.getElementById('find-games-btn');
        this.selectedFriendsDiv = document.getElementById('selected-friends');
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
        this.resultsSection = document.getElementById('results-section');
        this.gamesGrid = document.getElementById('games-grid');
        this.refreshGamesBtn = document.getElementById('refresh-games-btn');
    }

    bindEvents() {
        // Authentication events
        this.steamLoginBtn?.addEventListener('click', () => this.steamAuth.loginWithSteam());
        this.useApiKeyBtn?.addEventListener('click', () => this.showApiKeyModal());
        this.demoModeBtn?.addEventListener('click', () => this.showDemoModal());
        this.backToLoginBtn?.addEventListener('click', () => this.showSteamLoginModal());
        this.startDemoBtn?.addEventListener('click', () => this.startDemoMode());
        this.setupRealBtn?.addEventListener('click', () => this.showSteamLoginModal());
        
        // API Key events
        this.saveApiKeyBtn?.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        this.toggleApiVisibilityBtn?.addEventListener('click', () => this.toggleApiKeyVisibility());

        // Friends management events
        this.addFriendBtn.addEventListener('click', () => this.showAddFriendForm());
        this.saveFriendBtn.addEventListener('click', () => this.saveFriend());
        this.cancelFriendBtn.addEventListener('click', () => this.hideAddFriendForm());

        // Input validation
        this.friendNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.steamIdInput.focus();
        });
        this.steamIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveFriend();
        });

        // Game finding events
        this.findGamesBtn.addEventListener('click', () => this.findCommonGames());
        this.retryBtn.addEventListener('click', () => this.findCommonGames());
        this.refreshGamesBtn.addEventListener('click', () => this.refreshGameSuggestions());
    }

    checkAuthentication() {
        // Check different authentication states
        if (this.isDemoMode || this.authMode === 'demo') {
            this.startDemoMode();
        } else if (this.steamAuth.isLoggedIn()) {
            this.authMode = 'steam';
            localStorage.setItem('auth_mode', 'steam');
            this.hideAllModals();
            this.showSteamUserInfo();
        } else if (this.steamAPI.hasApiKey()) {
            this.authMode = 'apikey';
            localStorage.setItem('auth_mode', 'apikey');
            this.hideAllModals();
        } else {
            this.showSteamLoginModal();
        }
    }

    showSteamLoginModal() {
        this.hideAllModals();
        this.steamLoginModal?.classList.remove('hidden');
    }

    showApiKeyModal() {
        this.hideAllModals();
        this.apiKeyModal?.classList.remove('hidden');
        this.apiKeyInput?.focus();
    }

    showDemoModal() {
        this.hideAllModals();
        this.demoModal?.classList.remove('hidden');
    }

    hideAllModals() {
        this.steamLoginModal?.classList.add('hidden');
        this.apiKeyModal?.classList.add('hidden');
        this.demoModal?.classList.add('hidden');
    }

    onSteamAuthComplete(userInfo) {
        this.authMode = 'steam';
        localStorage.setItem('auth_mode', 'steam');
        this.hideAllModals();
        this.showSteamUserInfo();
        this.showSuccess(`Welcome ${userInfo.personaname}! You're now logged in with Steam.`);
    }

    showSteamUserInfo() {
        const userInfo = this.steamAuth.getUserInfo();
        if (!userInfo) return;

        // Add user info to header
        const header = document.querySelector('.header');
        let userInfoDiv = document.querySelector('.steam-user-info');
        
        if (!userInfoDiv) {
            userInfoDiv = document.createElement('div');
            userInfoDiv.className = 'steam-user-info';
            header.appendChild(userInfoDiv);
        }

        userInfoDiv.innerHTML = `
            <img src="${userInfo.avatar}" alt="${userInfo.personaname}" class="steam-user-avatar">
            <div class="steam-user-details">
                <h3>${this.escapeHtml(userInfo.personaname)}</h3>
                <p>Logged in with Steam</p>
            </div>
            <button onclick="app.logout()" class="btn btn-secondary logout-btn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }

    startDemoMode() {
        this.isDemoMode = true;
        this.authMode = 'demo';
        localStorage.setItem('demo_mode', 'true');
        localStorage.setItem('auth_mode', 'demo');
        
        // Simulate Steam auth for demo
        this.steamAuth.simulateSteamAuth();
        
        // Load demo friends
        this.loadDemoFriends();
        
        this.hideAllModals();
        this.showSteamUserInfo();
        this.addDemoIndicator();
        this.showSuccess('Demo mode activated! Explore the interface with sample data.');
    }

    loadDemoFriends() {
        const demoFriends = this.demoService.getDemoFriends();
        // Clear existing friends and load demo ones
        this.friendsManager.friends = demoFriends;
        this.friendsManager.saveFriends();
        this.renderFriends();
    }

    addDemoIndicator() {
        let indicator = document.querySelector('.demo-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'demo-indicator';
            indicator.innerHTML = '<i class="fas fa-flask"></i> Demo Mode';
            document.body.appendChild(indicator);
        }
    }

    logout() {
        this.steamAuth.logout();
        localStorage.clear();
        window.location.reload();
    }

    toggleApiKeyVisibility() {
        const input = this.apiKeyInput;
        const button = this.toggleApiVisibilityBtn;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide key';
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="fas fa-eye"></i> Show key';
        }
    }

    checkApiKey() {
        if (!this.steamAPI.hasApiKey()) {
            this.showApiKeyModal();
        }
    }

    showApiKeyModal() {
        this.apiKeyModal.classList.remove('hidden');
        this.apiKeyInput.focus();
    }

    hideApiKeyModal() {
        this.apiKeyModal.classList.add('hidden');
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (!key) {
            this.showError('Please enter a valid Steam API key');
            return;
        }

        this.steamAPI.setApiKey(key);
        this.authMode = 'apikey';
        localStorage.setItem('auth_mode', 'apikey');
        this.hideAllModals();
        this.showSuccess('Steam API key saved successfully!');
    }

    showAddFriendForm() {
        this.addFriendForm.classList.remove('hidden');
        this.friendNameInput.focus();
        this.addFriendBtn.style.display = 'none';
    }

    hideAddFriendForm() {
        this.addFriendForm.classList.add('hidden');
        this.addFriendBtn.style.display = 'inline-flex';
        this.clearFriendForm();
    }

    clearFriendForm() {
        this.friendNameInput.value = '';
        this.steamIdInput.value = '';
    }

    async saveFriend() {
        const name = this.friendNameInput.value.trim();
        const steamId = this.steamIdInput.value.trim();

        if (!name || !steamId) {
            this.showError('Please fill in both name and Steam ID');
            return;
        }

        try {
            this.saveFriendBtn.disabled = true;
            this.saveFriendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

            // Validate Steam ID format first
            if (!this.steamAPI.validateSteamId(steamId)) {
                throw new Error('Invalid Steam ID format. Steam ID should be a 17-digit number.');
            }

            // Add friend (this will throw if duplicate)
            const friend = this.friendsManager.addFriend(name, steamId);
            
            // Optionally validate with Steam API (but don't block if it fails)
            try {
                const validation = await this.friendsManager.validateFriend(steamId);
                if (!validation.isValid) {
                    console.warn(`Steam validation failed for ${name}: ${validation.error}`);
                }
            } catch (error) {
                console.warn('Steam validation failed:', error.message);
            }

            this.hideAddFriendForm();
            this.renderFriends();
            this.showSuccess(`Friend "${name}" added successfully!`);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.saveFriendBtn.disabled = false;
            this.saveFriendBtn.innerHTML = '<i class="fas fa-save"></i> Save Friend';
        }
    }

    renderFriends() {
        const friends = this.friendsManager.getAllFriends();
        
        if (friends.length === 0) {
            this.friendsList.innerHTML = '<div class="no-friends" id="no-friends"><i class="fas fa-user-plus"></i><p>No friends added yet. Add some friends to get started!</p></div>';
            return;
        }

        this.friendsList.innerHTML = friends.map(friend => `
            <div class="friend-card ${this.friendsManager.selectedFriends.has(friend.id) ? 'selected' : ''}" 
                 data-friend-id="${friend.id}">
                <div class="friend-info">
                    <div class="friend-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="friend-details">
                        <h3>${this.escapeHtml(friend.name)}</h3>
                        <p>Steam ID: ${friend.steamId}</p>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-danger btn-small" onclick="app.removeFriend('${friend.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for friend selection
        this.friendsList.querySelectorAll('.friend-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger selection if clicking on action buttons
                if (e.target.closest('.friend-actions')) return;
                
                const friendId = card.dataset.friendId;
                this.toggleFriendSelection(friendId);
            });
        });
    }

    toggleFriendSelection(friendId) {
        const isSelected = this.friendsManager.toggleFriendSelection(friendId);
        const card = document.querySelector(`[data-friend-id="${friendId}"]`);
        
        if (card) {
            card.classList.toggle('selected', isSelected);
        }
        
        this.updateSelectedFriends();
        this.updateFindGamesButton();
    }

    removeFriend(friendId) {
        if (confirm('Are you sure you want to remove this friend?')) {
            const friend = this.friendsManager.removeFriend(friendId);
            if (friend) {
                this.renderFriends();
                this.updateSelectedFriends();
                this.updateFindGamesButton();
                this.showSuccess(`Friend "${friend.name}" removed successfully!`);
            }
        }
    }

    updateSelectedFriends() {
        const selectedFriends = this.friendsManager.getSelectedFriends();
        
        if (selectedFriends.length === 0) {
            this.selectedFriendsDiv.innerHTML = '<p>Select friends to find common games</p>';
        } else {
            const tagsHtml = selectedFriends.map(friend => `
                <span class="friend-tag">
                    <i class="fas fa-user"></i>
                    ${this.escapeHtml(friend.name)}
                </span>
            `).join('');
            
            this.selectedFriendsDiv.innerHTML = `
                <p>Selected friends for gaming session:</p>
                <div class="selected-friend-tags">${tagsHtml}</div>
            `;
        }
    }

    updateFindGamesButton() {
        const selectedCount = this.friendsManager.getSelectedFriends().length;
        this.findGamesBtn.disabled = selectedCount < 2;
        
        if (selectedCount < 2) {
            this.findGamesBtn.innerHTML = '<i class="fas fa-search"></i> Select at least 2 friends';
        } else {
            this.findGamesBtn.innerHTML = `<i class="fas fa-search"></i> Find Games (${selectedCount} friends)`;
        }
    }

    async findCommonGames() {
        const selectedSteamIds = this.friendsManager.getSelectedSteamIds();
        
        if (selectedSteamIds.length < 2) {
            this.showError('Please select at least 2 friends to find common games');
            return;
        }

        this.showLoadingState();

        try {
            let commonGames;
            
            if (this.isDemoMode || this.authMode === 'demo') {
                // Use demo data
                await this.demoService.simulateApiDelay();
                commonGames = this.demoService.getRandomDemoGames(5);
            } else {
                // Use real Steam API
                commonGames = await this.steamAPI.findCommonGames(selectedSteamIds, 5);
            }
            
            this.currentGames = commonGames;
            this.displayGames(commonGames);
        } catch (error) {
            this.showErrorState(error.message);
        }
    }

    async refreshGameSuggestions() {
        if (this.currentGames.length === 0) {
            await this.findCommonGames();
            return;
        }

        this.showLoadingState();

        try {
            let commonGames;
            
            if (this.isDemoMode || this.authMode === 'demo') {
                // Use demo data
                await this.demoService.simulateApiDelay();
                commonGames = this.demoService.getRandomDemoGames(5);
            } else {
                // Use real Steam API
                const selectedSteamIds = this.friendsManager.getSelectedSteamIds();
                commonGames = await this.steamAPI.findCommonGames(selectedSteamIds, 5);
            }
            
            this.currentGames = commonGames;
            this.displayGames(commonGames);
        } catch (error) {
            this.showErrorState(error.message);
        }
    }

    showLoadingState() {
        this.hideAllStates();
        this.loadingState.classList.remove('hidden');
    }

    showErrorState(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    hideAllStates() {
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
    }

    displayGames(games) {
        this.hideAllStates();
        
        if (games.length === 0) {
            this.gamesGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-gamepad"></i>
                    <p>No common games found among selected friends.</p>
                    <p>Try selecting different friends or check if their profiles are public.</p>
                </div>
            `;
        } else {
            const gamesHtml = games.map(game => this.createGameCard(game)).join('');
            this.gamesGrid.innerHTML = gamesHtml;
            
            // Add demo styling if in demo mode
            if (this.isDemoMode || this.authMode === 'demo') {
                this.gamesGrid.classList.add('demo-mode-games');
            } else {
                this.gamesGrid.classList.remove('demo-mode-games');
            }
        }
        
        this.resultsSection.classList.remove('hidden');
    }

    createGameCard(game) {
        const imageUrl = this.steamAPI.getGameImageUrl(game.appid, 'capsule');
        const playtimeHours = Math.floor(game.playtime_forever / 60);
        
        return `
            <div class="game-card">
                <div class="game-image">
                    <img src="${imageUrl}" 
                         alt="${this.escapeHtml(game.name)}"
                         onerror="this.parentElement.innerHTML='<i class=\\"fas fa-gamepad\\"></i>'"
                         loading="lazy">
                </div>
                <div class="game-info">
                    <h4>${this.escapeHtml(game.name)}</h4>
                    <div class="game-stats">
                        <span><i class="fas fa-clock"></i> ${playtimeHours}h played</span>
                        <span><i class="fas fa-external-link-alt"></i> Steam</span>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        // Create or update error notification
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        // Create or update success notification
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add notification styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1001;
                    min-width: 300px;
                    max-width: 500px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                }
                .notification-error {
                    background: var(--danger-color);
                    color: white;
                }
                .notification-success {
                    background: var(--success-color);
                    color: white;
                }
                .notification-info {
                    background: var(--accent-color);
                    color: white;
                }
                .notification-content {
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    margin-left: auto;
                    opacity: 0.8;
                    padding: 4px;
                }
                .notification-close:hover {
                    opacity: 1;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SteamGameFinder();
});
