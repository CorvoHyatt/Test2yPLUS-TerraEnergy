import { api } from './api';
import type { Sale } from './salesService';

const ML_API_URL = 'http://localhost:5000';

export interface SalesPrediction {
  date: string;
  predicted_amount: number;
}

export const trainModel = async (sales: Sale[]): Promise<void> => {
  try {
    const response = await fetch(`${ML_API_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sales }),
    });

    if (!response.ok) {
      throw new Error('Error training model');
    }
  } catch (error) {
    console.error('Error training model:', error);
    throw error;
  }
};

export const getPredictions = async (days: number = 7): Promise<SalesPrediction[]> => {
  try {
    const response = await fetch(`${ML_API_URL}/predict?days=${days}`);
    
    if (!response.ok) {
      throw new Error('Error getting predictions');
    }

    const data = await response.json();
    return data.predictions;
  } catch (error) {
    console.error('Error getting predictions:', error);
    throw error;
  }
};