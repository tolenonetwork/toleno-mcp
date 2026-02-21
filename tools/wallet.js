const definitions = [
    {
        name: 'get_wallet_info',
        description: "Get comprehensive wallet information for the authenticated Toleno user. Returns the available (withdrawable) token balance, locked mining balance, total tokens ever mined, the connected wallet address and preferred network (Solana), withdrawal statistics (today's total, pending count, completed count), and the minimum/maximum withdrawal amounts.",
        inputSchema: { type: 'object', properties: {}, required: [] }
    }
];

// Note: wallet address update/remove and network change are intentionally excluded.
// Modifying withdrawal destinations is high-risk — only allowed through the official
// mobile app with full user confirmation flows.

const handlers = {
    get_wallet_info: async (client, _args) => {
        return await client.get('/wallet/info');
    }
};

module.exports = { definitions, handlers };
