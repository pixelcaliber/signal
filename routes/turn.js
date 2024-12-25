import express from 'express';
import turnService from '../services/turnService.js';

const router = express.Router();

router.get('/credentials', async (req, res) => {
    try {
        const credentials = await turnService.getTurnCredentials();
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch TURN credentials' });
    }
});

export default router;