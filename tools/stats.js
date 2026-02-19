const definitions = [
    {
        name: 'get_global_stats',
        description: 'Get global Toleno Network statistics: total tokens mined across all users and total registered user count. This is a public endpoint — no API key required.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'get_leaderboard',
        description: 'Get the TOP 50 leaderboard of Toleno users ranked by token balance. Returns username, display name, token balance, mining power, and rank for each user. This is a public endpoint and requires no API key.',
        inputSchema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Number of users to return (default: 10, max: 50)'
                }
            },
            required: []
        }
    }
];

const handlers = {
    get_global_stats: async (client, _args) => {
        return await client.get('/stats/global-mined');
    },
    get_leaderboard: async (client, args) => {
        const limit = Math.min(args.limit || 10, 50);
        return await client.get(`/auth/top-users?limit=${limit}`);
    }
};

module.exports = { definitions, handlers };
