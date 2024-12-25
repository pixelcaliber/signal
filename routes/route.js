import express from 'express';
import fs from 'fs';

const router = express.Router();
const LOG_FILE_PATH = 'logs/app.log';

router.get('/health', async (req, res) => {
    try {
        res.json("Server is running fine");
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/api/logs', async (req, res) => {
    try {
        const logPayload = req.body;
        console.log(`Log payload received: ${logPayload}`)
        if (!logPayload.level || !logPayload.message || !logPayload.timestamp) {
            return res.status(400).json({ error: 'Invalid log data' });
        }
        appendLogToFile(logPayload);
        res.status(200).json({ message: 'Log received and saved successfully' });
    } catch (error) {
        console.error('Error while handling log request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function appendLogToFile(logPayload) {
    const logMessage = `[${logPayload.timestamp}] [${logPayload.level}] ${logPayload.message} ${JSON.stringify(logPayload.details)}\n`;
    fs.appendFile(LOG_FILE_PATH, logMessage, (err) => {
        if (err) {
            console.error('Failed to write log to file:', err);
        }
    });
}
export default router;