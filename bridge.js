const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Set these as Environment Variables on your hosting provider!
const CLIENT_ID = process.env.ROBLOX_CLIENT_ID;
const CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET;
const HOME_SERVER_URL = process.env.HOME_SERVER_URL; // e.g., http://your-public-ip:port/verify-callback
const BRIDGE_SECRET = process.env.BRIDGE_SECRET; // A random long string for security

app.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    try {
        // 1. Exchange Code for Access Token
        const tokenResponse = await axios.post('https://apis.roblox.com/oauth/v1/token', 
            new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'authorization_code', code: code }).toString());

        // 2. Fetch User Info
        const userResponse = await axios.get('https://apis.roblox.com/oauth/v1/userinfo', 
            { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });

        // 3. Send data to your Home Server
        await axios.post(HOME_SERVER_URL, {
            discordId: state.split(':')[0],
            guildId: state.split(':')[1],
            robloxData: userResponse.data
        }, { headers: { 'x-bridge-secret': BRIDGE_SECRET } });

        res.send('<h1>Authentication successful!</h1><p>You can close this window.</p>');
    } catch (e) { res.status(500).send('Auth failed.'); }
});

app.listen(PORT);
