const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const BEARER_TOKEN = 'YOUR_TWITTER_BEARER_TOKEN'; // Ganti dengan token Twitter API

app.get('/verify-twitter', async (req, res) => {
    const { username } = req.query;

    try {
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
        });

        const userId = response.data.data.id;

        // Cek apakah user mengikuti akun proyek
        const followingResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/following`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
        });

        const isFollowing = followingResponse.data.data.some(user => user.username === 'YourTwitterHandle');
        
        res.json({ success: isFollowing });
    } catch (error) {
        res.status(500).json({ error: 'Twitter verification failed' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
