class DemoDataService {
    constructor() {
        this.demoFriends = [
            { id: 'demo1', name: 'Alex Gaming', steamId: '76561198000000001', addedAt: '2024-01-15T10:30:00Z' },
            { id: 'demo2', name: 'Sam Player', steamId: '76561198000000002', addedAt: '2024-01-20T14:20:00Z' },
            { id: 'demo3', name: 'Riley Gamer', steamId: '76561198000000003', addedAt: '2024-02-01T09:15:00Z' },
            { id: 'demo4', name: 'Jordan Steam', steamId: '76561198000000004', addedAt: '2024-02-05T16:45:00Z' }
        ];

        this.demoGames = [
            {
                appid: 730,
                name: "Counter-Strike 2",
                playtime_forever: 15420,
                img_icon_url: "69f7ebe2735c366c65c0b33dae00e12dc40edbe4",
                img_logo_url: "7fa1446c61c82a22b6f7bb61a6b4a898c1147d44"
            },
            {
                appid: 570,
                name: "Dota 2",
                playtime_forever: 8750,
                img_icon_url: "0bbb630d63262dd66d2fdd0f7d37e8661a410075",
                img_logo_url: "d4f836839254be08d8e9dd333ecc9a01782c26d2"
            },
            {
                appid: 440,
                name: "Team Fortress 2",
                playtime_forever: 4560,
                img_icon_url: "e3f595a92552da3d664ad00277fad2107345f743",
                img_logo_url: "07385eb55b5ba974aebbe74d3c99626bda7920b8"
            },
            {
                appid: 271590,
                name: "Grand Theft Auto V",
                playtime_forever: 12300,
                img_icon_url: "cfa928ab4119dd137e50d728e8fe703e4e970aff",
                img_logo_url: "6d655ed8e4b5827096db8c06768b6e1a6ed131c4"
            },
            {
                appid: 377160,
                name: "Fall Guys",
                playtime_forever: 2180,
                img_icon_url: "2a1fb15aa9bb1b77be1bdaaa990a34d0d65b41f0",
                img_logo_url: "e40fcdfbf0d2c0ca5b38aa3e4c9f403c3fe50d9b"
            },
            {
                appid: 1085660,
                name: "Destiny 2",
                playtime_forever: 9870,
                img_icon_url: "e5be31368b44d2a2e5a3e2a8e5e5b7b6f8c3c9f3",
                img_logo_url: "6b98fe5f1ad2b3b5b5b5b5b5b5b5b5b5b5b5b5b5"
            },
            {
                appid: 578080,
                name: "PUBG: BATTLEGROUNDS",
                playtime_forever: 6420,
                img_icon_url: "c69894ecd7c04e519165f7e0f7fc8a3db9f3a0b6",
                img_logo_url: "5f3d1394bf6fa5b3f1f8e8c7c8e8f8e8f8e8f8e8"
            },
            {
                appid: 892970,
                name: "Valheim",
                playtime_forever: 7890,
                img_icon_url: "a91e7a7bc0eea3bb93fc40c5c2e3c4e5e8f3e8e8",
                img_logo_url: "9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a"
            }
        ];
    }

    getDemoFriends() {
        return [...this.demoFriends];
    }

    getRandomDemoGames(count = 5) {
        // Shuffle and return random games
        const shuffled = [...this.demoGames].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    getDemoPlayerSummary(steamId) {
        const friend = this.demoFriends.find(f => f.steamId === steamId);
        if (!friend) return null;

        return {
            steamid: steamId,
            personaname: friend.name,
            avatar: `https://via.placeholder.com/64x64/66c0f4/ffffff?text=${friend.name.charAt(0)}`,
            profileurl: `https://steamcommunity.com/profiles/${steamId}`,
            communityvisibilitystate: 3
        };
    }

    async simulateApiDelay() {
        // Simulate realistic API response time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    }
}

// Export for use in other files
window.DemoDataService = DemoDataService;