const definitions = [
    {
        name: 'get_profile',
        description: 'Get the full profile of the authenticated Toleno user. Returns username, display name, email, token balance, total tokens mined, mining power multiplier, referral count, active referral count, wallet address, KYC status, phone verification status, premium subscription status, current daily streak, and account creation date.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'daily_summary',
        description: 'Get a comprehensive daily summary for the authenticated Toleno user. Combines profile data and mining status into a single overview: token balance, total mined, mining power, daily streak, referral stats, and current mining session details (active/completed/claimable, tokens mined, remaining time). Perfect for a quick daily check-in.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    }
];

const handlers = {
    get_profile: async (client, _args) => {
        return await client.get('/auth/profile');
    },
    daily_summary: async (client, _args) => {
        const [profile, mining] = await Promise.all([
            client.get('/auth/profile'),
            client.get('/mining/status').catch(() => null)
        ]);
        const user = profile.data?.user || profile.user || profile.data || {};
        const mine = mining?.data || mining || {};
        return {
            success: true,
            summary: {
                username: user.username,
                token_balance: user.token_balance,
                total_mined: user.total_mined,
                mining_power: user.mining_power,
                current_streak: user.current_streak,
                referral_count: user.referral_count,
                active_referral_count: user.active_referral_count,
                mining: {
                    is_active: mine.is_active || false,
                    is_completed: mine.is_completed || false,
                    can_claim: mine.can_claim || false,
                    tokens_mined: mine.tokens_mined || 0,
                    total_tokens: mine.total_tokens || 0,
                    remaining_time_ms: mine.remaining_time_ms || 0
                }
            }
        };
    }
};

module.exports = { definitions, handlers };
