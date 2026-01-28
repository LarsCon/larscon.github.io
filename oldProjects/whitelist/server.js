const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 5001;
const WHITELIST_PASSWORD = process.env.WHITELIST_PASSWORD || 'CHANGE_ME';
const SCREEN_NAME = 'minecraft';

// CORS - must be before express.json()
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Validate password endpoint
app.post('/api/validate-password', (req, res) => {
    const { password } = req.body;

    if (password === WHITELIST_PASSWORD) {
        return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, error: 'Invalid access code' });
});

// Whitelist endpoint
app.post('/api/whitelist', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
        return res.status(400).json({ error: 'Invalid Minecraft username format' });
    }

    const command = `screen -S ${SCREEN_NAME} -X stuff "whitelist add ${username}\n"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return res.status(500).json({
                error: 'Failed to execute whitelist command. Server may be offline.'
            });
        }

        res.json({
            message: `${username} has been added to the whitelist. You can now join the server.`,
            username
        });
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Whitelist server running on port ${PORT}`);
});
