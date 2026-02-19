const definitions = [
    {
        name: 'get_mining_status',
        description: 'Get the current mining session status for the authenticated Toleno user. Returns whether a session is active or completed, start/end times, elapsed and remaining time in milliseconds, tokens mined so far, total tokens to be earned, and whether rewards are ready to claim.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'start_mining',
        description: 'Start a new 24-hour mining session for the authenticated Toleno user. Only one session can be active at a time. If a session is already active or there are unclaimed rewards, the API will return an error. Returns session start time, end time, and the total tokens that will be earned.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
];

const handlers = {
    get_mining_status: async (client, _args) => {
        return await client.get('/mining/status');
    },
    start_mining: async (client, _args) => {
        return await client.post('/mining/start', {});
    },
};

module.exports = { definitions, handlers };
