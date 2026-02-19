const definitions = [
    {
        name: 'get_referral_info',
        description: 'Get referral program details for the authenticated Toleno user. Returns the referral code (same as username), total number of users referred, number of currently active mining referrals, the referral bonus percentage applied to earnings, and the shareable referral link.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'generate_invite_link',
        description: 'Generate a shareable invite link and ready-to-send invite messages (in English and Turkish) for the authenticated Toleno user. Use this when the user wants to invite friends or share their referral link.',
        inputSchema: { type: 'object', properties: {}, required: [] }
    }
];

const handlers = {
    get_referral_info: async (client, _args) => {
        return await client.get('/referral/info');
    },
    generate_invite_link: async (client, _args) => {
        const info = await client.get('/referral/info');
        const code = info.data?.referral_code || info.referral_code;
        return {
            success: true,
            referral_code: code,
            share_message: `Join Toleno Network and mine TOL tokens with AI! Use my referral code "${code}" when you sign up — we both earn bonus mining power.`
        };
    }
};

module.exports = { definitions, handlers };
