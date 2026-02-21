const definitions = [
    {
        name: 'get_mining_status',
        description: 'Get the current mining session status for the authenticated Toleno user. Returns whether a session is active or completed, start/end times, elapsed and remaining time in milliseconds, tokens mined so far, total tokens to be earned, and whether rewards are ready to claim.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'start_mining',
        description: 'Start a new 24-hour mining session for the authenticated Toleno user. Can only be called when no active session exists. Returns the session details including start/end times and expected token earnings.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'claim_mining',
        description: 'Claim mining rewards after a completed 24-hour session. Can only be called when a session has ended and rewards are ready to collect. Returns the amount of tokens claimed and the new balance.',
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
    claim_mining: async (client, _args) => {
        return await client.post('/mining/claim', {});
    },
};

module.exports = { definitions, handlers };
