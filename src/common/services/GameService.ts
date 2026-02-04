import axios from 'axios';
import { config } from '../config/config';

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
        try {
            const response = await axios.post(`${config.apiUrl}/game/save`, saveData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to save game", error);
            throw error;
        }
    },

    loadGame: async (token: string, saveId?: string): Promise<GameSaveData | null> => {
        try {
            if (!saveId) return null;
            const response = await axios.get(`${config.apiUrl}/game/load?saveId=${saveId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to load game", error);
            return null;
        }
    },

    listGames: async (token: string): Promise<GameSaveDTO[]> => {
        try {
            const response = await axios.get(`${config.apiUrl}/game/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to list games", error);
            return [];
        }
    },

    deleteGame: async (token: string, saveId: string) => {
        try {
            const response = await axios.post(`${config.apiUrl}/game/delete`, { saveId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to delete game", error);
            throw error;
        }
    }
};
