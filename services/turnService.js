import config from '../config/default.js';
import fetch from 'node-fetch';

class TurnService {
    async getTurnCredentials() {
        try {
            const response = await fetch(
                `${config.turn.apiUrl}?apiKey=${config.turn.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch TURN credentials: ${response.statusText}`);
            }

            const turnServers = await response.json();
            return turnServers;
        } catch (error) {
            console.error('Error fetching TURN credentials:', error);
            throw error;
        }
    }
}

export default new TurnService();