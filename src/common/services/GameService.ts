import axios from 'axios';
import { config } from '../config/config';

export interface GameSaveData {
    userId: string;
    genreKey: string;
    gameHistory: any[];
    gameContent: string[];
    currentOptions?: string[];
    currentImage?: string;
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
    saveGame: async (saveData: GameSaveData) => {
        try {
            const response = await axios.post(`${config.apiUrl}/game/save`, saveData);
            return response.data;
        } catch (error) {
            console.error("Failed to save game", error);
            throw error;
        }
    },

    loadGame: async (userId: string, saveId?: string): Promise<GameSaveData | null> => {
        try {
            // New signature: requires saveId if we want a specific one, or just list?
            // "loadGame" now implies loading a specific game.
            if (!saveId) return null; // We enforce picking one
            const response = await axios.get(`${config.apiUrl}/game/load?userId=${userId}&saveId=${saveId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to load game", error);
            return null;
        }
    },

    listGames: async (userId: string): Promise<GameSaveDTO[]> => {
        try {
            const response = await axios.get(`${config.apiUrl}/game/list?userId=${userId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to list games", error);
            return [];
        }
    },

    deleteGame: async (userId: string, saveId: string) => {
        try {
            const response = await axios.post(`${config.apiUrl}/game/delete`, { userId, saveId });
            return response.data;
        } catch (error) {
            console.error("Failed to delete game", error);
            throw error;
        }
    }
};
