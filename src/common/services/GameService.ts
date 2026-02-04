import axios from 'axios';
import { config } from '../config/config';
import { withRetry } from '../utils/resilience';

export interface GameSaveData {
    userId: string;
    genreKey: string;
    gameHistory: any[];
    gameContent: string[];
    currentOptions?: string[];
    currentImage?: string;
    currentImages?: string[];
    updatedAt?: Date;
    _id?: string;
    createdAt?: Date;
}

export interface GameSaveDTO {
    _id: string;
    genreKey: string;
    updatedAt: string;
    createdAt: string;
}

export const GameService = {
    saveGame: async (saveData: GameSaveData, token: string) => {
        return withRetry(async () => {
            const response = await axios.post(`${config.apiUrl}/game/save`, saveData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }, { retries: 3, baseDelay: 1000, name: 'Save Game' });
    },

    loadGame: async (token: string, saveId?: string): Promise<GameSaveData | null> => {
        if (!saveId) return null;
        return withRetry(async () => {
            const response = await axios.get(`${config.apiUrl}/game/load?saveId=${saveId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }, { retries: 3, baseDelay: 1000, name: 'Load Game' });
    },

    listGames: async (token: string): Promise<GameSaveDTO[]> => {
        return withRetry(async () => {
            const response = await axios.get(`${config.apiUrl}/game/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }, { retries: 2, baseDelay: 1000, name: 'List Games' });
    },

    deleteGame: async (token: string, saveId: string) => {
        return withRetry(async () => {
            const response = await axios.post(`${config.apiUrl}/game/delete`, { saveId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }, { retries: 2, baseDelay: 1000, name: 'Delete Game' });
    }
};
