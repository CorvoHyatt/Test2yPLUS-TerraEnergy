import axios from "axios";
import type { Sale } from "./salesService";

// Usar la URL pública del servicio ML (mapeada al puerto 5005)
const ML_API_URL = "http://localhost:5005";

// Crear una instancia separada de axios para el servicio ML
const mlApiClient = axios.create({
  baseURL: ML_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SalesPrediction {
  date: string;
  predicted_amount: number;
  lower_bound: number;
  upper_bound: number;
}

export interface PredictionParams {
  predictionPeriod: number;
  startDate?: string;
  endDate?: string;
}

export const trainModel = async (sales: Sale[]): Promise<void> => {
  try {
    // Asegurar que los datos estén en el formato correcto
    const formattedSales = sales.map((sale) => ({
      sale_date: sale.sale_date,
      total_amount: Number(sale.total_amount),
    }));

    await mlApiClient.post(`/ml/train`, {
      sales: formattedSales,
    });
  } catch (error) {
    console.error("Error training model:", error);
    // Lanzar un error más específico que no se confunda con errores de autenticación
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Error al entrenar el modelo de predicción";
    throw new Error(`Error de predicción: ${errorMessage}`);
  }
};

export const getPredictions = async (
  params: PredictionParams
): Promise<SalesPrediction[]> => {
  try {
    const response = await mlApiClient.post(`/ml/predict`, params);
    return response.data;
  } catch (error) {
    console.error("Error getting predictions:", error);
    // Lanzar un error más específico que no se confunda con errores de autenticación
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Error al obtener predicciones";
    throw new Error(`Error de predicción: ${errorMessage}`);
  }
};
